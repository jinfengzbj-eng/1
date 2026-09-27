import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { Backdrop } from '@/components/layout/backdrop'
import { Footer } from '@/components/layout/footer'
import { Navbar, TabBar } from '@/components/layout/navbar'
import { ThemeProvider } from '@/components/layout/theme-provider'
import type { NavUser } from '@/components/layout/user-button'
import { Toaster } from '@/components/ui/sonner'
import { getCurrentUser, getSiteSettings, mediaUrl } from '@/lib/data'

import './globals.css'

// 内容随后台修改实时变化，页面按请求渲染
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    title: { default: settings.siteName, template: `%s - ${settings.siteName}` },
    description: settings.tagline ?? undefined,
  }
}

export default async function FrontendLayout({ children }: { children: ReactNode }) {
  const [settings, user] = await Promise.all([getSiteSettings(), getCurrentUser()])
  const brand = { name: settings.siteName, logoUrl: mediaUrl(settings.logo) }
  const navUser: NavUser | null = user
    ? {
        email: user.email,
        nickname: user.nickname ?? null,
        credits: user.credits ?? 0,
        isAdmin: user.role === 'admin',
      }
    : null

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Backdrop />
          <div className="flex min-h-screen flex-col">
            <Navbar brand={brand} user={navUser} />
            <main className="flex-1">{children}</main>
            <Footer siteName={settings.siteName} icp={settings.icp} contact={settings.contact} />
          </div>
          <TabBar />
          <Toaster richColors position="top-center" offset={88} />
        </ThemeProvider>
      </body>
    </html>
  )
}
