// 信息结构参考 Mkdirs 详情页（Apache-2.0）https://github.com/MkThingsHQ/mkdirs
import { ExternalLinkIcon, LayoutGridIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import Container from '@/components/container'
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
import { BADGE_LABELS } from '@/components/listing/listing-card'
import { Markdown } from '@/components/shared/markdown'
import { Button } from '@/components/ui/button'
import { getCurrentUser, getRelated, getSiteSettings, getToolBySlug, toCard } from '@/lib/data'
import { formatDate, formatShortDate } from '@/lib/utils'

type Props = { params: Promise<{ slug: string }> }

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
  const price = doc.creditsPerUse
  const loginNext = `/tools/${doc.slug}`
  const start: DetailAction = { label: '开始使用', href: doc.url, external: true }
  const mobileAction: DetailAction = user
    ? { label: '打开', href: doc.url, external: true }
    : { label: '登录后使用', href: `/login?next=${encodeURIComponent(loginNext)}` }
  const infoRows = [{ label: '更新时间', value: formatDate(doc.updatedAt) }]
  const strip: StripItem[] = [
    priceStripItem(price),
    {
      label: '分类',
      value: <LayoutGridIcon className="size-5" strokeWidth={1.9} />,
      sub: card.category?.name ?? '未分类',
    },
    { label: '更新', value: formatShortDate(doc.updatedAt), sub: '最近更新' },
  ]

  return (
    <Container className="flex flex-col gap-6 pt-16 md:mt-10 md:gap-8 md:pt-0">
      <DetailTopBar item={card} listHref="/tools" action={mobileAction} />

      <DetailBreadcrumb
        rootLabel="AI 工具"
        rootHref="/tools"
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
        <PriceCard
          price={price}
          unitLabel="每次使用消耗"
          credits={credits}
          signupBonus={settings.signupBonus ?? 0}
          loginNext={loginNext}
          action={start}
          rows={infoRows}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[minmax(0,1fr)_392px] md:gap-8">
        <Panel title="介绍" mobileCard={false}>
          <MobileCollapse>
            <Markdown source={doc.description} />
          </MobileCollapse>
        </Panel>
        <div className="flex flex-col gap-6">
          <Panel title="标签" mobileCard={false}>
            <TagList tags={card.tags} listHref="/tools" />
          </Panel>
          <Panel title="同类工具">
            <RelatedList items={related} />
          </Panel>
        </div>
      </div>
    </Container>
  )
}
