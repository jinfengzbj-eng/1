// 改编自 Mkdirs（Apache-2.0）https://github.com/MkThingsHQ/mkdirs
'use client'

import { CoinsIcon, KeyRoundIcon, LayoutDashboardIcon, LogOutIcon, ShieldIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

import { logoutAction } from '@/app/(frontend)/actions/auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type NavUser = {
  email: string
  nickname: string | null
  credits: number
  isAdmin: boolean
}

export function CreditsPill({ credits }: { credits: number }) {
  return (
    <Link
      href="/console"
      className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors hover:bg-accent"
    >
      <CoinsIcon className="size-4 text-amber-500" />
      <span>{credits.toLocaleString('zh-CN')}</span>
      <span className="text-muted-foreground">积分</span>
    </Link>
  )
}

export function UserButton({ user }: { user: NavUser }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const displayName = user.nickname || user.email.split('@')[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none" aria-label="账户菜单">
        <Avatar className="size-8 border">
          <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
            {Array.from(displayName)[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex flex-col gap-1 p-2">
          <p className="font-medium">{displayName}</p>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push('/console')}>
          <LayoutDashboardIcon className="size-4" />
          用户中心
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push('/console#redeem')}>
          <CoinsIcon className="size-4" />
          兑换卡密
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push('/console#api-key')}>
          <KeyRoundIcon className="size-4" />
          接入密钥
        </DropdownMenuItem>
        {user.isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <ShieldIcon className="size-4" />
              管理后台
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={pending}
          onSelect={(event) => {
            event.preventDefault()
            startTransition(() => logoutAction())
          }}
        >
          <LogOutIcon className="size-4" />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
