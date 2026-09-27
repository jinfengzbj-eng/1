// 信息结构参考 Mkdirs 详情页（Apache-2.0）https://github.com/MkThingsHQ/mkdirs
import { CheckIcon, CopyIcon, WrenchIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import Container from '@/components/container'
import { ConfigTabs } from '@/components/detail/config-tabs'
import {
  DetailBreadcrumb,
  DetailHeader,
  InfoList,
  Panel,
  RelatedList,
  TagList,
} from '@/components/detail/detail-parts'
import { MobileActionBar, PriceCard } from '@/components/detail/price-card'
import { Markdown } from '@/components/shared/markdown'
import { Button } from '@/components/ui/button'
import { getCurrentUser, getMcpBySlug, getRelated, getSiteSettings, toCard } from '@/lib/data'
import { buildClientConfigs } from '@/lib/mcp-config'
import { formatDate } from '@/lib/utils'

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
  const connect = { label: '立即接入', href: '#connect' }

  return (
    <Container className="mt-6 flex flex-col gap-6 md:mt-10 md:gap-8">
      <DetailBreadcrumb
        rootLabel="MCP 服务"
        rootHref="/"
        category={card.category}
        name={doc.name}
      />

      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[minmax(0,1fr)_392px]">
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
        <div className="hidden md:block">
          <PriceCard
            price={doc.creditsPerCall}
            unitLabel="每次调用消耗"
            credits={credits}
            signupBonus={settings.signupBonus ?? 0}
            loginNext={`/mcp/${doc.slug}`}
            action={connect}
            rows={infoRows}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[minmax(0,1fr)_392px] md:gap-8">
        <div className="flex flex-col gap-6">
          <Panel title="介绍">
            <Markdown source={doc.description} />
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

          <section
            id="connect"
            className="surface flex scroll-mt-28 flex-col gap-4 rounded-3xl p-6 md:p-8"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold tracking-tight">接入配置</h2>
              {user ? (
                <span className="flex items-center gap-1.5 text-[13px] text-free">
                  <CheckIcon className="size-4" />
                  已自动填入你的密钥
                </span>
              ) : (
                <Link
                  href={`/login?next=/mcp/${doc.slug}`}
                  className="text-[13px] text-brand hover:underline"
                >
                  登录后自动填入密钥
                </Link>
              )}
            </div>
            <ConfigTabs configs={configs} />
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="信息" className="md:hidden">
            <InfoList rows={infoRows} />
          </Panel>
          <Panel title="标签">
            <TagList tags={card.tags} listHref="/" />
          </Panel>
          <Panel title="同类服务">
            <RelatedList items={related} />
          </Panel>
        </div>
      </div>

      <MobileActionBar
        price={doc.creditsPerCall}
        unit="次"
        credits={credits}
        loginNext={`/mcp/${doc.slug}`}
        action={connect}
      />
    </Container>
  )
}
