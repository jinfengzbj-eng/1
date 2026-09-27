import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { AuthCard } from '@/components/auth/auth-card'
import { RegisterForm } from '@/components/auth/auth-forms'
import { safeNext } from '@/lib/safe-next'
import { getCurrentUser, getSiteSettings } from '@/lib/data'

export const metadata: Metadata = { title: '注册' }

type Props = { searchParams: Promise<{ next?: string }> }

export default async function RegisterPage({ searchParams }: Props) {
  const { next } = await searchParams
  if (await getCurrentUser()) redirect(safeNext(next))
  const settings = await getSiteSettings()
  const bonus = settings.signupBonus ?? 0

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <AuthCard
        title="创建账号"
        description={
          bonus > 0 ? `注册即送 ${bonus} 积分，可用于所有 MCP 服务和 AI 工具` : undefined
        }
        footerText="已经有账号了？"
        footerLinkText="直接登录"
        footerHref={next ? `/login?next=${encodeURIComponent(next)}` : '/login'}
      >
        <RegisterForm next={next} />
      </AuthCard>
    </div>
  )
}
