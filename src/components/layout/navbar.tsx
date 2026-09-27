// 布局参考 Mkdirs（Apache-2.0）https://github.com/MkThingsHQ/mkdirs，改为悬浮玻璃胶囊导航
'use client'

import { ArrowRightIcon, type LucideIcon, ServerIcon, SparklesIcon, UserIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import Container from '@/components/container'
import { type SiteBrand, SiteLogo } from '@/components/layout/site-logo'
import { CreditsPill, type NavUser, UserButton } from '@/components/layout/user-button'
import { Button } from '@/components/ui/button'
import { useScroll } from '@/hooks/use-scroll'
import { rememberLandingPath } from '@/lib/nav-history'
import { cn } from '@/lib/utils'

type NavLink = { title: string; href: string; icon: LucideIcon; mobileTitle?: string }

const NAV_LINKS: NavLink[] = [
  { title: 'MCP 服务', href: '/', icon: ServerIcon },
  { title: 'AI 工具', href: '/tools', icon: SparklesIcon },
  { title: '用户中心', href: '/console', icon: UserIcon, mobileTitle: '我的' },
]

// 详情页在手机上有自己的顶栏（返回、分享、滚动后出现的接入按钮）
const isDetailPath = (pathname: string) => /^\/(mcp|tools)\/[^/]+/.test(pathname)

function useIsActive() {
  const pathname = usePathname()
  return (href: string) =>
    href === '/' ? pathname === '/' || pathname.startsWith('/mcp') : pathname.startsWith(href)
}

export function Navbar({ brand, user }: { brand: SiteBrand; user: NavUser | null }) {
  const scrolled = useScroll(24)
  const isActive = useIsActive()
  const pathname = usePathname()

  useEffect(() => rememberLandingPath(pathname), [pathname])

  return (
    <div
      className={cn('sticky z-40 w-full md:pt-5', isDetailPath(pathname) && 'max-md:hidden')}
      style={{ top: 'env(safe-area-inset-top, 0px)' }}
    >
      {/* 桌面端：悬浮胶囊 */}
      <Container className="hidden md:block">
        <nav
          aria-label="主导航"
          className={cn(
            'glass flex h-15 items-center justify-between rounded-full pr-2 pl-3.5 transition-colors',
            scrolled && 'glass-scrolled',
          )}
        >
          <SiteLogo brand={brand} />
          <div className="flex gap-1 rounded-full bg-seg-track p-1">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cn(
                  'rounded-full px-4.5 py-2 text-[15px] transition-colors',
                  isActive(item.href)
                    ? 'seg-on font-semibold text-foreground'
                    : 'text-ink-2 hover:text-foreground',
                )}
              >
                {item.title}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            {user ? (
              <>
                <CreditsPill credits={user.credits} />
                <UserButton user={user} />
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="h-10 rounded-full px-4">
                  <Link href="/register">注册</Link>
                </Button>
                <Button asChild className="h-10 rounded-full px-5">
                  <Link href="/login">
                    登录
                    <ArrowRightIcon />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </Container>

      {/* 手机端：页面顶部是一行小字品牌，往下滚才变成玻璃条（iOS 的滚动边缘效果） */}
      <div className="px-4 pt-2 md:hidden">
        <header
          className={cn(
            'flex h-12 items-center justify-between rounded-full pr-1.5 pl-2 transition-colors',
            scrolled ? 'glass glass-scrolled' : 'border border-transparent',
          )}
        >
          <SiteLogo
            brand={brand}
            size={28}
            className="gap-2"
            textClassName="text-[15px] font-semibold text-ink-2"
          />
          {user ? (
            <div className="flex items-center gap-2">
              <CreditsPill credits={user.credits} compact />
              <UserButton user={user} compact />
            </div>
          ) : (
            <Button asChild className="h-8.5 rounded-full px-4">
              <Link href="/login">登录</Link>
            </Button>
          )}
        </header>
      </div>
    </div>
  )
}

/** 手机端底部玻璃标签栏 */
export function TabBar() {
  const isActive = useIsActive()
  return (
    <nav
      aria-label="底部导航"
      className="glass fixed inset-x-4 z-40 grid h-16 grid-cols-3 gap-1 rounded-[32px] p-1.5 md:hidden"
      style={{ bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))' }}
    >
      {NAV_LINKS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(item.href) ? 'page' : undefined}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 rounded-[26px] text-[11px]',
            isActive(item.href) ? 'bg-brand-soft font-semibold text-brand' : 'text-ink-2',
          )}
        >
          <item.icon className="size-[22px]" strokeWidth={1.8} />
          {item.mobileTitle ?? item.title}
        </Link>
      ))}
    </nav>
  )
}
