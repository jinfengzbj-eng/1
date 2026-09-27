import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { AuthCard } from '@/components/auth/auth-card'
import { LoginForm } from '@/components/auth/auth-forms'
import { safeNext } from '@/lib/safe-next'
import { getCurrentUser } from '@/lib/data'

export const metadata: Metadata = { title: '登录' }

type Props = { searchParams: Promise<{ next?: string }> }

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams
  if (await getCurrentUser()) redirect(safeNext(next))

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <AuthCard
        title="欢迎回来"
        description="登录后即可接入 MCP 服务、使用 AI 工具"
        footerText="还没有账号？"
        footerLinkText="免费注册"
        footerHref={next ? `/register?next=${encodeURIComponent(next)}` : '/register'}
      >
        <LoginForm next={next} />
      </AuthCard>
    </div>
  )
}
