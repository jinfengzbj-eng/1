// 改编自 Mkdirs 的 HomeHero（Apache-2.0）https://github.com/MkThingsHQ/mkdirs
import { GiftIcon } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

import SearchBox from '@/components/listing/search-box'

/**
 * 列表页首屏。
 * 桌面端：居中的大标语 + 玻璃搜索框。
 * 手机端：只留页面名称做大标题，下面紧跟搜索框（参照 App Store 和 iOS 的大标题页面）。
 */
export default function Hero({
  label,
  labelHref,
  title,
  highlight,
  subtitle,
  mobileTitle,
  urlPrefix,
  searchPlaceholder,
  mobileSearchPlaceholder,
}: {
  label?: string | null
  labelHref?: string
  title?: string | null
  highlight?: string | null
  subtitle?: string | null
  mobileTitle: string
  urlPrefix: string
  searchPlaceholder: string
  mobileSearchPlaceholder: string
}) {
  return (
    <header className="flex flex-col gap-3 md:items-center md:gap-5 md:text-center">
      {label && (
        <Link
          href={labelHref ?? '/register'}
          className="glass-thin flex h-8.5 items-center gap-2 rounded-full px-4 text-sm text-ink-2 hover:text-foreground max-md:hidden"
        >
          <GiftIcon className="size-4 text-brand" />
          {label}
        </Link>
      )}
      <h1 className="px-1 text-[32px] leading-tight font-bold tracking-[-0.025em] text-balance md:px-0 md:text-[60px] md:leading-[1.12]">
        <span className="md:hidden">{mobileTitle}</span>
        <span className="max-md:hidden">
          {title} <span className="text-brand">{highlight}</span>
        </span>
      </h1>
      {subtitle && (
        <p className="max-w-[680px] text-[19px] leading-relaxed text-ink-2 max-md:hidden">
          {subtitle}
        </p>
      )}
      <div className="w-full md:mt-3">
        <Suspense>
          <SearchBox
            urlPrefix={urlPrefix}
            placeholder={searchPlaceholder}
            mobilePlaceholder={mobileSearchPlaceholder}
          />
        </Suspense>
      </div>
    </header>
  )
}
