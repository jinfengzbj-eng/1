// 布局参考 Mkdirs（Apache-2.0）https://github.com/MkThingsHQ/mkdirs，改为悬浮玻璃胶囊导航
'use client'

import { ArrowRightIcon, type LucideIcon, ServerIcon, SparklesIcon, UserIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import Container from '@/components/container'
import { type SiteBrand, SiteLogo } from '@/components/layout/site-logo'
import { CreditsPill, type NavUser, UserButton } from '@/components/layout/user-button'
import { Button } from '@/components/ui/button'
import { useScroll } from '@/hooks/use-scroll'
import { cn } from '@/lib/utils'

type NavLink = { title: string; href: string; icon: LucideIcon; mobileTitle?: string }

const NAV_LINKS: NavLink[] = [
  { title: 'MCP 服务', href: '/', icon: ServerIcon },
  { title: 'AI 工具', href: '/tools', icon: SparklesIcon },
  { title: '用户中心', href: '/console', icon: UserIcon, mobileTitle: '我的' },
]

function useIsActive() {
  const pathname = usePathname()
  return (href: string) =>
    href === '/' ? pathname === '/' || pathname.startsWith('/mcp') : pathname.startsWith(href)
}

export function Navbar({ brand, user }: { brand: SiteBrand; user: NavUser | null }) {
  const scrolled = useScroll(24)
  const isActive = useIsActive()

  return (
    <div
      className="sticky z-40 w-full pt-3 md:pt-5"
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

      {/* 手机端：顶部玻璃条 */}
      <div className="px-4 md:hidden">
        <header
          className={cn(
            'glass flex h-13 items-center justify-between rounded-full pr-2 pl-2.5 transition-colors',
            scrolled && 'glass-scrolled',
          )}
        >
          <SiteLogo brand={brand} size={32} />
          {user ? (
            <div className="flex items-center gap-2">
              <CreditsPill credits={user.credits} compact />
              <UserButton user={user} />
            </div>
          ) : (
            <Button asChild className="h-9 rounded-full px-4">
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
  const pathname = usePathname()
  // 详情页底部是“立即接入”操作栏，不再叠一层标签栏
  if (/^\/(mcp|tools)\/[^/]+/.test(pathname)) return null
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
