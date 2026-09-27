// 信息结构参考 Mkdirs 详情页（Apache-2.0）https://github.com/MkThingsHQ/mkdirs
import { CheckIcon, CopyIcon, LayoutGridIcon, WrenchIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import Container from '@/components/container'
import { ConfigTabs } from '@/components/detail/config-tabs'
import {
  DetailBreadcrumb,
  DetailHeader,
  Panel,
  RelatedList,
  TagList,
} from '@/components/detail/detail-parts'
import { DetailTopBar } from '@/components/detail/detail-top-bar'
import { MobileCollapse } from '@/components/detail/mobile-collapse'
import {
  type DetailAction,
  InfoStrip,
  MobileDetailHeader,
  priceStripItem,
  type StripItem,
} from '@/components/detail/mobile-detail'
import { PriceCard } from '@/components/detail/price-card'
import { Markdown } from '@/components/shared/markdown'
import { Button } from '@/components/ui/button'
import { getCurrentUser, getMcpBySlug, getRelated, getSiteSettings, toCard } from '@/lib/data'
import { buildClientConfigs } from '@/lib/mcp-config'
import { formatDate, formatShortDate } from '@/lib/utils'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = await getMcpBySlug((await params).slug)
  if (!doc) return {}
  return { title: doc.name, description: doc.summary }
}

export default async function McpDetailPage({ params }: Props) {
  const { slug } = await params
  const doc = await getMcpBySlug(slug)
  if (!doc) notFound()

  const [user, settings, related] = await Promise.all([
    getCurrentUser(),
    getSiteSettings(),
    getRelated('mcp', doc),
  ])
  const card = toCard(doc, 'mcp')
  const tools = doc.tools ?? []
  const credits = user ? (user.credits ?? 0) : null
  const price = doc.creditsPerCall
  const loginNext = `/mcp/${doc.slug}`
  const configs = buildClientConfigs({
    slug: doc.slug,
    endpoint: doc.endpoint,
    transport: doc.transport,
    apiKey: user?.apiKey,
  })
  const infoRows = [
    { label: '传输方式', value: doc.transport === 'http' ? 'Streamable HTTP' : 'SSE' },
    ...(doc.version ? [{ label: '版本', value: doc.version }] : []),
    { label: '更新时间', value: formatDate(doc.updatedAt) },
  ]
  const connect: DetailAction = { label: '立即接入', href: '#connect' }
  // 手机端的主按钮：登录了就跳到接入配置，没登录先去登录
  const mobileAction: DetailAction = user
    ? { label: '接入', href: '#connect' }
    : { label: '登录后接入', href: `/login?next=${encodeURIComponent(loginNext)}` }
  const strip: StripItem[] = [
    priceStripItem(price),
    ...(tools.length > 0 ? [{ label: '工具', value: tools.length, sub: '个' }] : []),
    {
      label: '分类',
      value: <LayoutGridIcon className="size-5" strokeWidth={1.9} />,
      sub: card.category?.name ?? '未分类',
    },
    doc.version
      ? { label: '版本', value: doc.version, sub: formatShortDate(doc.updatedAt) }
      : { label: '更新', value: formatShortDate(doc.updatedAt), sub: '最近更新' },
  ]

  return (
    <Container className="flex flex-col gap-6 pt-16 md:mt-10 md:gap-8 md:pt-0">
      <DetailTopBar item={card} listHref="/" action={mobileAction} />

      <DetailBreadcrumb
        rootLabel="MCP 服务"
        rootHref="/"
        category={card.category}
        name={doc.name}
      />

      <MobileDetailHeader
        item={card}
        action={mobileAction}
        priceText={price > 0 ? `${price} 积分 / 次` : '免费'}
      />
      <InfoStrip items={strip} />

      <div className="grid grid-cols-[minmax(0,1fr)_392px] items-start gap-8 max-md:hidden">
        <DetailHeader
          item={card}
          chips={[card.category?.name, doc.version ? `v${doc.version}` : null].filter(
            (chip): chip is string => !!chip,
          )}
          actions={
            <>
              <Button asChild size="lg" className="h-12 rounded-[14px] text-base">
                <Link href="#connect">
                  <CopyIcon />
                  复制配置，立即接入
                </Link>
              </Button>
              {tools.length > 0 && (
                <Button asChild size="lg" variant="glass" className="h-12 rounded-[14px] text-base">
                  <Link href="#tools">
                    <WrenchIcon />
                    {tools.length} 个工具
                  </Link>
                </Button>
              )}
            </>
          }
        />
        <PriceCard
          price={price}
          unitLabel="每次调用消耗"
          credits={credits}
          signupBonus={settings.signupBonus ?? 0}
          loginNext={loginNext}
          action={connect}
          rows={infoRows}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[minmax(0,1fr)_392px] md:gap-8">
        <div className="flex flex-col gap-6">
          <Panel title="介绍" mobileCard={false}>
            <MobileCollapse>
              <Markdown source={doc.description} />
            </MobileCollapse>
          </Panel>

          {tools.length > 0 && (
            <Panel title="提供的工具" id="tools">
              <ul className="-my-3 divide-y">
                {tools.map((tool) => (
                  <li key={tool.id ?? tool.name} className="flex flex-col gap-2 py-3.5">
                    <code className="self-start rounded-lg bg-code px-2 py-0.5 font-mono text-sm font-semibold">
                      {tool.name}
                    </code>
                    {tool.description && <p className="text-sm text-ink-2">{tool.description}</p>}
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {/* 手机端排在最前面：打开页面就能复制配置 */}
          <Panel
            title="接入配置"
            id="connect"
            className="max-md:order-first"
            action={
              user ? (
                <span className="flex items-center gap-1 text-xs text-free md:gap-1.5 md:text-[13px]">
                  <CheckIcon className="size-3.5 md:size-4" />
                  <span className="md:hidden">已填入你的密钥</span>
                  <span className="max-md:hidden">已自动填入你的密钥</span>
                </span>
              ) : (
                <Link
                  href={`/login?next=${encodeURIComponent(loginNext)}`}
                  className="text-xs text-brand hover:underline md:text-[13px]"
                >
                  登录后自动填入密钥
                </Link>
              )
            }
          >
            <div className="flex flex-col gap-3">
              <ConfigTabs configs={configs} />
              {credits !== null && (
                <p className="text-center text-xs text-muted-foreground tabular-nums md:hidden">
                  {price > 0 ? `每次调用扣 ${price} 积分 · ` : '免费使用，不扣积分 · '}
                  当前余额 {credits}
                  {' · '}
                  <Link href="/console#redeem" className="text-brand">
                    兑换卡密
                  </Link>
                </p>
              )}
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="标签" mobileCard={false}>
            <TagList tags={card.tags} listHref="/" />
          </Panel>
          <Panel title="同类服务">
            <RelatedList items={related} />
          </Panel>
        </div>
      </div>
    </Container>
  )
}
