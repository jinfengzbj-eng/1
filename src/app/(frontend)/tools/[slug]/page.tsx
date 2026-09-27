// 布局改编自 Mkdirs 详情页（Apache-2.0）https://github.com/MkThingsHQ/mkdirs
import { AwardIcon, ExternalLinkIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import Container from '@/components/container'
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
  getRelated,
  getSiteSettings,
  getToolBySlug,
  mediaUrl,
  toCard,
} from '@/lib/data'
import { cn, formatDate } from '@/lib/utils'

type Props = { params: Promise<{ slug: string }> }

const BADGE_LABELS = { new: '新品', hot: '热门', beta: '内测' } as const

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = await getToolBySlug((await params).slug)
  if (!doc) return {}
  return { title: doc.name, description: doc.summary }
}

export default async function ToolDetailPage({ params }: Props) {
  const { slug } = await params
  const doc = await getToolBySlug(slug)
  if (!doc) notFound()

  const [user, settings, related] = await Promise.all([
    getCurrentUser(),
    getSiteSettings(),
    getRelated('tool', doc),
  ])
  const card = toCard(doc, 'tool')

  return (
    <Container className="mt-8 mb-16 flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="flex flex-col gap-8 lg:col-span-3">
          <DetailBreadcrumb rootLabel="AI 工具" rootHref="/tools" category={card.category} name={doc.name} />

          <div className="flex flex-col gap-6">
            <div className="flex w-full items-center gap-4">
              <LetterIcon name={doc.name} seed={doc.slug} src={mediaUrl(doc.logo)} size={48} />
              <h1
                className={cn(
                  'text-3xl font-bold tracking-wide sm:text-4xl',
                  doc.featured && 'text-gradient_indigo-purple',
                )}
              >
                {doc.name}
              </h1>
              {doc.featured && <AwardIcon className="size-6 shrink-0 text-indigo-500" />}
              {doc.badge && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
                  {BADGE_LABELS[doc.badge]}
                </span>
              )}
            </div>
            <p className="leading-relaxed text-balance text-muted-foreground">{doc.summary}</p>
          </div>

          <div className="flex gap-4">
            <Button size="lg" asChild className="group">
              <Link href={doc.url} target="_blank" rel="noreferrer">
                <ExternalLinkIcon className="icon-scale" />
                开始使用
              </Link>
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <PriceCard
            price={doc.creditsPerUse}
            unitLabel="每次使用消耗"
            credits={user ? (user.credits ?? 0) : null}
            signupBonus={settings.signupBonus ?? 0}
            loginNext={`/tools/${doc.slug}`}
            action={{ label: '开始使用', href: doc.url, external: true }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="flex flex-col gap-8 lg:col-span-3">
          <Panel title="介绍">
            <Markdown source={doc.description} />
          </Panel>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <Panel title="信息">
            <InfoList
              rows={[
                { label: '分类', value: card.category?.name ?? '未分类' },
                {
                  label: '计费',
                  value: doc.creditsPerUse > 0 ? `${doc.creditsPerUse} 积分 / 次使用` : '免费',
                },
                { label: '更新时间', value: formatDate(doc.updatedAt) },
              ]}
            />
          </Panel>
          <Panel title="标签">
            <TagList tags={card.tags} listHref="/tools" />
          </Panel>
        </div>
      </div>

      <RelatedSection title="更多 AI 工具" items={related} />
    </Container>
  )
}
