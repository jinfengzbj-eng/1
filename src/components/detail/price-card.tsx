import { ArrowRightIcon, GiftIcon } from 'lucide-react'
import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

import { InfoList } from '@/components/detail/detail-parts'
import { Button } from '@/components/ui/button'

export type DetailAction = { label: string; href: string; external?: boolean }

// 作为 Button asChild 的子元素时，按钮样式通过 props 传进来，必须转交给 Link
function ActionLink({
  action,
  children,
  ...props
}: { action: DetailAction; children: ReactNode } & Omit<ComponentProps<typeof Link>, 'href'>) {
  return (
    <Link
      {...props}
      href={action.href}
      target={action.external ? '_blank' : undefined}
      rel={action.external ? 'noreferrer' : undefined}
    >
      {children}
    </Link>
  )
}

/** 价格与接入卡片：浮在旁边的操作区，用厚玻璃 */
export function PriceCard({
  price,
  unitLabel,
  credits,
  signupBonus,
  loginNext,
  action,
  rows,
}: {
  price: number
  unitLabel: string
  /** 未登录时为 null */
  credits: number | null
  signupBonus: number
  loginNext: string
  action: DetailAction
  rows: { label: string; value: ReactNode }[]
}) {
  return (
    <aside aria-label="价格与接入" className="glass-thick flex flex-col gap-5 rounded-[28px] p-6.5">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm text-muted-foreground">{unitLabel}</span>
        {price > 0 ? (
          <span className="flex items-baseline gap-2 tabular-nums">
            <span className="text-[52px] leading-none font-bold tracking-[-0.03em]">{price}</span>
            <span className="text-[17px] text-ink-2">积分</span>
          </span>
        ) : (
          <span className="text-[44px] leading-none font-bold text-free">免费</span>
        )}
      </div>
      <div className="h-px bg-border" />
      <InfoList
        rows={[
          ...(credits !== null
            ? [
                {
                  label: '我的余额',
                  value: (
                    <>
                      <span className="font-semibold">{credits} 积分</span>
                      {' · '}
                      <Link href="/console#redeem" className="text-brand hover:underline">
                        兑换卡密
                      </Link>
                    </>
                  ),
                },
              ]
            : []),
          ...rows,
        ]}
      />
      {credits !== null ? (
        <Button asChild size="lg" className="h-12.5 rounded-2xl text-base">
          <ActionLink action={action}>
            {action.label}
            <ArrowRightIcon />
          </ActionLink>
        </Button>
      ) : (
        <div className="flex flex-col gap-3">
          {signupBonus > 0 && (
            <p className="flex items-center gap-1.5 text-sm text-ink-2">
              <GiftIcon className="size-4 text-brand" />
              新用户注册即送 {signupBonus} 积分
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Button asChild size="lg" className="rounded-2xl">
              <Link href={`/register?next=${encodeURIComponent(loginNext)}`}>免费注册</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-2xl">
              <Link href={`/login?next=${encodeURIComponent(loginNext)}`}>登录</Link>
            </Button>
          </div>
        </div>
      )}
    </aside>
  )
}

/** 手机端底部操作栏：价格 + 主操作，厚玻璃 */
export function MobileActionBar({
  price,
  unit,
  credits,
  loginNext,
  action,
}: {
  price: number
  unit: string
  credits: number | null
  loginNext: string
  action: DetailAction
}) {
  return (
    <div
      className="glass-thick fixed inset-x-4 z-40 flex h-19 items-center justify-between gap-3 rounded-[26px] pr-2.5 pl-5 md:hidden"
      style={{ bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex flex-col gap-0.5 tabular-nums">
        {price > 0 ? (
          <span className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight">{price}</span>
            <span className="text-sm text-ink-2">积分 / {unit}</span>
          </span>
        ) : (
          <span className="text-2xl font-bold text-free">免费</span>
        )}
        <span className="text-xs text-muted-foreground">
          {credits !== null ? `余额 ${credits} 积分` : '登录后可使用'}
        </span>
      </div>
      <Button asChild className="h-13.5 rounded-[18px] px-6.5 text-base">
        {credits !== null ? (
          <ActionLink action={action}>
            {action.label}
            <ArrowRightIcon />
          </ActionLink>
        ) : (
          <Link href={`/login?next=${encodeURIComponent(loginNext)}`}>登录</Link>
        )}
      </Button>
    </div>
  )
}
