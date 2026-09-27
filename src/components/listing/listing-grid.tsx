import ListingCard, { ListingCardSkeleton } from '@/components/listing/listing-card'
import { ListingRow } from '@/components/listing/listing-row'
import type { ListingCardData } from '@/lib/data'

/** 产品列表：手机端是一行一个的分组列表，桌面端是卡片网格 */
export default function ListingGrid({ items }: { items: ListingCardData[] }) {
  if (items.length === 0) {
    return (
      <div className="surface flex h-40 w-full flex-col items-center justify-center gap-1 rounded-[22px] text-center">
        <p className="font-medium">没有找到符合条件的内容</p>
        <p className="text-sm text-muted-foreground">换个关键词，或者清除筛选条件试试</p>
      </div>
    )
  }
  return (
    <>
      <ul className="surface overflow-hidden rounded-[20px] md:hidden">
        {items.map((item) => (
          <ListingRow key={`${item.kind}-${item.id}`} item={item} />
        ))}
      </ul>
      <div className="grid grid-cols-2 gap-5 max-md:hidden lg:grid-cols-3">
        {items.map((item) => (
          <ListingCard key={`${item.kind}-${item.id}`} item={item} />
        ))}
      </div>
    </>
  )
}

export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  )
}
