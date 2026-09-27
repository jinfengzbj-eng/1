/**
 * 写入示例数据：管理员、演示用户、分类、MCP 服务、AI 工具、卡密批次、积分流水
 * 运行：pnpm seed（已有数据时会跳过对应部分，可重复执行）
 */
import 'dotenv/config'

import { getPayload } from 'payload'

import {
  consumeCredits,
  grantCredits,
  grantSignupBonus,
  redeemCode,
  refundCredits,
} from '../lib/credits'
import config from '../payload.config'
import { aiTools, mcpCategories, mcpServers, toolCategories } from './data'

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@example.com'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin123456'
const DEMO_EMAIL = 'demo@example.com'
const DEMO_PASSWORD = 'demo123456'

const payload = await getPayload({ config })

/** 创建账号；已存在时返回 null */
async function ensureUser(email: string, password: string, role: 'admin' | 'user') {
  const { totalDocs } = await payload.count({
    collection: 'users',
    where: { email: { equals: email } },
  })
  if (totalDocs > 0) {
    payload.logger.info(`用户已存在，跳过：${email}`)
    return null
  }
  const user = await payload.create({
    collection: 'users',
    data: { email, password, role, credits: 0, nickname: role === 'admin' ? '管理员' : '演示用户' },
  })
  payload.logger.info(`已创建${role === 'admin' ? '管理员' : '用户'}：${email} / ${password}`)
  return user
}

await ensureUser(ADMIN_EMAIL, ADMIN_PASSWORD, 'admin')
const demo = await ensureUser(DEMO_EMAIL, DEMO_PASSWORD, 'user')

const { totalDocs: existing } = await payload.count({ collection: 'mcp-servers' })
if (existing > 0) {
  payload.logger.info('已有产品数据，跳过示例产品')
} else {
  const categoryIds = new Map<string, number>()
  for (const category of mcpCategories) {
    const doc = await payload.create({
      collection: 'categories',
      data: { ...category, kind: 'mcp' },
    })
    categoryIds.set(`mcp:${category.slug}`, doc.id)
  }
  for (const category of toolCategories) {
    const doc = await payload.create({
      collection: 'categories',
      data: { ...category, kind: 'tool' },
    })
    categoryIds.set(`tool:${category.slug}`, doc.id)
  }

  for (const [index, item] of mcpServers.entries()) {
    await payload.create({
      collection: 'mcp-servers',
      data: {
        name: item.name,
        slug: item.slug,
        summary: item.summary,
        description: item.intro,
        category: categoryIds.get(`mcp:${item.category}`),
        tags: item.tags,
        tools: item.tools,
        endpoint: `https://mcp.example.com/${item.slug}/mcp`,
        transport: 'http',
        creditsPerCall: item.creditsPerCall,
        version: item.version,
        featured: item.featured ?? false,
        status: 'published',
        sortOrder: index,
      },
    })
  }

  for (const [index, item] of aiTools.entries()) {
    await payload.create({
      collection: 'ai-tools',
      data: {
        name: item.name,
        slug: item.slug,
        summary: item.summary,
        description: item.intro,
        category: categoryIds.get(`tool:${item.category}`),
        tags: item.tags,
        url: item.url,
        creditsPerUse: item.creditsPerUse,
        badge: item.badge,
        featured: item.featured ?? false,
        status: 'published',
        sortOrder: index,
      },
    })
  }
  payload.logger.info(`已写入 ${mcpServers.length} 个 MCP 服务、${aiTools.length} 个 AI 工具`)
}

// 示例卡密批次：演示用户兑换一张，其余可以登录后自己试
const { totalDocs: batchCount } = await payload.count({ collection: 'redeem-batches' })
if (batchCount > 0) {
  payload.logger.info('已有卡密批次，跳过示例卡密')
} else {
  const batch = await payload.create({
    collection: 'redeem-batches',
    data: {
      name: '示例批次（100 积分）',
      credits: 100,
      quantity: 5,
      note: 'pnpm seed 生成的示例卡密',
    },
  })
  const { docs: codes } = await payload.find({
    collection: 'redeem-codes',
    where: { batch: { equals: batch.id } },
    sort: 'id',
    limit: 5,
  })

  // 演示用户的积分流水：注册赠送 20 + 兑换 100，再来几条消费、退款、补偿，最后余额 120
  if (demo) {
    await grantSignupBonus(payload, demo.id, 20)
    await redeemCode(payload, { userId: demo.id, code: codes[0].code })
    await consumeCredits(payload, {
      userId: demo.id,
      amount: 5,
      requestId: 'seed-demo-1',
      product: 'mcp/pdf-parser',
      note: '使用 PDF 解析',
    })
    await consumeCredits(payload, {
      userId: demo.id,
      amount: 2,
      requestId: 'seed-demo-2',
      product: 'mcp/web-reader',
      note: '使用 网页阅读器',
    })
    await refundCredits(payload, { requestId: 'seed-demo-2', reason: '网页打不开' })
    await grantCredits(payload, { userId: demo.id, amount: 5, note: '客服补偿' })
  }
  payload.logger.info(`已生成示例卡密 5 张（100 积分），可在用户中心兑换：${codes[1].code}`)
}

process.exit(0)
