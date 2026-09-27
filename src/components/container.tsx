// 改编自 Mkdirs（Apache-2.0）https://github.com/MkThingsHQ/mkdirs
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export default function Container({
  className,
  children,
}: {
  className?: string
  children?: ReactNode
}) {
  return <div className={cn('mx-auto w-full max-w-[1232px] px-4', className)}>{children}</div>
}
