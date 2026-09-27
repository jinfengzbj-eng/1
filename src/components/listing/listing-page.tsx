// 布局参考 Mkdirs 首页（Apache-2.0）https://github.com/MkThingsHQ/mkdirs
import { Suspense } from 'react'

import Container from '@/components/container'
import { CategoryChips, CategorySidebar, FilterBar } from '@/components/listing/filter-bar'
import { listingPaths } from '@/components/listing/listing-card'
import ListingGrid from '@/components/listing/listing-grid'
import CustomPagination from '@/components/shared/pagination'
import { getCategories, getListings, getTags, type ListingKind } from '@/lib/data'
import type { ListingParams } from '@/lib/listing-url'

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
  const raw = await searchParams
  const base = listingPaths[kind].list
  const params: ListingParams = {
    q: pick(raw.q),
    category: pick(raw.category),
    tag: pick(raw.tag),
    filter: pick(raw.filter),
    sort: pick(raw.sort),
  }
  const page = Math.max(1, Number(pick(raw.page)) || 1)
  const allLabel = kind === 'mcp' ? '全部 MCP' : '全部工具'

  const [{ items, totalPages, totalDocs }, categories, tags] = await Promise.all([
    getListings({ kind, ...params, page }),
    getCategories(kind),
    getTags(kind),
  ])

  return (
    <Container className="mt-10 flex flex-col gap-10 md:mt-18 md:gap-18">
      {hero}

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-7">
        <aside className="hidden w-62 shrink-0 md:sticky md:top-28 md:block">
          <CategorySidebar
            base={base}
            params={params}
            categories={categories.items}
            total={categories.total}
            allLabel={allLabel}
          />
        </aside>

        <section className="flex min-w-0 flex-1 flex-col gap-4 md:gap-4.5">
          <CategoryChips
            base={base}
            params={params}
            categories={categories.items}
            allLabel={allLabel}
          />
          <FilterBar base={base} params={params} tags={tags} totalDocs={totalDocs} />
          <ListingGrid items={items} />
          <div className="flex justify-center">
            <Suspense>
              <CustomPagination routePrefix={base} totalPages={totalPages} />
            </Suspense>
          </div>
        </section>
      </div>
    </Container>
  )
}
