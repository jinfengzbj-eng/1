import ListingCard, { ListingCardSkeleton } from '@/components/listing/listing-card'
import type { ListingCardData } from '@/lib/data'

export default function ListingGrid({ items }: { items: ListingCardData[] }) {
  if (items.length === 0) {
    return (
      <div className="my-8 flex h-32 w-full items-center justify-center rounded-lg border border-dashed">
        <p className="font-medium text-muted-foreground">没有找到符合条件的内容，换个关键词试试</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ListingCard key={`${item.kind}-${item.id}`} item={item} />
      ))}
    </div>
  )
}

export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  )
}
