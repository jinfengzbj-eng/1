export type ListingParams = {
  q?: string
  category?: string
  tag?: string
  filter?: string
  sort?: string
}

const KEYS = ['q', 'category', 'tag', 'filter', 'sort'] as const
// 默认值不写进网址
const DEFAULTS: Partial<Record<(typeof KEYS)[number], string>> = { filter: 'all', sort: 'default' }

/** 在当前筛选条件上改一项，生成新网址（换筛选时回到第一页） */
export function listingHref(base: string, current: ListingParams, changes: ListingParams = {}) {
  const merged: ListingParams = { ...current, ...changes }
  const params = new URLSearchParams()
  for (const key of KEYS) {
    const value = merged[key]
    if (value && value !== DEFAULTS[key]) params.set(key, value)
  }
  const query = params.toString()
  return query ? `${base}?${query}` : base
}
