import { ChevronLeftIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { CreditHistory } from '@/components/console/credit-history'
import Container from '@/components/container'
import CustomPagination from '@/components/shared/pagination'
import { Card, CardContent } from '@/components/ui/card'
import { getCreditHistory, getCurrentUser } from '@/lib/data'

export const metadata: Metadata = { title: '积分记录' }

export default async function CreditsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=/console/credits')
  const raw = (await searchParams).page
  const page = Math.max(1, Number(Array.isArray(raw) ? raw[0] : raw) || 1)
  const history = await getCreditHistory(user.id, page)

  return (
    <Container className="mt-8 flex max-w-[860px] flex-col gap-6 md:mt-12">
      <div className="flex flex-col gap-3">
        <Link
          href="/console"
          className="flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeftIcon className="size-4" />
          用户中心
        </Link>
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-[42px]">积分记录</h1>
          <p className="pb-1 text-sm text-muted-foreground tabular-nums">
            余额 {(user.credits ?? 0).toLocaleString('zh-CN')} · 共 {history.totalDocs} 条
          </p>
        </div>
      </div>
      <Card>
        <CardContent>
          <CreditHistory items={history.items} />
        </CardContent>
      </Card>
      <div className="flex justify-center">
        <Suspense>
          <CustomPagination routePrefix="/console/credits" totalPages={history.totalPages} />
        </Suspense>
      </div>
    </Container>
  )
}
