// 改编自 Mkdirs 的 HomeCategoryList（Apache-2.0）https://github.com/MkThingsHQ/mkdirs
'use client'

import { ChevronRightIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'

type CategoryItem = { name: string; slug: string }

export default function CategoryList({
  categories,
  urlPrefix,
  allLabel,
}: {
  categories: CategoryItem[]
  urlPrefix: string
  allLabel: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selected = searchParams.get('category') ?? ''

  const select = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) params.set('category', slug)
    else params.delete('category')
    params.delete('page')
    const query = params.toString()
    router.push(query ? `${urlPrefix}?${query}` : urlPrefix)
  }

  const items = [{ name: allLabel, slug: '' }, ...categories]

  return (
    <div className="rounded-lg border p-4">
      <ul className="flex w-full flex-col gap-y-2">
        {items.map((item) => (
          <li key={item.slug || 'all'}>
            <Button
              variant={item.slug === selected ? 'default' : 'ghost'}
              size="sm"
              className="w-full justify-between px-3"
              onClick={() => select(item.slug)}
            >
              <span>{item.name}</span>
              <ChevronRightIcon className="size-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
