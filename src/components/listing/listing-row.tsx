import Link from 'next/link'

import { LetterIcon } from '@/components/letter-icon'
import { BADGE_LABELS, listingPaths } from '@/components/listing/listing-card'
import type { ListingCardData } from '@/lib/data'
import { cn } from '@/lib/utils'

/**
 * 产品列表行（手机端），参照 App Store 的列表：
 * 图标、名称、一句话介绍、分类，右边是价格按钮。一屏能看 6～7 个。
 */
export function ListingRow({ item }: { item: ListingCardData }) {
  const meta = [item.category?.name, item.toolsCount > 0 ? `${item.toolsCount} 个工具` : null]
    .filter(Boolean)
    .join(' · ')
  const badge = item.featured ? '推荐' : item.badge ? BADGE_LABELS[item.badge] : null

  return (
    <li className="group">
      <Link
        href={listingPaths[item.kind].detail(item.slug)}
        className="flex items-center gap-3 pl-4 outline-none focus-visible:bg-seg-track active:bg-seg-track"
      >
        <LetterIcon name={item.name} seed={item.slug} src={item.logoUrl} size={52} />
        {/* 分隔线从文字开始，和 iOS 列表一致 */}
        <span className="flex min-w-0 flex-1 items-center gap-3 border-b py-3 pr-3.5 group-last:border-b-0">
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="truncate text-base font-semibold">{item.name}</span>
              {badge && (
                <span className="flex h-4.5 shrink-0 items-center rounded-md bg-brand-soft px-1.5 text-[11px] font-semibold text-brand">
                  {badge}
                </span>
              )}
            </span>
            <span className="truncate text-[13px] text-ink-2">{item.summary}</span>
            {meta && <span className="truncate text-xs text-muted-foreground">{meta}</span>}
          </span>
          <span
            className={cn(
              'flex h-7.5 min-w-16 shrink-0 items-center justify-center rounded-full bg-seg-track px-3 text-[13px] font-bold tabular-nums',
              item.price > 0 ? 'text-brand' : 'text-free',
            )}
          >
            {item.price > 0 ? `${item.price} 积分` : '免费'}
          </span>
        </span>
      </Link>
    </li>
  )
}
