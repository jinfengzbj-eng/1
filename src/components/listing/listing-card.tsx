// 信息结构参考 Mkdirs 的 ItemCard2（Apache-2.0）https://github.com/MkThingsHQ/mkdirs
import Link from 'next/link'

import { LetterIcon } from '@/components/letter-icon'
import { PriceTag } from '@/components/listing/price-tag'
import { Skeleton } from '@/components/ui/skeleton'
import type { ListingCardData } from '@/lib/data'

export const BADGE_LABELS = { new: '新品', hot: '热门', beta: '内测' } as const

export const listingPaths = {
  mcp: { list: '/', detail: (slug: string) => `/mcp/${slug}` },
  tool: { list: '/tools', detail: (slug: string) => `/tools/${slug}` },
}

/** 产品卡片（桌面端）：内容层，实心，整张卡片可点 */
export default function ListingCard({ item }: { item: ListingCardData }) {
  const meta = [item.category?.name, item.toolsCount > 0 ? `${item.toolsCount} 个工具` : null]
    .filter(Boolean)
    .join(' · ')

  return (
    <Link
      href={listingPaths[item.kind].detail(item.slug)}
      className="surface group flex flex-col gap-3.5 rounded-[22px] p-5 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:p-5.5"
    >
      <div className="flex items-center gap-3">
        <LetterIcon name={item.name} seed={item.slug} src={item.logoUrl} size={44} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="truncate text-[17px] font-semibold tracking-tight group-hover:text-brand">
            {item.name}
          </h3>
          {meta && <p className="truncate text-[13px] text-muted-foreground">{meta}</p>}
        </div>
        {item.featured && <Chip>推荐</Chip>}
        {item.badge && <Chip>{BADGE_LABELS[item.badge]}</Chip>}
      </div>
      <p className="line-clamp-3 min-h-[4.45em] text-sm leading-[1.7] text-ink-2">{item.summary}</p>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 gap-2.5 overflow-hidden text-[13px] whitespace-nowrap text-muted-foreground">
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
        <PriceTag price={item.price} />
      </div>
    </Link>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-6 shrink-0 items-center rounded-full bg-brand-soft px-2.5 text-xs font-semibold text-brand">
      {children}
    </span>
  )
}

export function ListingCardSkeleton() {
  return (
    <div className="surface flex flex-col gap-3.5 rounded-[22px] p-5.5">
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 rounded-xl" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-[4.45em] w-full" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  )
}
