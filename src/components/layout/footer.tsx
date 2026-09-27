// 改编自 Mkdirs（Apache-2.0）https://github.com/MkThingsHQ/mkdirs
import Link from 'next/link'

import Container from '@/components/container'
import { ModeToggle } from '@/components/layout/mode-toggle'
import { type SiteBrand, SiteLogo } from '@/components/layout/site-logo'

const FOOTER_LINKS = [
  {
    title: '产品',
    items: [
      { title: 'MCP 服务', href: '/' },
      { title: 'AI 工具', href: '/tools' },
    ],
  },
  {
    title: '账户',
    items: [
      { title: '登录', href: '/login' },
      { title: '注册', href: '/register' },
      { title: '用户中心', href: '/console' },
    ],
  },
  {
    title: '积分',
    items: [
      { title: '兑换卡密', href: '/console#redeem' },
      { title: '接入密钥', href: '/console#api-key' },
    ],
  },
]

export function Footer({
  brand,
  tagline,
  icp,
  contact,
}: {
  brand: SiteBrand
  tagline?: string | null
  icp?: string | null
  contact?: string | null
}) {
  return (
    <footer className="border-t">
      <Container className="grid grid-cols-2 gap-8 py-12 md:grid-cols-6">
        <div className="col-span-full flex flex-col items-start md:col-span-3">
          <div className="space-y-4">
            <SiteLogo brand={brand} />
            {tagline && <p className="text-base text-muted-foreground md:pr-12">{tagline}</p>}
            {contact && <p className="text-sm text-muted-foreground">联系我们：{contact}</p>}
          </div>
        </div>

        {FOOTER_LINKS.map((section) => (
          <div key={section.title} className="col-span-1 items-start">
            <span className="text-sm font-semibold">{section.title}</span>
            <ul className="mt-4 list-inside space-y-3">
              {section.items.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t py-4">
        <Container className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:gap-4">
            <span>
              版权所有 &copy; {new Date().getFullYear()} {brand.name}
            </span>
            {icp && (
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary"
              >
                {icp}
              </a>
            )}
          </div>
          <ModeToggle />
        </Container>
      </div>
    </footer>
  )
}
