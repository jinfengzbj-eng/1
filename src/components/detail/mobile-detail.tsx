// 手机端详情页头部，参照 App Store 的产品页：
// 图标、名称、一句话介绍和主按钮放最上面，下面一行横排看完关键信息。
import Link from 'next/link'
import type { ReactNode } from 'react'

import { LetterIcon } from '@/components/letter-icon'
import type { ListingCardData } from '@/lib/data'
import { cn } from '@/lib/utils'

export type DetailAction = { label: string; href: string; external?: boolean }

/** App Store 式的胶囊主按钮（“获取”按钮的位置） */
export function CtaPill({ action, className }: { action: DetailAction; className?: string }) {
  return (
    <Link
      href={action.href}
      target={action.external ? '_blank' : undefined}
      rel={action.external ? 'noreferrer' : undefined}
      className={cn(
        'btn-glow flex h-8 min-w-19 shrink-0 items-center justify-center rounded-full bg-primary px-4.5 text-[15px] font-bold text-primary-foreground',
        className,
      )}
    >
      {action.label}
    </Link>
  )
}

export function MobileDetailHeader({
  item,
  action,
  priceText,
}: {
  item: ListingCardData
  action: DetailAction
  priceText: string
}) {
  return (
    <div className="flex gap-4 px-1 md:hidden">
      <LetterIcon name={item.name} seed={item.slug} src={item.logoUrl} size={96} />
      <div className="flex min-w-0 flex-1 flex-col">
        <h1 className="text-[22px] leading-tight font-bold tracking-[-0.015em]">{item.name}</h1>
        <p className="mt-1 line-clamp-2 text-sm leading-snug text-ink-2">{item.summary}</p>
        <div className="mt-auto flex items-center gap-2.5 pt-2">
          <CtaPill action={action} />
          <span className="text-xs text-muted-foreground tabular-nums">{priceText}</span>
        </div>
      </div>
    </div>
  )
}

export type StripItem = { label: string; value: ReactNode; sub: string; tone?: 'brand' | 'free' }

/** 横排信息条：小标签 / 大数值 / 小说明，竖线分隔 */
export function InfoStrip({ items }: { items: StripItem[] }) {
  return (
    <dl
      className="grid border-y py-3.5 tabular-nums md:hidden"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((item, index) => (
        <div
          key={item.label}
          className={cn(
            'flex min-w-0 flex-col items-center gap-1 px-1 text-center',
            index > 0 && 'border-l',
          )}
        >
          <dt className="text-[11px] text-muted-foreground">{item.label}</dt>
          <dd
            className={cn(
              'flex h-6 max-w-full items-center truncate text-lg font-bold text-ink-2',
              item.tone === 'brand' && 'text-brand',
              item.tone === 'free' && 'text-free',
            )}
          >
            {item.value}
          </dd>
          <dd className="w-full truncate text-[11px] text-muted-foreground">{item.sub}</dd>
        </div>
      ))}
    </dl>
  )
}

/** 价格那一格 */
export function priceStripItem(price: number): StripItem {
  return price > 0
    ? { label: '价格', value: price, sub: '积分 / 次', tone: 'brand' }
    : { label: '价格', value: '免费', sub: '不扣积分', tone: 'free' }
}
