import Link from 'next/link'

import { FilterMenu } from '@/components/listing/filter-menu'
import { FILTER_OPTIONS, SORT_OPTIONS } from '@/lib/data'
import { listingHref, type ListingParams } from '@/lib/listing-url'
import { cn } from '@/lib/utils'

type Category = { name: string; slug: string; count: number }

/** 左侧分类（桌面端，玻璃面板） */
export function CategorySidebar({
  base,
  params,
  categories,
  total,
  allLabel,
}: {
  base: string
  params: ListingParams
  categories: Category[]
  total: number
  allLabel: string
}) {
  const items = [{ name: allLabel, slug: '', count: total }, ...categories]
  return (
    <nav aria-label="分类" className="glass flex flex-col gap-0.5 rounded-3xl p-2.5">
      <p className="mx-3 mt-1.5 mb-2 text-xs font-semibold tracking-[0.08em] text-muted-foreground">
        分类
      </p>
      {items.map((item) => {
        const active = (params.category ?? '') === item.slug
        return (
          <Link
            key={item.slug || 'all'}
            href={listingHref(base, params, { category: item.slug || undefined })}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex h-10.5 items-center justify-between rounded-[14px] px-3.5 text-[15px] transition-colors',
              active ? 'seg-on font-semibold text-brand' : 'text-ink-2 hover:text-foreground',
            )}
          >
            <span>{item.name}</span>
            <span className={cn('text-[13px] tabular-nums', !active && 'text-muted-foreground')}>
              {item.count}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

/** 手机端分类：横向滑动的胶囊 */
export function CategoryChips({
  base,
  params,
  categories,
  allLabel,
}: {
  base: string
  params: ListingParams
  categories: Category[]
  allLabel: string
}) {
  const items = [{ name: allLabel, slug: '' }, ...categories]
  return (
    <nav
      aria-label="分类"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:hidden"
    >
      {items.map((item) => {
        const active = (params.category ?? '') === item.slug
        return (
          <Link
            key={item.slug || 'all'}
            href={listingHref(base, params, { category: item.slug || undefined })}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex h-9 shrink-0 items-center rounded-full px-4 text-sm',
              active
                ? 'btn-glow bg-primary font-semibold text-primary-foreground'
                : 'glass-thin text-ink-2',
            )}
          >
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}

/** 筛选工具栏：范围分段 + 标签 + 排序 + 数量 */
export function FilterBar({
  base,
  params,
  tags,
  totalDocs,
}: {
  base: string
  params: ListingParams
  tags: string[]
  totalDocs: number
}) {
  const currentFilter = params.filter ?? 'all'
  const currentSort = SORT_OPTIONS.find((o) => o.value === params.sort) ?? SORT_OPTIONS[0]

  return (
    <div className="glass flex flex-wrap items-center gap-2.5 rounded-[20px] p-2.5">
      <div role="group" aria-label="范围" className="flex gap-0.5 rounded-xl bg-seg-track p-[3px]">
        {FILTER_OPTIONS.map((option) => {
          const active = currentFilter === option.value
          return (
            <Link
              key={option.value}
              href={listingHref(base, params, { filter: option.value })}
              scroll={false}
              aria-current={active ? 'true' : undefined}
              className={cn(
                'flex h-8.5 items-center rounded-[10px] px-4 text-sm',
                active
                  ? 'seg-on font-semibold text-foreground'
                  : 'text-ink-2 hover:text-foreground',
              )}
            >
              {option.label}
            </Link>
          )
        })}
      </div>
      <FilterMenu
        icon="tag"
        label={params.tag ? `#${params.tag}` : '全部标签'}
        options={[
          { label: '全部标签', href: listingHref(base, params, { tag: '' }), active: !params.tag },
          ...tags.map((tag) => ({
            label: `#${tag}`,
            href: listingHref(base, params, { tag }),
            active: params.tag === tag,
          })),
        ]}
      />
      <FilterMenu
        icon="sort"
        label={currentSort.label}
        options={SORT_OPTIONS.map((option) => ({
          label: option.label,
          href: listingHref(base, params, { sort: option.value }),
          active: option.value === currentSort.value,
        }))}
      />
      <span className="ml-auto pr-2.5 text-sm text-muted-foreground tabular-nums">
        共 {totalDocs} 个
      </span>
    </div>
  )
}
