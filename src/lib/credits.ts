/**
 * 积分与卡密的核心逻辑。
 *
 * 余额只通过这里变动，每次变动都在一个数据库事务里同时完成：
 *   1. 带条件地更新余额（余额不够、流水号重复时不更新）
 *   2. 更新成功时写一条流水（记录变动后余额）
 * 这样并发请求不会把余额扣成负数，同一个流水号（请求 ID、卡密）也只会记一次账。
 *
 * Payload 在 SQLite 下默认不开事务，这里直接用 libsql 的 batch（BEGIN IMMEDIATE … COMMIT）。
 * 两条语句之间用 SQLite 的 changes() 衔接：第二条只在第一条确实改到一行时才执行。
 * 以后换成 Postgres，需要把这个文件里的 SQL 改成对应的事务写法。
 */
import { randomUUID, timingSafeEqual } from 'crypto'
import type { SQLiteAdapter } from '@payloadcms/db-sqlite'
import type { Payload, PayloadHandler } from 'payload'

import { userIsAdmin } from '../access'
import { generateRedeemCode, normalizeRedeemCode } from './random'

type Statement = Parameters<SQLiteAdapter['client']['batch']>[0][number]
type Value = string | number | null

type EntryType = 'signup' | 'redeem' | 'consume' | 'refund' | 'admin'

// ---------- 表名和列名：从 Payload 生成的 drizzle 表结构里取，避免写死 ----------

function tableOf(payload: Payload, slug: string) {
  const adapter = payload.db as unknown as SQLiteAdapter
  const name = slug.replace(/-/g, '_')
  const table = adapter.tables[name] as Record<string, { name: string }> | undefined
  if (!table) throw new Error(`找不到数据表：${name}`)
  const col = (key: string) => {
    const column = table[key]
    if (!column?.name) throw new Error(`数据表 ${name} 没有字段：${key}`)
    return `"${column.name}"`
  }
  return { name: `"${name}"`, col }
}

function schema(payload: Payload) {
  const u = tableOf(payload, 'users')
  const l = tableOf(payload, 'credit-transactions')
  const c = tableOf(payload, 'redeem-codes')
  const b = tableOf(payload, 'redeem-batches')
  return {
    users: { t: u.name, id: u.col('id'), credits: u.col('credits'), updatedAt: u.col('updatedAt') },
    ledger: {
      t: l.name,
      id: l.col('id'),
      user: l.col('user'),
      amount: l.col('amount'),
      balanceAfter: l.col('balanceAfter'),
      type: l.col('type'),
      note: l.col('note'),
      product: l.col('product'),
      redeemCode: l.col('redeemCode'),
      operator: l.col('operator'),
      key: l.col('key'),
      createdAt: l.col('createdAt'),
      updatedAt: l.col('updatedAt'),
    },
    codes: {
      t: c.name,
      id: c.col('id'),
      code: c.col('code'),
      batch: c.col('batch'),
      credits: c.col('credits'),
      status: c.col('status'),
      usedBy: c.col('usedBy'),
      usedAt: c.col('usedAt'),
      createdAt: c.col('createdAt'),
      updatedAt: c.col('updatedAt'),
    },
    batches: {
      t: b.name,
      id: b.col('id'),
      expiresAt: b.col('expiresAt'),
      disabled: b.col('disabled'),
    },
  }
}

function clientOf(payload: Payload) {
  return (payload.db as unknown as SQLiteAdapter).client
}

// ---------- 记账 ----------

type Entry = {
  userId: number
  amount: number
  type: EntryType
  key: string
  note?: string | null
  product?: string | null
  redeemCodeId?: number | null
  operatorId?: number | null
}

/**
 * 生成“改余额 + 写流水”的两条语句。
 * 余额更新条件：用户存在、变动后不小于 0、这个流水号没用过；
 * requireChanged 为 true 时，还要求上一条语句确实改到了一行（比如卡密刚被这次请求占用）。
 */
function entryStatements(
  s: ReturnType<typeof schema>,
  entry: Entry,
  now: string,
  requireChanged = false,
): Statement[] {
  const { users: u, ledger: l } = s
  return [
    {
      sql: `UPDATE ${u.t} SET ${u.credits} = COALESCE(${u.credits}, 0) + ?, ${u.updatedAt} = ?
            WHERE ${u.id} = ? AND COALESCE(${u.credits}, 0) + ? >= 0
              AND NOT EXISTS (SELECT 1 FROM ${l.t} WHERE ${l.key} = ?)
              ${requireChanged ? 'AND changes() = 1' : ''}
            RETURNING ${u.credits} AS balance`,
      args: [entry.amount, now, entry.userId, entry.amount, entry.key],
    },
    {
      sql: `INSERT INTO ${l.t} (${l.user}, ${l.amount}, ${l.balanceAfter}, ${l.type}, ${l.note}, ${l.product},
              ${l.redeemCode}, ${l.operator}, ${l.key}, ${l.createdAt}, ${l.updatedAt})
            SELECT ${u.id}, ?, ${u.credits}, ?, ?, ?, ?, ?, ?, ?, ?
            FROM ${u.t} WHERE ${u.id} = ? AND changes() = 1`,
      args: [
        entry.amount,
        entry.type,
        entry.note ?? null,
        entry.product ?? null,
        entry.redeemCodeId ?? null,
        entry.operatorId ?? null,
        entry.key,
        now,
        now,
        entry.userId,
      ],
    },
  ]
}

async function currentBalance(payload: Payload, userId: number): Promise<number | null> {
  const s = schema(payload)
  const result = await clientOf(payload).execute({
    sql: `SELECT ${s.users.credits} AS balance FROM ${s.users.t} WHERE ${s.users.id} = ?`,
    args: [userId],
  })
  const row = result.rows[0]
  return row ? Number(row.balance ?? 0) : null
}

async function findEntryByKey(payload: Payload, key: string) {
  const { docs } = await payload.find({
    collection: 'credit-transactions',
    where: { key: { equals: key } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return docs[0] ?? null
}

const isUniqueViolation = (err: unknown) =>
  err instanceof Error && /UNIQUE constraint failed/i.test(err.message)

export type PostResult =
  | { ok: true; balance: number; duplicate: boolean; amount: number }
  | { ok: false; reason: 'insufficient' | 'no_user'; balance: number }

/** 记一笔账：成功返回新余额；流水号已用过时返回 duplicate，不会重复记账 */
export async function postEntry(payload: Payload, entry: Entry): Promise<PostResult> {
  if (!Number.isInteger(entry.amount) || entry.amount === 0) {
    throw new Error('积分变动必须是不为 0 的整数')
  }
  const s = schema(payload)
  const now = new Date().toISOString()
  let balance: number | undefined
  try {
    const [update] = await clientOf(payload).batch(entryStatements(s, entry, now), 'write')
    if (update.rows[0]) balance = Number(update.rows[0].balance)
  } catch (err) {
    if (!isUniqueViolation(err)) throw err
  }
  if (balance !== undefined) return { ok: true, balance, duplicate: false, amount: entry.amount }

  // 没有记账：要么流水号用过了（重复请求），要么余额不够
  const existing = await findEntryByKey(payload, entry.key)
  const current = await currentBalance(payload, entry.userId)
  if (current === null) return { ok: false, reason: 'no_user', balance: 0 }
  if (existing) return { ok: true, balance: current, duplicate: true, amount: existing.amount }
  return { ok: false, reason: 'insufficient', balance: current }
}

// ---------- 对外的几种操作 ----------

/** 注册赠送：每个用户只送一次 */
export function grantSignupBonus(payload: Payload, userId: number, amount: number) {
  if (amount <= 0) return null
  return postEntry(payload, {
    userId,
    amount,
    type: 'signup',
    key: `signup:${userId}`,
    note: '注册赠送',
  })
}

/** 系统加积分（示例数据、脚本用） */
export function grantCredits(
  payload: Payload,
  args: { userId: number; amount: number; note: string; key?: string },
) {
  return postEntry(payload, {
    userId: args.userId,
    amount: args.amount,
    type: 'admin',
    key: args.key ?? `admin:${randomUUID()}`,
    note: args.note,
  })
}

/**
 * 后台手动新建流水后调用：流水已经写好，这里原子地改余额并回填“变动后余额”。
 * 扣减后会变成负数时不改，返回 ok: false，由调用方撤回这条流水。
 */
export async function applyAdminAdjustment(
  payload: Payload,
  args: { transactionId: number; userId: number; amount: number },
): Promise<{ ok: boolean; balance: number }> {
  const s = schema(payload)
  const { users: u, ledger: l } = s
  const now = new Date().toISOString()
  const [update] = await clientOf(payload).batch(
    [
      {
        sql: `UPDATE ${u.t} SET ${u.credits} = COALESCE(${u.credits}, 0) + ?, ${u.updatedAt} = ?
              WHERE ${u.id} = ? AND COALESCE(${u.credits}, 0) + ? >= 0
                AND EXISTS (SELECT 1 FROM ${l.t} WHERE ${l.id} = ? AND ${l.balanceAfter} IS NULL)
              RETURNING ${u.credits} AS balance`,
        args: [args.amount, now, args.userId, args.amount, args.transactionId],
      },
      {
        sql: `UPDATE ${l.t} SET ${l.balanceAfter} = (SELECT ${u.credits} FROM ${u.t} WHERE ${u.id} = ?)
              WHERE ${l.id} = ? AND changes() = 1`,
        args: [args.userId, args.transactionId],
      },
    ],
    'write',
  )
  if (update.rows[0]) return { ok: true, balance: Number(update.rows[0].balance) }
  return { ok: false, balance: (await currentBalance(payload, args.userId)) ?? 0 }
}

export type ConsumeResult =
  | { ok: true; charged: number; balance: number; duplicate: boolean }
  | { ok: false; error: 'insufficient_credits' | 'invalid_user'; balance: number }

/**
 * 按次扣费。requestId 是调用方的请求 ID：同一个 requestId 重试多次只扣一次。
 */
export async function consumeCredits(
  payload: Payload,
  args: { userId: number; amount: number; requestId: string; product: string; note: string },
): Promise<ConsumeResult> {
  if (args.amount <= 0) {
    const balance = (await currentBalance(payload, args.userId)) ?? 0
    return { ok: true, charged: 0, balance, duplicate: false }
  }
  const result = await postEntry(payload, {
    userId: args.userId,
    amount: -args.amount,
    type: 'consume',
    key: `consume:${args.requestId}`,
    product: args.product,
    note: args.note,
  })
  if (result.ok) {
    return {
      ok: true,
      charged: -result.amount,
      balance: result.balance,
      duplicate: result.duplicate,
    }
  }
  return {
    ok: false,
    error: result.reason === 'no_user' ? 'invalid_user' : 'insufficient_credits',
    balance: result.balance,
  }
}

export type RefundResult =
  | { ok: true; refunded: number; balance: number; duplicate: boolean }
  | { ok: false; error: 'not_found' }

/** 调用失败时退回某次扣费。每个 requestId 只能退一次 */
export async function refundCredits(
  payload: Payload,
  args: { requestId: string; reason?: string },
): Promise<RefundResult> {
  const original = await findEntryByKey(payload, `consume:${args.requestId}`)
  if (!original) return { ok: false, error: 'not_found' }
  const userId = typeof original.user === 'object' ? original.user.id : original.user
  const result = await postEntry(payload, {
    userId,
    amount: -original.amount,
    type: 'refund',
    key: `refund:${args.requestId}`,
    product: original.product,
    note: args.reason ? `退款：${args.reason}` : `退款：${original.note ?? ''}`.replace(/：$/, ''),
  })
  if (!result.ok) return { ok: false, error: 'not_found' }
  return { ok: true, refunded: result.amount, balance: result.balance, duplicate: result.duplicate }
}

// ---------- 卡密 ----------

export type RedeemResult =
  { ok: true; credits: number; balance: number } | { ok: false; error: string }

/** 用户兑换卡密：占用卡密、加积分、写流水在同一个事务里完成 */
export async function redeemCode(
  payload: Payload,
  args: { userId: number; code: string },
): Promise<RedeemResult> {
  const code = normalizeRedeemCode(args.code)
  if (!/^[A-Z0-9]{4}(-[A-Z0-9]{4}){3}$/.test(code)) {
    return { ok: false, error: '卡密格式不对，应为 16 位字母数字，如 ABCD-EFGH-JKMN-PQRS' }
  }
  const { docs } = await payload.find({
    collection: 'redeem-codes',
    where: { code: { equals: code } },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })
  const doc = docs[0]
  if (!doc) return { ok: false, error: '卡密不存在，请检查是否输入正确' }
  const batch = typeof doc.batch === 'object' ? doc.batch : null
  const now = new Date().toISOString()

  const explain = (): RedeemResult => {
    if (doc.status === 'used') return { ok: false, error: '这张卡密已经被兑换过了' }
    if (doc.status === 'disabled' || batch?.disabled) return { ok: false, error: '这张卡密已停用' }
    if (batch?.expiresAt && batch.expiresAt <= now) return { ok: false, error: '这张卡密已过期' }
    return { ok: false, error: '兑换失败，请稍后再试' }
  }
  if (doc.status !== 'unused' || batch?.disabled || (batch?.expiresAt && batch.expiresAt <= now)) {
    return explain()
  }

  const s = schema(payload)
  const { codes: c, batches: b } = s
  // 第一条语句占用卡密（只有未使用、批次有效时才成功），后两条依赖它
  const claim: Statement = {
    sql: `UPDATE ${c.t} SET ${c.status} = 'used', ${c.usedBy} = ?, ${c.usedAt} = ?, ${c.updatedAt} = ?
          WHERE ${c.id} = ? AND ${c.status} = 'unused'
            AND EXISTS (SELECT 1 FROM ${b.t} WHERE ${b.id} = ${c.t}.${c.batch}
              AND COALESCE(${b.disabled}, 0) = 0 AND (${b.expiresAt} IS NULL OR ${b.expiresAt} > ?))`,
    args: [args.userId, now, now, doc.id, now],
  }
  const entry: Entry = {
    userId: args.userId,
    amount: doc.credits,
    type: 'redeem',
    key: `redeem:${doc.id}`,
    redeemCodeId: doc.id,
    note: `兑换卡密 ${code.slice(0, 4)}-****-****-${code.slice(-4)}`,
  }
  try {
    const [claimed, update] = await clientOf(payload).batch(
      [claim, ...entryStatements(s, entry, now, true)],
      'write',
    )
    if (claimed.rowsAffected === 1 && update.rows[0]) {
      return { ok: true, credits: doc.credits, balance: Number(update.rows[0].balance) }
    }
  } catch (err) {
    if (!isUniqueViolation(err)) throw err
  }
  // 被别人抢先兑换，或者刚好被停用
  const fresh = await payload.findByID({
    collection: 'redeem-codes',
    id: doc.id,
    overrideAccess: true,
  })
  return fresh.status === 'used' ? { ok: false, error: '这张卡密已经被兑换过了' } : explain()
}

/** 新建批次后生成卡密，整批在一个事务里写入 */
export async function insertBatchCodes(
  payload: Payload,
  args: { batchId: number; credits: number; quantity: number },
) {
  const { codes: c } = schema(payload)
  const now = new Date().toISOString()
  const codes = new Set<string>()
  while (codes.size < args.quantity) codes.add(generateRedeemCode())

  const rows = [...codes]
  const statements: Statement[] = []
  const CHUNK = 200
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK)
    const values: Value[] = []
    for (const code of chunk) values.push(code, args.batchId, args.credits, 'unused', now, now)
    statements.push({
      sql: `INSERT INTO ${c.t} (${c.code}, ${c.batch}, ${c.credits}, ${c.status}, ${c.createdAt}, ${c.updatedAt})
            VALUES ${chunk.map(() => '(?, ?, ?, ?, ?, ?)').join(', ')}`,
      args: values,
    })
  }
  await clientOf(payload).batch(statements, 'write')
  return rows.length
}

/** GET /api/redeem-batches/:id/export?status=unused|all —— 导出卡密 txt，一行一张 */
export const exportBatchCodes: PayloadHandler = async (req) => {
  if (!userIsAdmin(req.user)) return Response.json({ error: '需要管理员权限' }, { status: 403 })
  const id = Number(req.routeParams?.id)
  if (!Number.isInteger(id)) return Response.json({ error: '批次不存在' }, { status: 404 })
  const all = req.searchParams.get('status') === 'all'

  const batch = await req.payload
    .findByID({ collection: 'redeem-batches', id, depth: 0, overrideAccess: true })
    .catch(() => null)
  if (!batch) return Response.json({ error: '批次不存在' }, { status: 404 })

  const { docs } = await req.payload.find({
    collection: 'redeem-codes',
    where: all
      ? { batch: { equals: id } }
      : { and: [{ batch: { equals: id } }, { status: { equals: 'unused' } }] },
    pagination: false,
    depth: 0,
    sort: 'id',
    select: { code: true },
    overrideAccess: true,
  })

  const body = docs.map((doc) => doc.code).join('\r\n') + (docs.length ? '\r\n' : '')
  // 文件名只用英文数字：带中文的文件名有些浏览器会退回成 “download”
  const filename = `redeem-batch-${id}-${batch.credits}pts-${all ? 'all' : 'unused'}-${docs.length}.txt`
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}

// ---------- 接入密钥 ----------

export async function findUserByApiKey(payload: Payload, apiKey: unknown) {
  if (typeof apiKey !== 'string' || !apiKey.startsWith('sk-') || apiKey.length > 100) return null
  const { docs } = await payload.find({
    collection: 'users',
    where: { apiKey: { equals: apiKey } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return docs[0] ?? null
}

/** 比较内部接口密钥，用固定耗时的比较防止逐字猜测 */
export function secretMatches(given: string | null, expected: string | undefined) {
  if (!given || !expected) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}
