// 信息结构参考 Mkdirs 详情页（Apache-2.0）https://github.com/MkThingsHQ/mkdirs
import { ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { LetterIcon } from '@/components/letter-icon'
import { listingPaths } from '@/components/listing/listing-card'
import type { ListingCardData } from '@/lib/data'
import { cn } from '@/lib/utils'

export function DetailBreadcrumb({
  rootLabel,
  rootHref,
  category,
  name,
}: {
  rootLabel: string
  rootHref: string
  category: { name: string; slug: string } | null
  name: string
}) {
  return (
    <nav aria-label="位置" className="flex items-center gap-2 text-sm text-muted-foreground">
      <Link href={rootHref} className="hover:text-foreground">
        {rootLabel}
      </Link>
      {category && (
        <>
          <ChevronRightIcon className="size-3.5" />
          <Link href={`${rootHref}?category=${category.slug}`} className="hover:text-foreground">
            {category.name}
          </Link>
        </>
      )}
      <ChevronRightIcon className="size-3.5" />
      <span className="truncate font-medium text-foreground">{name}</span>
    </nav>
  )
}

/** 详情页头部：图标、名称、标签、简介和操作按钮 */
export function DetailHeader({
  item,
  chips,
  actions,
}: {
  item: ListingCardData
  chips: string[]
  actions: ReactNode
}) {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 md:gap-5">
          <LetterIcon
            name={item.name}
            seed={item.slug}
            src={item.logoUrl}
            size={76}
            className="max-md:!size-16 max-md:!text-[28px]"
          />
          <div className="flex min-w-0 flex-col gap-2.5">
            <h1 className="text-[28px] leading-tight font-bold tracking-[-0.025em] md:text-[42px] md:leading-[1.1]">
              {item.name}
            </h1>
            <div className="flex flex-wrap gap-2 text-xs font-semibold md:text-[13px]">
              {item.featured && (
                <span className="flex h-6.5 items-center rounded-full bg-brand-soft px-2.5 text-brand">
                  推荐
                </span>
              )}
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="flex h-6.5 items-center rounded-full bg-seg-track px-2.5 text-ink-2"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className="max-w-[720px] text-[15px] leading-[1.7] text-ink-2 md:text-lg">
          {item.summary}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">{actions}</div>
    </div>
  )
}

/** 内容层面板：实心 */
export function Panel({
  title,
  id,
  className,
  children,
}: {
  title: string
  id?: string
  className?: string
  children: ReactNode
}) {
  return (
    <section
      id={id}
      className={cn('surface flex scroll-mt-28 flex-col gap-4 rounded-3xl p-6 md:p-8', className)}
    >
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      {children}
    </section>
  )
}

export function InfoList({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm tabular-nums">
      {rows.map((row) => (
        <div key={row.label} className="contents">
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd className="text-right">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function TagList({ tags, listHref }: { tags: string[]; listHref: string }) {
  if (tags.length === 0) return <p className="text-sm text-muted-foreground">暂无标签</p>
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`${listHref}?tag=${encodeURIComponent(tag)}`}
          className="flex h-8 items-center rounded-full bg-seg-track px-3 text-sm text-ink-2 hover:text-foreground"
        >
          # {tag}
        </Link>
      ))}
    </div>
  )
}

/** 同类产品：紧凑列表 */
export function RelatedList({ items }: { items: ListingCardData[] }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">暂无同类产品</p>
  return (
    <ul className="-my-2.5 divide-y">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={listingPaths[item.kind].detail(item.slug)}
            className="group flex items-center gap-3 py-2.5"
          >
            <LetterIcon name={item.name} seed={item.slug} src={item.logoUrl} size={40} />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-[15px] font-semibold group-hover:text-brand">
                {item.name}
              </span>
              <span className="truncate text-[13px] text-muted-foreground">
                {item.category?.name ?? '未分类'}
              </span>
            </span>
            <span
              className={cn(
                'shrink-0 text-[13px] font-semibold tabular-nums',
                item.price > 0 ? 'text-credit' : 'text-free',
              )}
            >
              {item.price > 0 ? `${item.price} 积分/次` : '免费'}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
