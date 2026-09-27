import Link from 'next/link'

import { FilterMenu } from '@/components/listing/filter-menu'
import { FilterSheet } from '@/components/listing/filter-sheet'
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

/**
 * 手机端工具条：分类胶囊横向滑动，右边固定一个“筛选”按钮，
 * 范围、标签、排序都收进底部弹层；下面一行写结果数量和已选条件。
 */
export function MobileFilterBar({
  base,
  params,
  categories,
  tags,
  totalDocs,
}: {
  base: string
  params: ListingParams
  categories: Category[]
  tags: string[]
  totalDocs: number
}) {
  const chips = [{ name: '全部', slug: '' }, ...categories]
  const currentFilter = FILTER_OPTIONS.find((o) => o.value === params.filter) ?? FILTER_OPTIONS[0]
  const currentSort = SORT_OPTIONS.find((o) => o.value === params.sort) ?? SORT_OPTIONS[0]
  const applied = [
    currentFilter.value !== 'all' ? currentFilter.label : null,
    params.tag ? `#${params.tag}` : null,
    currentSort.value !== 'default' ? currentSort.label : null,
  ].filter((label): label is string => !!label)
  const resetHref = listingHref(base, params, { filter: 'all', tag: '', sort: 'default' })

  return (
    <div className="flex flex-col gap-3 md:hidden">
      <div className="flex items-center gap-2">
        <nav
          aria-label="分类"
          className="-ml-4 flex min-w-0 flex-1 gap-2 overflow-x-auto pr-4 pl-4 [mask-image:linear-gradient(to_right,black_calc(100%-24px),transparent)] [scrollbar-width:none]"
        >
          {chips.map((item) => {
            const active = (params.category ?? '') === item.slug
            return (
              <Link
                key={item.slug || 'all'}
                href={listingHref(base, params, { category: item.slug || undefined })}
                scroll={false}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-8.5 shrink-0 items-center rounded-full px-3.5 text-sm',
                  active
                    ? 'btn-glow bg-primary font-semibold text-primary-foreground'
                    : 'border border-card-line bg-card text-ink-2',
                )}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>
        <FilterSheet
          scopes={FILTER_OPTIONS.map((option) => ({
            label: option.label,
            href: listingHref(base, params, { filter: option.value }),
            active: option.value === currentFilter.value,
          }))}
          tags={tags.map((tag) => ({
            label: tag,
            // 再点一次已选的标签就取消
            href: listingHref(base, params, { tag: params.tag === tag ? '' : tag }),
            active: params.tag === tag,
          }))}
          sorts={SORT_OPTIONS.map((option) => ({
            label: option.label,
            href: listingHref(base, params, { sort: option.value }),
            active: option.value === currentSort.value,
          }))}
          resetHref={resetHref}
          totalDocs={totalDocs}
          activeCount={applied.length}
        />
      </div>
      <div className="flex items-center justify-between gap-3 px-1 text-[13px] text-muted-foreground tabular-nums">
        <span className="truncate">{['共 ' + totalDocs + ' 个', ...applied].join(' · ')}</span>
        {applied.length > 0 ? (
          <Link href={resetHref} scroll={false} className="shrink-0 text-brand">
            清除筛选
          </Link>
        ) : (
          <span className="shrink-0">{currentSort.label}</span>
        )}
      </div>
    </div>
  )
}

/** 筛选工具栏（桌面端）：范围分段 + 标签 + 排序 + 数量 */
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
    <div className="glass flex flex-wrap items-center gap-2.5 rounded-[20px] p-2.5 max-md:hidden">
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
