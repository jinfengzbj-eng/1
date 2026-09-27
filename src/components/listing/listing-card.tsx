// 改编自 Mkdirs 的 ItemCard2（Apache-2.0）https://github.com/MkThingsHQ/mkdirs
import { AwardIcon, HashIcon } from 'lucide-react'
import Link from 'next/link'

import { LetterIcon } from '@/components/letter-icon'
import { PriceTag } from '@/components/listing/price-tag'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { ListingCardData } from '@/lib/data'
import { cn } from '@/lib/utils'

const BADGE_LABELS = { new: '新品', hot: '热门', beta: '内测' } as const

export const listingPaths = {
  mcp: { list: '/', detail: (slug: string) => `/mcp/${slug}` },
  tool: { list: '/tools', detail: (slug: string) => `/tools/${slug}` },
}

export default function ListingCard({ item }: { item: ListingCardData }) {
  const paths = listingPaths[item.kind]
  const href = paths.detail(item.slug)

  return (
    <div
      className={cn(
        'flex flex-col justify-between rounded-lg border p-6',
        'shadow-sm transition-shadow duration-300 hover:shadow-md',
        item.featured
          ? 'border-orange-300 bg-orange-50/50 hover:bg-orange-50 dark:border-orange-900 dark:bg-orange-950/10 dark:hover:bg-accent/60'
          : 'transition-colors duration-300 hover:bg-accent/60',
      )}
    >
      <div className="flex flex-col gap-4">
        {/* 图标 + 名称 */}
        <div className="flex w-full items-center gap-4">
          <LetterIcon name={item.name} seed={item.slug} src={item.logoUrl} size={32} />
          <Link href={href} className="min-w-0 flex-1">
            <h3
              className={cn(
                'flex items-center gap-2 truncate text-xl font-medium',
                item.featured && 'font-semibold',
              )}
            >
              {item.featured && <AwardIcon className="size-5 shrink-0 text-indigo-500" />}
              <span className={cn('truncate', item.featured && 'text-gradient_indigo-purple')}>
                {item.name}
              </span>
            </h3>
          </Link>
          {item.badge && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {BADGE_LABELS[item.badge]}
            </span>
          )}
        </div>

        {/* 分类 + 价格 */}
        <div className="flex flex-wrap items-center gap-2">
          {item.category && (
            <Link
              href={`${paths.list}?category=${item.category.slug}`}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'h-6 rounded-md px-2 py-1',
              )}
            >
              <span className="text-sm text-muted-foreground">{item.category.name}</span>
            </Link>
          )}
          <PriceTag price={item.price} />
        </div>

        {/* 固定最小高度，让同一行卡片等高 */}
        <Link href={href} className="block cursor-pointer">
          <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-relaxed">{item.summary}</p>
        </Link>
      </div>

      {/* 标签 */}
      <div className="mt-4 flex items-center justify-end">
        {item.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {item.tags.slice(0, 4).map((tag) => (
              <Link
                key={tag}
                href={`${paths.list}?tag=${encodeURIComponent(tag)}`}
                className="group flex items-center justify-center gap-0.5"
              >
                <HashIcon className="icon-scale size-3 text-muted-foreground" />
                <span className="link-underline text-sm text-muted-foreground">{tag}</span>
              </Link>
            ))}
            {item.tags.length > 4 && (
              <span className="px-1 text-sm text-muted-foreground">+{item.tags.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function ListingCardSkeleton() {
  return (
    <div className="flex flex-col justify-between rounded-lg border p-6">
      <div className="flex flex-col gap-4">
        <div className="flex w-full items-center gap-4">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="h-7 w-48" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-[4.5rem] w-full" />
      </div>
      <div className="mt-4 flex items-center justify-end gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-14" />
      </div>
    </div>
  )
}
