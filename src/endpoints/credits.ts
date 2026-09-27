/**
 * 内部积分接口，给自己的 MCP 网关和 AI 工具后端调用（不是给浏览器用的）。
 * 鉴权：请求头 X-Internal-Secret 必须等于环境变量 INTERNAL_API_SECRET。
 * 用户身份：请求体里的 apiKey（用户在 MCP 客户端里填的 sk- 密钥）。
 * 详细说明见 docs/credits-api.md。
 */
import type { Endpoint, Payload, PayloadRequest } from 'payload'

import { consumeCredits, findUserByApiKey, refundCredits, secretMatches } from '../lib/credits'

type Json = Record<string, unknown>

const REQUEST_ID_RE = /^[\w.:-]{1,128}$/

function fail(status: number, error: string, message: string, extra: Json = {}) {
  return Response.json({ ok: false, error, message, ...extra }, { status })
}

function checkSecret(req: PayloadRequest) {
  const expected = process.env.INTERNAL_API_SECRET
  if (!expected) return fail(503, 'not_configured', '服务器没有设置 INTERNAL_API_SECRET')
  if (!secretMatches(req.headers.get('x-internal-secret'), expected)) {
    return fail(401, 'unauthorized', 'X-Internal-Secret 不正确')
  }
  return null
}

async function readBody(req: PayloadRequest): Promise<Json | null> {
  try {
    const body = await req.json?.()
    return body && typeof body === 'object' && !Array.isArray(body) ? (body as Json) : null
  } catch {
    return null
  }
}

/** product 写成 "mcp/<英文短名>" 或 "tool/<英文短名>"，只认已上架的产品 */
async function findProduct(payload: Payload, product: unknown) {
  if (typeof product !== 'string') return null
  const match = /^(mcp|tool)\/([a-z0-9-]{1,64})$/.exec(product)
  if (!match) return null
  const [, kind, slug] = match
  const collection = kind === 'mcp' ? 'mcp-servers' : 'ai-tools'
  const { docs } = await payload.find({
    collection,
    where: { and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }] },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const doc = docs[0]
  if (!doc) return null
  const price = 'creditsPerCall' in doc ? doc.creditsPerCall : doc.creditsPerUse
  return { key: product, name: doc.name, price: price ?? 0 }
}

// POST /api/credits/verify { apiKey, product? } → 校验密钥、查余额和价格
const verify: Endpoint = {
  path: '/credits/verify',
  method: 'post',
  handler: async (req) => {
    const denied = checkSecret(req)
    if (denied) return denied
    const body = await readBody(req)
    if (!body) return fail(400, 'bad_request', '请求体必须是 JSON')

    const user = await findUserByApiKey(req.payload, body.apiKey)
    if (!user) return fail(401, 'invalid_api_key', '接入密钥无效')
    let price: number | undefined
    if (body.product !== undefined) {
      const product = await findProduct(req.payload, body.product)
      if (!product) return fail(404, 'product_not_found', '产品不存在或已下架')
      price = product.price
    }
    return Response.json({
      ok: true,
      userId: user.id,
      balance: user.credits ?? 0,
      ...(price !== undefined ? { price, enough: (user.credits ?? 0) >= price } : {}),
    })
  },
}

// POST /api/credits/consume { apiKey, product, requestId, amount?, note? } → 扣费
const consume: Endpoint = {
  path: '/credits/consume',
  method: 'post',
  handler: async (req) => {
    const denied = checkSecret(req)
    if (denied) return denied
    const body = await readBody(req)
    if (!body) return fail(400, 'bad_request', '请求体必须是 JSON')
    if (typeof body.requestId !== 'string' || !REQUEST_ID_RE.test(body.requestId)) {
      return fail(400, 'bad_request', 'requestId 必填：1～128 位字母、数字或 . _ : -')
    }
    if (
      body.amount !== undefined &&
      !(
        Number.isInteger(body.amount) &&
        (body.amount as number) > 0 &&
        (body.amount as number) <= 1_000_000
      )
    ) {
      return fail(400, 'bad_request', 'amount 必须是 1～1000000 的整数，不填则按产品价格')
    }

    const user = await findUserByApiKey(req.payload, body.apiKey)
    if (!user) return fail(401, 'invalid_api_key', '接入密钥无效')
    const product = await findProduct(req.payload, body.product)
    if (!product) return fail(404, 'product_not_found', '产品不存在或已下架')

    const amount = (body.amount as number | undefined) ?? product.price
    const note =
      typeof body.note === 'string' && body.note.trim()
        ? body.note.trim().slice(0, 100)
        : `使用 ${product.name}`
    const result = await consumeCredits(req.payload, {
      userId: user.id,
      amount,
      requestId: body.requestId,
      product: product.key,
      note,
    })
    if (!result.ok) {
      return result.error === 'insufficient_credits'
        ? fail(402, 'insufficient_credits', `积分不足：需要 ${amount}，余额 ${result.balance}`, {
            balance: result.balance,
            required: amount,
          })
        : fail(401, 'invalid_api_key', '接入密钥无效')
    }
    return Response.json(result)
  },
}

// POST /api/credits/refund { requestId, reason? } → 退回某次扣费（调用失败时用）
const refund: Endpoint = {
  path: '/credits/refund',
  method: 'post',
  handler: async (req) => {
    const denied = checkSecret(req)
    if (denied) return denied
    const body = await readBody(req)
    if (!body) return fail(400, 'bad_request', '请求体必须是 JSON')
    if (typeof body.requestId !== 'string' || !REQUEST_ID_RE.test(body.requestId)) {
      return fail(400, 'bad_request', 'requestId 必填')
    }
    const reason =
      typeof body.reason === 'string' ? body.reason.trim().slice(0, 100) || undefined : undefined
    const result = await refundCredits(req.payload, { requestId: body.requestId, reason })
    if (!result.ok) return fail(404, 'not_found', '找不到这个 requestId 的扣费记录')
    return Response.json(result)
  },
}

export const creditEndpoints: Endpoint[] = [verify, consume, refund]
