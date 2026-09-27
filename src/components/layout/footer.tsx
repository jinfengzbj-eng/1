import Link from 'next/link'

import Container from '@/components/container'
import { ModeToggle } from '@/components/layout/mode-toggle'

const FOOTER_LINKS = [
  { title: 'MCP 服务', href: '/' },
  { title: 'AI 工具', href: '/tools' },
  { title: '兑换卡密', href: '/console#redeem' },
  { title: '接入密钥', href: '/console#api-key' },
]

export function Footer({
  siteName,
  icp,
  contact,
}: {
  siteName: string
  icp?: string | null
  contact?: string | null
}) {
  return (
    <footer className="mt-16 border-t pb-28 md:pb-0">
      <Container className="flex flex-col gap-4 py-7 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>
            版权所有 © {new Date().getFullYear()} {siteName}
          </span>
          {icp && (
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              {icp}
            </a>
          )}
          {contact && <span>联系我们：{contact}</span>}
        </div>
        <div className="flex items-center gap-5">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.title}
            </Link>
          ))}
          <ModeToggle />
        </div>
      </Container>
    </footer>
  )
}
