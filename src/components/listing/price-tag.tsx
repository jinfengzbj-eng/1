import { cn } from '@/lib/utils'

export function PriceTag({ price, className }: { price: number; className?: string }) {
  return (
    <span
      className={cn(
        'flex h-6.5 shrink-0 items-center rounded-full px-2.5 text-[13px] font-semibold tabular-nums',
        price > 0 ? 'bg-credit-soft text-credit' : 'bg-free-soft text-free',
        className,
      )}
    >
      {price > 0 ? `${price} 积分/次` : '免费'}
    </span>
  )
}
