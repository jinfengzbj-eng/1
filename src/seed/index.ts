/**
 * 写入示例数据：管理员、演示用户、分类、MCP 服务、AI 工具
 * 运行：pnpm seed（已有数据时会跳过对应部分，可重复执行）
 */
import 'dotenv/config'

import { getPayload } from 'payload'

import config from '../payload.config'
import { aiTools, mcpCategories, mcpServers, toolCategories } from './data'

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@example.com'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin123456'
const DEMO_EMAIL = 'demo@example.com'
const DEMO_PASSWORD = 'demo123456'

const payload = await getPayload({ config })

async function ensureUser(
  email: string,
  password: string,
  role: 'admin' | 'user',
  credits: number,
) {
  const { totalDocs } = await payload.count({
    collection: 'users',
    where: { email: { equals: email } },
  })
  if (totalDocs > 0) return payload.logger.info(`用户已存在，跳过：${email}`)
  await payload.create({
    collection: 'users',
    data: { email, password, role, credits, nickname: role === 'admin' ? '管理员' : '演示用户' },
  })
  payload.logger.info(`已创建${role === 'admin' ? '管理员' : '用户'}：${email} / ${password}`)
}

await ensureUser(ADMIN_EMAIL, ADMIN_PASSWORD, 'admin', 0)
await ensureUser(DEMO_EMAIL, DEMO_PASSWORD, 'user', 120)

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

process.exit(0)
