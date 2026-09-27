// 布局改编自 Mkdirs 详情页（Apache-2.0）https://github.com/MkThingsHQ/mkdirs
import { ArrowDownIcon, AwardIcon, WrenchIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import Container from '@/components/container'
import { ConfigTabs } from '@/components/detail/config-tabs'
import {
  DetailBreadcrumb,
  InfoList,
  Panel,
  RelatedSection,
  TagList,
} from '@/components/detail/detail-parts'
import { PriceCard } from '@/components/detail/price-card'
import { LetterIcon } from '@/components/letter-icon'
import { Markdown } from '@/components/shared/markdown'
import { Button } from '@/components/ui/button'
import {
  getCurrentUser,
  getMcpBySlug,
  getRelated,
  getSiteSettings,
  mediaUrl,
  toCard,
} from '@/lib/data'
import { buildClientConfigs } from '@/lib/mcp-config'
import { cn, formatDate } from '@/lib/utils'

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
  const configs = buildClientConfigs({
    slug: doc.slug,
    endpoint: doc.endpoint,
    transport: doc.transport,
    apiKey: user?.apiKey,
  })

  return (
    <Container className="mt-8 mb-16 flex flex-col gap-8">
      {/* 头部 */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="flex flex-col gap-8 lg:col-span-3">
          <DetailBreadcrumb rootLabel="MCP 服务" rootHref="/" category={card.category} name={doc.name} />

          <div className="flex flex-col gap-6">
            <div className="flex w-full items-center gap-4">
              <LetterIcon name={doc.name} seed={doc.slug} src={mediaUrl(doc.logo)} size={48} />
              <h1
                className={cn(
                  'flex items-center gap-2 text-3xl font-bold tracking-wide sm:text-4xl',
                  doc.featured && 'text-gradient_indigo-purple',
                )}
              >
                {doc.name}
              </h1>
              {doc.featured && <AwardIcon className="size-6 shrink-0 text-indigo-500" />}
            </div>
            <p className="leading-relaxed text-balance text-muted-foreground">{doc.summary}</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button size="lg" asChild className="group">
              <Link href="#connect">
                <ArrowDownIcon className="icon-scale" />
                查看接入配置
              </Link>
            </Button>
            {(doc.tools?.length ?? 0) > 0 && (
              <Button size="lg" variant="outline" asChild>
                <Link href="#tools">
                  <WrenchIcon />
                  {doc.tools!.length} 个工具
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <PriceCard
            price={doc.creditsPerCall}
            unitLabel="每次调用消耗"
            credits={user ? (user.credits ?? 0) : null}
            signupBonus={settings.signupBonus ?? 0}
            loginNext={`/mcp/${doc.slug}`}
            action={{ label: '复制配置，立即接入', href: '#connect' }}
          />
        </div>
      </div>

      {/* 内容 */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="flex flex-col gap-8 lg:col-span-3">
          <Panel title="介绍">
            <Markdown source={doc.description} />
          </Panel>

          {(doc.tools?.length ?? 0) > 0 && (
            <Panel title="提供的工具" id="tools">
              <ul className="divide-y">
                {doc.tools!.map((tool) => (
                  <li key={tool.id ?? tool.name} className="py-3 first:pt-0 last:pb-0">
                    <code className="rounded bg-background px-1.5 py-0.5 font-mono text-sm font-semibold">
                      {tool.name}
                    </code>
                    {tool.description && (
                      <p className="mt-1.5 text-sm text-muted-foreground">{tool.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          <Panel title="接入配置" id="connect">
            {!user && (
              <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                <Link href={`/login?next=/mcp/${doc.slug}`} className="font-medium underline">
                  登录
                </Link>
                后，配置里的密钥会自动填好，复制粘贴即可使用。
              </p>
            )}
            <ConfigTabs configs={configs} />
          </Panel>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <Panel title="信息">
            <InfoList
              rows={[
                { label: '分类', value: card.category?.name ?? '未分类' },
                {
                  label: '计费',
                  value: doc.creditsPerCall > 0 ? `${doc.creditsPerCall} 积分 / 次调用` : '免费',
                },
                { label: '传输方式', value: doc.transport === 'http' ? 'Streamable HTTP' : 'SSE' },
                ...(doc.version ? [{ label: '版本', value: doc.version }] : []),
                { label: '更新时间', value: formatDate(doc.updatedAt) },
              ]}
            />
          </Panel>
          <Panel title="标签">
            <TagList tags={card.tags} listHref="/" />
          </Panel>
        </div>
      </div>

      <RelatedSection title="更多 MCP 服务" items={related} />
    </Container>
  )
}
