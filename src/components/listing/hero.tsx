// 改编自 Mkdirs 的 HomeHero（Apache-2.0）https://github.com/MkThingsHQ/mkdirs
import Link from 'next/link'
import { Suspense } from 'react'

import SearchBox from '@/components/listing/search-box'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
    <div className="flex flex-col items-center justify-center">
      <div className="flex max-w-5xl flex-col items-center gap-8 text-center">
        {label && (
          <Link
            href={labelHref ?? '/register'}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'rounded-full px-4')}
          >
            <span>🎉</span>
            <span>{label}</span>
          </Link>
        )}

        <h1 className="max-w-5xl text-3xl font-bold text-balance sm:text-4xl md:text-5xl">
          {title} <span className="text-gradient_indigo-purple font-bold">{highlight}</span>
        </h1>

        {subtitle && (
          <p className="max-w-4xl text-balance text-muted-foreground sm:text-xl">{subtitle}</p>
        )}

        <div className="w-full">
          <Suspense>
            <SearchBox urlPrefix={urlPrefix} placeholder={searchPlaceholder} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
