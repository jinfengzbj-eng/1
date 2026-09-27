// @vitest-environment node
/**
 * 积分与卡密：用一个临时 SQLite 数据库跑真实的 Payload，
 * 检查并发扣费不超扣、重复请求不重复记账、卡密只能兑换一次、余额和流水始终对得上。
 */
import { rmSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const dbFile = path.join(tmpdir(), `credits-test-${process.pid}-${Date.now()}.db`)
process.env.DATABASE_URL = `file:${dbFile}`
process.env.INTERNAL_API_SECRET = 'test-internal-secret'

let payload: Payload
let credits: typeof import('@/lib/credits')
let endpoints: (typeof import('@/endpoints/credits'))['creditEndpoints']
let nextEmail = 0

async function createUser(role: 'admin' | 'user' = 'user') {
  nextEmail += 1
  return payload.create({
    collection: 'users',
    data: { email: `u${nextEmail}@test.local`, password: 'password123', role, credits: 0 },
    context: { publicSignup: role === 'user' },
  })
}

async function balanceOf(userId: number) {
  const user = await payload.findByID({ collection: 'users', id: userId, overrideAccess: true })
  return user.credits ?? 0
}

/** 余额必须等于流水之和 */
async function expectLedgerMatches(userId: number) {
  const { docs } = await payload.find({
    collection: 'credit-transactions',
    where: { user: { equals: userId } },
    pagination: false,
    overrideAccess: true,
  })
  const sum = docs.reduce((total, doc) => total + doc.amount, 0)
  expect(await balanceOf(userId)).toBe(sum)
}

function callEndpoint(p: string, body: unknown, secret = 'test-internal-secret') {
  const endpoint = endpoints.find((e) => e.path === p)!
  const req = {
    payload,
    headers: new Headers(secret ? { 'x-internal-secret': secret } : {}),
    json: async () => body,
  }
  return endpoint.handler(req as never) as Promise<Response>
}

beforeAll(async () => {
  const { getPayload } = await import('payload')
  const config = (await import('@/payload.config')).default
  payload = await getPayload({ config })
  credits = await import('@/lib/credits')
  endpoints = (await import('@/endpoints/credits')).creditEndpoints
}, 120_000)

afterAll(async () => {
  await payload?.destroy()
  for (const suffix of ['', '-journal', '-wal', '-shm']) rmSync(dbFile + suffix, { force: true })
})

describe('扣费', () => {
  it('同一个 requestId 只扣一次，余额不够时不扣', async () => {
    const user = await createUser()
    await credits.grantCredits(payload, { userId: user.id, amount: 100, note: '测试' })

    const first = await credits.consumeCredits(payload, {
      userId: user.id,
      amount: 30,
      requestId: 'r1',
      product: 'mcp/test',
      note: '测试',
    })
    expect(first).toMatchObject({ ok: true, charged: 30, balance: 70, duplicate: false })

    const retry = await credits.consumeCredits(payload, {
      userId: user.id,
      amount: 30,
      requestId: 'r1',
      product: 'mcp/test',
      note: '测试',
    })
    expect(retry).toMatchObject({ ok: true, balance: 70, duplicate: true })

    const tooMuch = await credits.consumeCredits(payload, {
      userId: user.id,
      amount: 1000,
      requestId: 'r2',
      product: 'mcp/test',
      note: '测试',
    })
    expect(tooMuch).toMatchObject({ ok: false, error: 'insufficient_credits', balance: 70 })
    expect(await balanceOf(user.id)).toBe(70)
    await expectLedgerMatches(user.id)
  })

  it('余额用完后重试旧请求，不会再扣一次', async () => {
    const user = await createUser()
    await credits.grantCredits(payload, { userId: user.id, amount: 10, note: '测试' })
    const args = {
      userId: user.id,
      amount: 10,
      requestId: 'drain',
      product: 'mcp/test',
      note: '测试',
    }
    expect(await credits.consumeCredits(payload, args)).toMatchObject({ ok: true, balance: 0 })
    expect(await credits.consumeCredits(payload, args)).toMatchObject({
      ok: true,
      duplicate: true,
      balance: 0,
    })
    expect(await balanceOf(user.id)).toBe(0)
    await expectLedgerMatches(user.id)
  })

  it('并发扣费不会扣成负数', async () => {
    const user = await createUser()
    await credits.grantCredits(payload, { userId: user.id, amount: 70, note: '测试' })
    const results = await Promise.all(
      Array.from({ length: 20 }, (_, i) =>
        credits.consumeCredits(payload, {
          userId: user.id,
          amount: 10,
          requestId: `c-${user.id}-${i}`,
          product: 'mcp/test',
          note: '测试',
        }),
      ),
    )
    expect(results.filter((r) => r.ok)).toHaveLength(7)
    expect(await balanceOf(user.id)).toBe(0)
    await expectLedgerMatches(user.id)
  })

  it('退款只能退一次', async () => {
    const user = await createUser()
    await credits.grantCredits(payload, { userId: user.id, amount: 20, note: '测试' })
    await credits.consumeCredits(payload, {
      userId: user.id,
      amount: 5,
      requestId: `refund-${user.id}`,
      product: 'mcp/test',
      note: '测试',
    })
    const first = await credits.refundCredits(payload, { requestId: `refund-${user.id}` })
    expect(first).toMatchObject({ ok: true, refunded: 5, balance: 20, duplicate: false })
    const again = await credits.refundCredits(payload, { requestId: `refund-${user.id}` })
    expect(again).toMatchObject({ ok: true, duplicate: true, balance: 20 })
    expect(await credits.refundCredits(payload, { requestId: 'nope' })).toEqual({
      ok: false,
      error: 'not_found',
    })
    await expectLedgerMatches(user.id)
  })

  it('注册赠送每个用户只送一次', async () => {
    const user = await createUser()
    await credits.grantSignupBonus(payload, user.id, 20)
    await credits.grantSignupBonus(payload, user.id, 20)
    expect(await balanceOf(user.id)).toBe(20)
  })
})

describe('卡密', () => {
  async function createBatch(data: Record<string, unknown> = {}) {
    const batch = await payload.create({
      collection: 'redeem-batches',
      data: { name: '测试批次', credits: 50, quantity: 3, ...data } as never,
    })
    const { docs } = await payload.find({
      collection: 'redeem-codes',
      where: { batch: { equals: batch.id } },
      pagination: false,
      overrideAccess: true,
    })
    return { batch, codes: docs.map((d) => d.code) }
  }

  it('新建批次会按数量生成卡密', async () => {
    const { codes } = await createBatch({ quantity: 250 })
    expect(codes).toHaveLength(250)
    expect(new Set(codes).size).toBe(250)
    for (const code of codes) expect(code).toMatch(/^[A-Z0-9]{4}(-[A-Z0-9]{4}){3}$/)
  })

  it('兑换后到账，同一张不能再兑换；小写、不带横线也能识别', async () => {
    const user = await createUser()
    const { codes } = await createBatch()
    const loose = codes[0].replace(/-/g, '').toLowerCase()
    expect(await credits.redeemCode(payload, { userId: user.id, code: loose })).toEqual({
      ok: true,
      credits: 50,
      balance: 50,
    })
    const again = await credits.redeemCode(payload, { userId: user.id, code: codes[0] })
    expect(again).toEqual({ ok: false, error: '这张卡密已经被兑换过了' })
    expect(await credits.redeemCode(payload, { userId: user.id, code: 'AAAA-BBBB' })).toMatchObject(
      {
        ok: false,
      },
    )
    await expectLedgerMatches(user.id)
  })

  it('两个人同时兑换同一张卡密，只有一个成功', async () => {
    const [a, b] = [await createUser(), await createUser()]
    const { codes } = await createBatch()
    const results = await Promise.all([
      credits.redeemCode(payload, { userId: a.id, code: codes[1] }),
      credits.redeemCode(payload, { userId: b.id, code: codes[1] }),
    ])
    expect(results.filter((r) => r.ok)).toHaveLength(1)
    expect((await balanceOf(a.id)) + (await balanceOf(b.id))).toBe(50)
  })

  it('停用或过期的批次不能兑换', async () => {
    const user = await createUser()
    const disabled = await createBatch({ disabled: true })
    expect(await credits.redeemCode(payload, { userId: user.id, code: disabled.codes[0] })).toEqual(
      {
        ok: false,
        error: '这张卡密已停用',
      },
    )
    const expired = await createBatch({ expiresAt: new Date(Date.now() - 60_000).toISOString() })
    expect(await credits.redeemCode(payload, { userId: user.id, code: expired.codes[0] })).toEqual({
      ok: false,
      error: '这张卡密已过期',
    })
    expect(await balanceOf(user.id)).toBe(0)
  })
})

describe('后台调整和权限', () => {
  it('后台新建流水会同步改余额，扣成负数时拒绝并撤回', async () => {
    const admin = await createUser('admin')
    const user = await createUser()
    const doc = await payload.create({
      collection: 'credit-transactions',
      data: { user: user.id, amount: 30, note: '补偿' } as never,
      overrideAccess: false,
      user: admin,
    })
    expect(doc.type).toBe('admin')
    expect(await balanceOf(user.id)).toBe(30)
    const saved = await payload.findByID({ collection: 'credit-transactions', id: doc.id })
    expect(saved.balanceAfter).toBe(30)

    await expect(
      payload.create({
        collection: 'credit-transactions',
        data: { user: user.id, amount: -100, note: '扣太多' } as never,
        overrideAccess: false,
        user: admin,
      }),
    ).rejects.toThrow(/余额不足/)
    expect(await balanceOf(user.id)).toBe(30)
    await expectLedgerMatches(user.id)
  })

  it('用户和管理员都不能直接改余额字段', async () => {
    const admin = await createUser('admin')
    const user = await createUser()
    await payload.update({
      collection: 'users',
      id: user.id,
      data: { credits: 9999 },
      overrideAccess: false,
      user,
    })
    await payload.update({
      collection: 'users',
      id: user.id,
      data: { credits: 8888 },
      overrideAccess: false,
      user: admin,
    })
    expect(await balanceOf(user.id)).toBe(0)
  })

  it('普通用户只能看到自己的流水', async () => {
    const a = await createUser()
    const b = await createUser()
    await credits.grantCredits(payload, { userId: a.id, amount: 1, note: 'a' })
    await credits.grantCredits(payload, { userId: b.id, amount: 1, note: 'b' })
    const { docs } = await payload.find({
      collection: 'credit-transactions',
      overrideAccess: false,
      user: a,
    })
    expect(docs.every((d) => (typeof d.user === 'object' ? d.user.id : d.user) === a.id)).toBe(true)
  })
})

describe('内部接口', () => {
  it('密钥不对返回 401', async () => {
    const res = await callEndpoint('/credits/verify', { apiKey: 'sk-x' }, 'wrong')
    expect(res.status).toBe(401)
  })

  it('扣费、积分不足、退款', async () => {
    const user = await createUser()
    await credits.grantCredits(payload, { userId: user.id, amount: 12, note: '测试' })
    await payload.create({
      collection: 'mcp-servers',
      data: {
        name: '测试服务',
        slug: 'test-svc',
        summary: '测试',
        endpoint: 'https://example.com/mcp',
        transport: 'http',
        creditsPerCall: 5,
        status: 'published',
      } as never,
    })

    const verify = await callEndpoint('/credits/verify', {
      apiKey: user.apiKey,
      product: 'mcp/test-svc',
    })
    expect(await verify.json()).toMatchObject({ ok: true, balance: 12, price: 5, enough: true })

    const body = { apiKey: user.apiKey, product: 'mcp/test-svc', requestId: 'api-1' }
    const ok = await callEndpoint('/credits/consume', body)
    expect(ok.status).toBe(200)
    expect(await ok.json()).toMatchObject({ ok: true, charged: 5, balance: 7 })

    await callEndpoint('/credits/consume', { ...body, requestId: 'api-2' })
    const poor = await callEndpoint('/credits/consume', { ...body, requestId: 'api-3' })
    expect(poor.status).toBe(402)
    expect(await poor.json()).toMatchObject({
      error: 'insufficient_credits',
      balance: 2,
      required: 5,
    })

    const refund = await callEndpoint('/credits/refund', { requestId: 'api-1' })
    expect(await refund.json()).toMatchObject({ ok: true, refunded: 5, balance: 7 })

    const badKey = await callEndpoint('/credits/consume', {
      ...body,
      apiKey: 'sk-nope',
      requestId: 'x',
    })
    expect(badKey.status).toBe(401)
    const badProduct = await callEndpoint('/credits/consume', {
      ...body,
      product: 'mcp/none',
      requestId: 'y',
    })
    expect(badProduct.status).toBe(404)
    const noRequestId = await callEndpoint('/credits/consume', { ...body, requestId: '' })
    expect(noRequestId.status).toBe(400)
    await expectLedgerMatches(user.id)
  })
})
