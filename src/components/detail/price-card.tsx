import { ArrowRightIcon, CoinsIcon, GiftIcon } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export function PriceCard({
  price,
  unitLabel,
  credits,
  signupBonus,
  loginNext,
  action,
}: {
  price: number
  unitLabel: string
  /** 未登录时为 null */
  credits: number | null
  signupBonus: number
  loginNext: string
  action: { label: string; href: string; external?: boolean }
}) {
  return (
    <div className="flex h-full flex-col justify-between gap-6 rounded-lg border bg-gradient-to-br from-indigo-50 to-purple-50 p-6 dark:from-indigo-950/30 dark:to-purple-950/30">
      <div>
        <p className="text-sm text-muted-foreground">{unitLabel}</p>
        {price > 0 ? (
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-bold">{price}</span>
            <span className="text-muted-foreground">积分</span>
          </p>
        ) : (
          <p className="mt-1 text-4xl font-bold text-emerald-600 dark:text-emerald-400">免费</p>
        )}
      </div>

      {credits !== null ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <CoinsIcon className="size-4 text-amber-500" />
              我的余额：<span className="font-semibold text-foreground">{credits}</span> 积分
            </span>
            <Link href="/console#redeem" className="link-underline text-primary">
              兑换卡密
            </Link>
          </div>
          <Button asChild size="lg" className="group w-full">
            <Link
              href={action.href}
              target={action.external ? '_blank' : undefined}
              rel={action.external ? 'noreferrer' : undefined}
            >
              {action.label}
              <ArrowRightIcon className="icon-scale" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {signupBonus > 0 && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <GiftIcon className="size-4 text-rose-500" />
              新用户注册即送 <span className="font-semibold text-foreground">
                {signupBonus}
              </span>{' '}
              积分
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Button asChild size="lg">
              <Link href={`/register?next=${encodeURIComponent(loginNext)}`}>免费注册</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={`/login?next=${encodeURIComponent(loginNext)}`}>登录</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
