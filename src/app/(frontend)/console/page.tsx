import { CoinsIcon, ExternalLinkIcon, HistoryIcon, KeyRoundIcon, TicketIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { ApiKeyCard } from '@/components/console/api-key-card'
import Container from '@/components/container'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getCurrentUser, getSiteSettings } from '@/lib/data'

export const metadata: Metadata = { title: '用户中心' }

export default async function ConsolePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=/console')
  const settings = await getSiteSettings()
  const displayName = user.nickname || user.email.split('@')[0]

  return (
    <Container className="mt-10 mb-16 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">用户中心</h1>
        <p className="mt-2 text-muted-foreground">你好，{displayName}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 积分余额 */}
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <CoinsIcon className="size-4 text-amber-500" />
              积分余额
            </CardDescription>
            <CardTitle className="text-5xl font-bold">
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
        <Card id="api-key" className="scroll-mt-24 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <KeyRoundIcon className="size-5 text-primary" />
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
        {/* 兑换卡密（下一步接入真实兑换逻辑） */}
        <Card id="redeem" className="scroll-mt-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TicketIcon className="size-5 text-primary" />
              兑换卡密
            </CardTitle>
            {settings.redeemNote && <CardDescription>{settings.redeemNote}</CardDescription>}
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Input placeholder="XXXX-XXXX-XXXX-XXXX" className="h-10 font-mono" disabled />
            <Button disabled>兑换功能即将开放</Button>
          </CardContent>
        </Card>

        {/* 积分记录 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HistoryIcon className="size-5 text-primary" />
              积分记录
            </CardTitle>
            <CardDescription>兑换、消费记录会显示在这里</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              暂无记录
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}
