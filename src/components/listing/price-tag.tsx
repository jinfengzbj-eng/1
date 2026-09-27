import { CoinsIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export function PriceTag({ price, className }: { price: number; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
        price > 0
          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
        className,
      )}
    >
      {price > 0 && <CoinsIcon className="size-3" />}
      {price > 0 ? `${price} 积分/次` : '免费'}
    </span>
  )
}
