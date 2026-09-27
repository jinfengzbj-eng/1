// 改编自 Mkdirs 的 AuthCard（Apache-2.0）https://github.com/MkThingsHQ/mkdirs
import Link from 'next/link'
import type { ReactNode } from 'react'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

export function AuthCard({
  title,
  description,
  footerText,
  footerLinkText,
  footerHref,
  children,
}: {
  title: string
  description?: string
  footerText: string
  footerLinkText: string
  footerHref: string
  children: ReactNode
}) {
  return (
    <Card className="w-full max-w-[420px] shadow-md">
      <CardHeader className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        {footerText}
        <Link href={footerHref} className="ml-1 font-medium text-primary hover:underline">
          {footerLinkText}
        </Link>
      </CardFooter>
    </Card>
  )
}
