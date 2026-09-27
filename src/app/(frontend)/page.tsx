import Hero from '@/components/listing/hero'
import ListingPage, { type ListingSearchParams } from '@/components/listing/listing-page'
import { getSiteSettings } from '@/lib/data'

export default async function HomePage({ searchParams }: { searchParams: ListingSearchParams }) {
  const settings = await getSiteSettings()

  return (
    <ListingPage
      kind="mcp"
      searchParams={searchParams}
      hero={
        <Hero
          label={settings.mcpHeroLabel}
          title={settings.mcpHeroTitle}
          highlight={settings.mcpHeroHighlight}
          subtitle={settings.mcpHeroSubtitle}
          mobileTitle="MCP 服务"
          urlPrefix="/"
          searchPlaceholder="搜索 MCP 服务，比如：天气、网页抓取、PDF"
          mobileSearchPlaceholder="天气、网页抓取、PDF…"
        />
      }
    />
  )
}
