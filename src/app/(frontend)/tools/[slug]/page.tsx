// 信息结构参考 Mkdirs 详情页（Apache-2.0）https://github.com/MkThingsHQ/mkdirs
import { ExternalLinkIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import Container from '@/components/container'
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
import { getCurrentUser, getRelated, getSiteSettings, getToolBySlug, toCard } from '@/lib/data'
import { formatDate } from '@/lib/utils'

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
  const credits = user ? (user.credits ?? 0) : null
  const start = { label: '开始使用', href: doc.url, external: true }
  const infoRows = [{ label: '更新时间', value: formatDate(doc.updatedAt) }]

  return (
    <Container className="mt-6 flex flex-col gap-6 md:mt-10 md:gap-8">
      <DetailBreadcrumb
        rootLabel="AI 工具"
        rootHref="/tools"
        category={card.category}
        name={doc.name}
      />

      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[minmax(0,1fr)_392px]">
        <DetailHeader
          item={card}
          chips={[card.category?.name, doc.badge ? BADGE_LABELS[doc.badge] : null].filter(
            (chip): chip is string => !!chip,
          )}
          actions={
            <Button asChild size="lg" className="h-12 rounded-[14px] text-base">
              <Link href={doc.url} target="_blank" rel="noreferrer">
                <ExternalLinkIcon />
                开始使用
              </Link>
            </Button>
          }
        />
        <div className="hidden md:block">
          <PriceCard
            price={doc.creditsPerUse}
            unitLabel="每次使用消耗"
            credits={credits}
            signupBonus={settings.signupBonus ?? 0}
            loginNext={`/tools/${doc.slug}`}
            action={start}
            rows={infoRows}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[minmax(0,1fr)_392px] md:gap-8">
        <Panel title="介绍">
          <Markdown source={doc.description} />
        </Panel>
        <div className="flex flex-col gap-6">
          <Panel title="信息" className="md:hidden">
            <InfoList rows={infoRows} />
          </Panel>
          <Panel title="标签">
            <TagList tags={card.tags} listHref="/tools" />
          </Panel>
          <Panel title="同类工具">
            <RelatedList items={related} />
          </Panel>
        </div>
      </div>

      <MobileActionBar
        price={doc.creditsPerUse}
        unit="次"
        credits={credits}
        loginNext={`/tools/${doc.slug}`}
        action={start}
      />
    </Container>
  )
}
