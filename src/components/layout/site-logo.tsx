import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@/lib/utils'

export type SiteBrand = { name: string; logoUrl: string | null }

export function SiteLogo({
  brand,
  size = 34,
  className,
}: {
  brand: SiteBrand
  size?: number
  className?: string
}) {
  const radius = Math.round(size * 0.29)
  return (
    <Link href="/" className={cn('flex items-center gap-2.5', className)}>
      {brand.logoUrl ? (
        <Image
          src={brand.logoUrl}
          alt=""
          width={size}
          height={size}
          className="icon-tile object-cover"
          style={{ width: size, height: size, borderRadius: radius }}
        />
      ) : (
        <span
          aria-hidden
          className="icon-tile inline-flex items-center justify-center font-semibold text-white"
          style={{
            width: size,
            height: size,
            borderRadius: radius,
            fontSize: Math.round(size * 0.47),
            background: 'linear-gradient(145deg, #4c9bff, #0b5ed7)',
          }}
        >
          {Array.from(brand.name.trim())[0] ?? 'M'}
        </span>
      )}
      <span className="text-lg font-bold tracking-tight">{brand.name}</span>
    </Link>
  )
}
