// 改编自 Mkdirs 的 HomeHero（Apache-2.0）https://github.com/MkThingsHQ/mkdirs
import { GiftIcon } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

import SearchBox from '@/components/listing/search-box'

export default function Hero({
  label,
  labelHref,
  title,
  highlight,
  subtitle,
  urlPrefix,
  searchPlaceholder,
}: {
  label?: string | null
  labelHref?: string
  title?: string | null
  highlight?: string | null
  subtitle?: string | null
  urlPrefix: string
  searchPlaceholder: string
}) {
  return (
    <header className="flex flex-col items-center gap-4 text-center md:gap-5">
      {label && (
        <Link
          href={labelHref ?? '/register'}
          className="glass-thin flex h-8.5 items-center gap-2 rounded-full px-4 text-sm text-ink-2 hover:text-foreground"
        >
          <GiftIcon className="size-4 text-brand" />
          {label}
        </Link>
      )}
      <h1 className="text-[34px] leading-tight font-bold tracking-[-0.025em] text-balance md:text-[60px] md:leading-[1.12]">
        {title} <span className="text-brand">{highlight}</span>
      </h1>
      {subtitle && (
        <p className="max-w-[680px] text-[15px] leading-relaxed text-ink-2 md:text-[19px]">
          {subtitle}
        </p>
      )}
      <div className="mt-2 w-full md:mt-3">
        <Suspense>
          <SearchBox urlPrefix={urlPrefix} placeholder={searchPlaceholder} />
        </Suspense>
      </div>
    </header>
  )
}
