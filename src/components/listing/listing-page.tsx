// 布局改编自 Mkdirs 首页（Apache-2.0）https://github.com/MkThingsHQ/mkdirs
import { Suspense } from 'react'

import Container from '@/components/container'
import CategoryList from '@/components/listing/category-list'
import { listingPaths } from '@/components/listing/listing-card'
import ListingGrid from '@/components/listing/listing-grid'
import SearchFilter from '@/components/listing/search-filter'
import CustomPagination from '@/components/shared/pagination'
import {
  FILTER_OPTIONS,
  getCategories,
  getListings,
  getTags,
  type ListingKind,
  SORT_OPTIONS,
} from '@/lib/data'

export type ListingSearchParams = Promise<Record<string, string | string[] | undefined>>

const pick = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

export default async function ListingPage({
  kind,
  searchParams,
  hero,
}: {
  kind: ListingKind
  searchParams: ListingSearchParams
  hero: React.ReactNode
}) {
  const params = await searchParams
  const urlPrefix = listingPaths[kind].list
  const page = Math.max(1, Number(pick(params.page)) || 1)

  const [{ items, totalPages, totalDocs }, categories, tags] = await Promise.all([
    getListings({
      kind,
      q: pick(params.q),
      category: pick(params.category),
      tag: pick(params.tag),
      sort: pick(params.sort),
      filter: pick(params.filter),
      page,
    }),
    getCategories(kind),
    getTags(kind),
  ])

  return (
    <Container className="mt-12 mb-16 flex flex-col gap-12">
      {hero}

      <div className="flex flex-col gap-8 md:flex-row">
        {/* 左侧分类 */}
        <aside className="hidden w-[250px] shrink-0 md:block">
          <div className="sticky top-24">
            <Suspense>
              <CategoryList
                categories={categories}
                urlPrefix={urlPrefix}
                allLabel={kind === 'mcp' ? '全部 MCP' : '全部工具'}
              />
            </Suspense>
          </div>
        </aside>

        {/* 右侧筛选 + 卡片 */}
        <div className="flex-1">
          <div className="flex flex-col gap-8">
            <Suspense>
              <SearchFilter
                urlPrefix={urlPrefix}
                categories={categories}
                tags={tags}
                sortOptions={SORT_OPTIONS.map(({ value, label }) => ({ value, label }))}
                filterOptions={FILTER_OPTIONS.map(({ value, label }) => ({ value, label }))}
              />
            </Suspense>

            <p className="-mt-4 text-sm text-muted-foreground">共 {totalDocs} 个结果</p>

            <ListingGrid items={items} />

            <div className="flex items-center justify-center">
              <Suspense>
                <CustomPagination routePrefix={urlPrefix} totalPages={totalPages} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
