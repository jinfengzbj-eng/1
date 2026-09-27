import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload, type Where } from 'payload'
import { cache } from 'react'

import type { AiTool, Category, McpServer, Media, SiteSetting, User } from '@/payload-types'

export type ListingKind = 'mcp' | 'tool'

export const ITEMS_PER_PAGE = 12

/** 卡片、列表用的统一数据结构，MCP 服务和 AI 工具共用 */
export type ListingCardData = {
  id: number
  kind: ListingKind
  slug: string
  name: string
  summary: string
  logoUrl: string | null
  category: { name: string; slug: string } | null
  tags: string[]
  featured: boolean
  price: number
  badge: AiTool['badge'] | null
}

export const getPayloadClient = cache(async () => getPayload({ config }))

export const getSiteSettings = cache(async (): Promise<SiteSetting> => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings', depth: 1 })
})

/** 当前登录用户（每次请求读一次数据库，保证积分是最新的） */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  if (!user || user.collection !== 'users') return null
  return payload.findByID({ collection: 'users', id: user.id, depth: 0, overrideAccess: true })
})

export function mediaUrl(media: number | Media | null | undefined): string | null {
  if (!media || typeof media === 'number') return null
  return media.url ?? null
}

function toCategory(category: number | Category | null | undefined) {
  if (!category || typeof category === 'number') return null
  return { name: category.name, slug: category.slug }
}

export function toCard(doc: McpServer | AiTool, kind: ListingKind): ListingCardData {
  return {
    id: doc.id,
    kind,
    slug: doc.slug,
    name: doc.name,
    summary: doc.summary,
    logoUrl: mediaUrl(doc.logo),
    category: toCategory(doc.category),
    tags: doc.tags ?? [],
    featured: !!doc.featured,
    price: kind === 'mcp' ? (doc as McpServer).creditsPerCall : (doc as AiTool).creditsPerUse,
    badge: kind === 'tool' ? ((doc as AiTool).badge ?? null) : null,
  }
}

const collectionOf = (kind: ListingKind) => (kind === 'mcp' ? 'mcp-servers' : 'ai-tools')
const priceFieldOf = (kind: ListingKind) => (kind === 'mcp' ? 'creditsPerCall' : 'creditsPerUse')

export const SORT_OPTIONS = [
  { value: 'default', label: '默认排序', sort: ['-featured', 'sortOrder', '-createdAt'] },
  { value: 'latest', label: '最新上架', sort: ['-createdAt'] },
  { value: 'price', label: '价格从低到高', sort: ['__price', 'sortOrder'] },
  { value: 'name', label: '按名称', sort: ['name'] },
] as const

export const FILTER_OPTIONS = [
  { value: 'all', label: '全部产品' },
  { value: 'featured', label: '只看推荐' },
  { value: 'free', label: '只看免费' },
] as const

export type ListingQuery = {
  kind: ListingKind
  q?: string
  category?: string
  tag?: string
  sort?: string
  filter?: string
  page?: number
}

export async function getListings({
  kind,
  q,
  category,
  tag,
  sort,
  filter,
  page = 1,
}: ListingQuery) {
  const payload = await getPayloadClient()
  const and: Where[] = [{ status: { equals: 'published' } }]

  if (q) and.push({ or: [{ name: { like: q } }, { summary: { like: q } }] })
  if (category) and.push({ 'category.slug': { equals: category } })
  if (tag) and.push({ tags: { in: [tag] } })
  if (filter === 'featured') and.push({ featured: { equals: true } })
  if (filter === 'free') and.push({ [priceFieldOf(kind)]: { equals: 0 } })

  const sortOption = SORT_OPTIONS.find((option) => option.value === sort) ?? SORT_OPTIONS[0]
  const result = await payload.find({
    collection: collectionOf(kind),
    where: { and },
    sort: sortOption.sort.map((field) =>
      field === '__price' ? priceFieldOf(kind) : field,
    ) as string[],
    limit: ITEMS_PER_PAGE,
    page,
    depth: 1,
  })

  return {
    items: result.docs.map((doc) => toCard(doc, kind)),
    totalPages: result.totalPages,
    totalDocs: result.totalDocs,
  }
}

export const getCategories = cache(async (kind: ListingKind) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'categories',
    where: { kind: { equals: kind } },
    sort: 'sortOrder',
    limit: 100,
    depth: 0,
  })
  return docs.map((doc) => ({ name: doc.name, slug: doc.slug }))
})

/** 所有已上架内容里出现过的标签 */
export const getTags = cache(async (kind: ListingKind) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: collectionOf(kind),
    where: { status: { equals: 'published' } },
    select: { tags: true },
    limit: 1000,
    depth: 0,
  })
  const tags = new Set<string>()
  for (const doc of docs) for (const t of doc.tags ?? []) tags.add(t)
  return [...tags]
})

export async function getMcpBySlug(slug: string) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'mcp-servers',
    where: { and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }] },
    limit: 1,
    depth: 1,
  })
  return docs[0] ?? null
}

export async function getToolBySlug(slug: string) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'ai-tools',
    where: { and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }] },
    limit: 1,
    depth: 1,
  })
  return docs[0] ?? null
}

/** 同分类的其他产品，不够时用其他已上架产品补齐 */
export async function getRelated(kind: ListingKind, doc: McpServer | AiTool, count = 3) {
  const payload = await getPayloadClient()
  const categoryId = typeof doc.category === 'object' ? doc.category?.id : doc.category
  const base: Where[] = [{ status: { equals: 'published' } }, { id: { not_equals: doc.id } }]

  const sameCategory = categoryId
    ? await payload.find({
        collection: collectionOf(kind),
        where: { and: [...base, { category: { equals: categoryId } }] },
        sort: ['-featured', 'sortOrder'],
        limit: count,
        depth: 1,
      })
    : { docs: [] as (McpServer | AiTool)[] }

  let docs = sameCategory.docs
  if (docs.length < count) {
    const others = await payload.find({
      collection: collectionOf(kind),
      where: { and: [...base, { id: { not_in: [doc.id, ...docs.map((d) => d.id)] } }] },
      sort: ['-featured', 'sortOrder'],
      limit: count - docs.length,
      depth: 1,
    })
    docs = [...docs, ...others.docs]
  }
  return docs.map((d) => toCard(d, kind))
}
