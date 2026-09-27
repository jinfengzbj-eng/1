// 改编自 Mkdirs 详情页（Apache-2.0）https://github.com/MkThingsHQ/mkdirs
import { HashIcon, HomeIcon, LayoutGridIcon } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import ListingGrid from '@/components/listing/listing-grid'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
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
    <Breadcrumb className="text-base">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={rootHref} className="flex items-center gap-1">
              <HomeIcon className="size-4" />
              <span>{rootLabel}</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {category && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`${rootHref}?category=${category.slug}`}>{category.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="font-medium">{name}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

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
    <section id={id} className={cn('scroll-mt-24 rounded-lg bg-muted/50 p-6', className)}>
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  )
}

export function InfoList({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <ul className="space-y-4 text-sm">
      {rows.map((row) => (
        <li key={row.label} className="flex justify-between gap-4">
          <span className="shrink-0 text-muted-foreground">{row.label}</span>
          <span className="text-right font-medium">{row.value}</span>
        </li>
      ))}
    </ul>
  )
}

export function TagList({ tags, listHref }: { tags: string[]; listHref: string }) {
  if (tags.length === 0) return <p className="text-sm text-muted-foreground">暂无标签</p>
  return (
    <ul className="flex flex-wrap gap-4">
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={`${listHref}?tag=${encodeURIComponent(tag)}`}
            className="group link-underline flex items-center gap-0.5 text-sm"
          >
            <HashIcon className="icon-scale size-3 text-muted-foreground" />
            <span>{tag}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function RelatedSection({ title, items }: { title: string; items: ListingCardData[] }) {
  if (items.length === 0) return null
  return (
    <div className="mt-8 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <LayoutGridIcon className="size-4 text-indigo-500" />
        <h2 className="text-gradient_indigo-purple text-lg font-semibold tracking-wider">
          {title}
        </h2>
      </div>
      <div className="mt-4">
        <ListingGrid items={items} />
      </div>
    </div>
  )
}
