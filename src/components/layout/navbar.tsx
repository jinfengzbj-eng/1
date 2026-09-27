// 改编自 Mkdirs（Apache-2.0）https://github.com/MkThingsHQ/mkdirs
'use client'

import {
  ArrowRightIcon,
  LayoutDashboardIcon,
  type LucideIcon,
  MenuIcon,
  ServerIcon,
  SparklesIcon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import Container from '@/components/container'
import { type SiteBrand, SiteLogo } from '@/components/layout/site-logo'
import { CreditsPill, type NavUser, UserButton } from '@/components/layout/user-button'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useScroll } from '@/hooks/use-scroll'
import { cn } from '@/lib/utils'

type NavLink = { title: string; href: string; icon: LucideIcon }

const NAV_LINKS: NavLink[] = [
  { title: 'MCP 服务', href: '/', icon: ServerIcon },
  { title: 'AI 工具', href: '/tools', icon: SparklesIcon },
  { title: '用户中心', href: '/console', icon: LayoutDashboardIcon },
]

function useIsActive() {
  const pathname = usePathname()
  return (href: string) =>
    href === '/' ? pathname === '/' || pathname.startsWith('/mcp') : pathname.startsWith(href)
}

function SignInButton() {
  return (
    <Button asChild className="flex gap-2 rounded-full px-5">
      <Link href="/login">
        <span>登录</span>
        <ArrowRightIcon className="size-4" />
      </Link>
    </Button>
  )
}

export function Navbar({ brand, user }: { brand: SiteBrand; user: NavUser | null }) {
  const scrolled = useScroll(50)
  const isActive = useIsActive()
  const [open, setOpen] = useState(false)

  return (
    <div className="sticky top-0 z-40 w-full">
      {/* 桌面端 */}
      <header
        className={cn(
          'hidden justify-center bg-background/60 backdrop-blur-xl transition-all md:flex',
          scrolled ? 'border-b' : 'bg-transparent',
        )}
      >
        <Container className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-10">
            <SiteLogo brand={brand} />
            <NavigationMenu>
              <NavigationMenuList>
                {NAV_LINKS.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink
                      asChild
                      className={cn(
                        navigationMenuTriggerStyle(),
                        'bg-transparent px-3 text-base focus:bg-transparent',
                        isActive(item.href)
                          ? 'font-semibold text-foreground'
                          : 'text-foreground/60',
                      )}
                    >
                      <Link href={item.href}>{item.title}</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <CreditsPill credits={user.credits} />
                <UserButton user={user} />
              </>
            ) : (
              <SignInButton />
            )}
          </div>
        </Container>
      </header>

      {/* 移动端 */}
      <header className="flex justify-center bg-background/60 backdrop-blur-xl transition-all md:hidden">
        <div className="flex h-16 w-full items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="size-9 shrink-0">
                  <MenuIcon className="size-5" />
                  <span className="sr-only">打开导航菜单</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col p-0">
                <SheetTitle className="sr-only">导航菜单</SheetTitle>
                <SiteLogo brand={brand} className="pt-4 pl-4" onClick={() => setOpen(false)} />
                <nav className="flex flex-1 flex-col gap-2 p-2 pt-8 font-medium">
                  {NAV_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center gap-2 rounded-md p-2 text-sm font-medium hover:bg-muted',
                        isActive(item.href)
                          ? 'bg-muted text-foreground'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      <item.icon className="size-5" />
                      {item.title}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <SiteLogo brand={brand} />
          </div>

          <div className="flex items-center gap-2">
            {user ? <UserButton user={user} /> : <SignInButton />}
          </div>
        </div>
      </header>
    </div>
  )
}
