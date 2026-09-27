import Link from 'next/link'

import { LetterIcon } from '@/components/letter-icon'
import { cn } from '@/lib/utils'

export type SiteBrand = { name: string; logoUrl: string | null }

export function SiteLogo({
  brand,
  className,
  onClick,
}: {
  brand: SiteBrand
  className?: string
  onClick?: () => void
}) {
  return (
    <Link href="/" onClick={onClick} className={cn('flex items-center gap-2', className)}>
      <LetterIcon name={brand.name} seed="site" src={brand.logoUrl} size={32} />
      <span className="text-xl font-bold">{brand.name}</span>
    </Link>
  )
}
