import { CoinsIcon, ExternalLinkIcon, HistoryIcon, KeyRoundIcon, TicketIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { ApiKeyCard } from '@/components/console/api-key-card'
import { CreditHistory } from '@/components/console/credit-history'
import { RedeemForm } from '@/components/console/redeem-form'
import Container from '@/components/container'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCreditHistory, getCurrentUser, getSiteSettings } from '@/lib/data'

export const metadata: Metadata = { title: '用户中心' }

const RECENT_COUNT = 8

export default async function ConsolePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=/console')
  const [settings, history] = await Promise.all([
    getSiteSettings(),
    getCreditHistory(user.id, 1, RECENT_COUNT),
  ])
  const displayName = user.nickname || user.email.split('@')[0]

  return (
    <Container className="mt-8 flex flex-col gap-6 md:mt-12 md:gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-[42px]">用户中心</h1>
        <p className="text-ink-2">你好，{displayName}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 积分余额 */}
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <CoinsIcon className="size-4 text-credit" />
              积分余额
            </CardDescription>
            <CardTitle className="text-[52px] leading-none font-bold tracking-[-0.03em] tabular-nums">
              {(user.credits ?? 0).toLocaleString('zh-CN')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="#redeem">兑换卡密</Link>
            </Button>
            {settings.buyCodesUrl && (
              <Button asChild variant="outline">
                <Link href={settings.buyCodesUrl} target="_blank" rel="noreferrer">
                  购买卡密
                  <ExternalLinkIcon />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* 接入密钥 */}
        <Card id="api-key" className="scroll-mt-28 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <KeyRoundIcon className="size-5 text-brand" />
              接入密钥
            </CardTitle>
            <CardDescription>在 AI 客户端里接入 MCP 服务时使用</CardDescription>
          </CardHeader>
          <CardContent>
            {user.apiKey ? (
              <ApiKeyCard initialKey={user.apiKey} />
            ) : (
              <p className="text-sm text-muted-foreground">密钥还没有生成，请联系客服。</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 兑换卡密 */}
        <Card id="redeem" className="scroll-mt-28">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TicketIcon className="size-5 text-brand" />
              兑换卡密
            </CardTitle>
            <CardDescription>
              {settings.redeemNote || '输入卡密，积分立即到账，可用于所有 MCP 服务和 AI 工具。'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <RedeemForm />
            {settings.buyCodesUrl && (
              <Link
                href={settings.buyCodesUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1 text-sm text-brand hover:underline"
              >
                还没有卡密？去购买
                <ExternalLinkIcon className="size-3.5" />
              </Link>
            )}
          </CardContent>
        </Card>

        {/* 积分记录 */}
        <Card id="history" className="scroll-mt-28 lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <CardTitle className="flex items-center gap-2 text-lg">
                <HistoryIcon className="size-5 text-brand" />
                积分记录
              </CardTitle>
              <CardDescription>兑换、消费、退款都会记在这里</CardDescription>
            </div>
            {history.totalDocs > RECENT_COUNT && (
              <Link href="/console/credits" className="shrink-0 text-sm text-brand hover:underline">
                全部 {history.totalDocs} 条
              </Link>
            )}
          </CardHeader>
          <CardContent>
            <CreditHistory items={history.items} />
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}
