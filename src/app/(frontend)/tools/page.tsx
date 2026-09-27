import type { Metadata } from 'next'

import Hero from '@/components/listing/hero'
import ListingPage, { type ListingSearchParams } from '@/components/listing/listing-page'
import { getSiteSettings } from '@/lib/data'

export const metadata: Metadata = { title: 'AI 工具' }

export default async function ToolsPage({ searchParams }: { searchParams: ListingSearchParams }) {
  const settings = await getSiteSettings()

  return (
    <ListingPage
      kind="tool"
      searchParams={searchParams}
      hero={
        <Hero
          title={settings.toolsHeroTitle}
          highlight={settings.toolsHeroHighlight}
          subtitle={settings.toolsHeroSubtitle}
          mobileTitle="AI 工具"
          urlPrefix="/tools"
          searchPlaceholder="搜索 AI 工具，比如：音乐、绘画、配音"
          mobileSearchPlaceholder="音乐、绘画、配音…"
        />
      }
    />
  )
}
