'use client'

import { ChevronLeftIcon, LinkIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { CtaPill, type DetailAction } from '@/components/detail/mobile-detail'
import { LetterIcon } from '@/components/letter-icon'
import { useScroll } from '@/hooks/use-scroll'
import { cameFromInsideSite } from '@/lib/nav-history'
import { cn } from '@/lib/utils'

const circle =
  'glass flex size-10 items-center justify-center rounded-full text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'

/**
 * 手机端详情页顶栏：左边返回，右边分享。
 * 往下滚过头部后，中间出现小图标，右边换成主按钮（和 App Store 一样）。
 */
export function DetailTopBar({
  item,
  listHref,
  action,
}: {
  item: { name: string; slug: string; logoUrl: string | null }
  listHref: string
  action: DetailAction
}) {
  const router = useRouter()
  const pathname = usePathname()
  const scrolled = useScroll(150)

  const share = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: item.name, url })
      } catch {
        // 用户取消分享
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      toast.success('链接已复制')
    } catch {
      toast.error('复制失败，请手动复制地址栏的链接')
    }
  }

  return (
    <div
      className="fixed inset-x-0 top-0 z-40 md:hidden"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {/* 滚动后顶部加一层渐隐的模糊（iOS 的滚动边缘效果），按钮压在内容上也看得清 */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 -bottom-4 bg-background/85 backdrop-blur-xl transition-opacity [mask-image:linear-gradient(to_bottom,black_65%,transparent)]',
          scrolled ? 'opacity-100' : 'opacity-0',
        )}
      />
      <header className="relative grid h-16 grid-cols-[1fr_auto_1fr] items-center px-4">
        <Link
          href={listHref}
          aria-label="返回"
          className={cn(circle, 'justify-self-start')}
          onClick={(event) => {
            if (cameFromInsideSite(pathname)) {
              event.preventDefault()
              router.back()
            }
          }}
        >
          <ChevronLeftIcon className="size-5" strokeWidth={2.2} />
        </Link>
        <div
          aria-hidden={!scrolled}
          className={cn('transition-opacity', scrolled ? 'opacity-100' : 'opacity-0')}
        >
          <LetterIcon name={item.name} seed={item.slug} src={item.logoUrl} size={30} />
        </div>
        {scrolled ? (
          <CtaPill action={action} className="h-8.5 justify-self-end" />
        ) : (
          <button
            type="button"
            aria-label="分享"
            onClick={share}
            className={cn(circle, 'justify-self-end')}
          >
            <LinkIcon className="size-[18px]" />
          </button>
        )}
      </header>
    </div>
  )
}
