'use client'

import { CheckIcon, SlidersHorizontalIcon, XIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'

export type SheetOption = { label: string; href: string; active: boolean }

const TAG_PREVIEW = 12

/**
 * 手机端的筛选与排序弹层，参照 Baymard 的手机筛选研究：
 * 入口按钮写明“筛选”并显示已选数量，每点一项立即生效，底部按钮写出结果数量。
 * 只改网址参数，页面组件不会重新挂载，所以弹层会保持打开，数量随之更新。
 */
export function FilterSheet({
  scopes,
  tags,
  sorts,
  resetHref,
  totalDocs,
  activeCount,
}: {
  scopes: SheetOption[]
  tags: SheetOption[]
  sorts: SheetOption[]
  resetHref: string
  totalDocs: number
  activeCount: number
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [allTags, setAllTags] = useState(false)
  const [pending, startTransition] = useTransition()
  // 标签多时先露出常用的几个，已选的标签总是显示
  const visibleTags =
    allTags || tags.length <= TAG_PREVIEW
      ? tags
      : tags.filter((tag, index) => index < TAG_PREVIEW || tag.active)

  // 用 replace：在弹层里点来点去不产生一串历史记录
  const go = (href: string) =>
    startTransition(() => router.replace(href, { scroll: false }))

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger
        className={cn(
          'flex h-8.5 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
          activeCount > 0
            ? 'border-transparent bg-brand-soft font-semibold text-brand'
            : 'border-card-line bg-card text-foreground',
        )}
      >
        <SlidersHorizontalIcon className="size-4" />
        筛选
        {activeCount > 0 && <span className="tabular-nums">{activeCount}</span>}
      </DrawerTrigger>
      <DrawerContent
        aria-describedby={undefined}
        className="after:hidden data-[vaul-drawer-direction=bottom]:inset-x-2 data-[vaul-drawer-direction=bottom]:max-h-[85dvh] data-[vaul-drawer-direction=bottom]:rounded-[36px] data-[vaul-drawer-direction=bottom]:border"
        style={{ bottom: 'calc(8px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex items-center justify-between px-5 pt-2">
          <DrawerTitle className="text-xl font-bold tracking-tight">筛选与排序</DrawerTitle>
          <DrawerClose
            aria-label="关闭"
            className="flex size-8 items-center justify-center rounded-full bg-seg-track text-ink-2"
          >
            <XIcon className="size-4" strokeWidth={2.4} />
          </DrawerClose>
        </div>

        <div
          className={cn(
            'flex flex-col gap-5 overflow-y-auto px-5 py-4 transition-opacity',
            pending && 'opacity-60',
          )}
        >
          <Group title="范围">
            <div className="grid grid-cols-3 gap-0.5 rounded-xl bg-seg-track p-[3px]">
              {scopes.map((option) => (
                <button
                  key={option.href}
                  type="button"
                  aria-pressed={option.active}
                  onClick={() => go(option.href)}
                  className={cn(
                    'h-8 rounded-[9px] text-sm',
                    option.active ? 'seg-on font-semibold text-foreground' : 'text-ink-2',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Group>

          {tags.length > 0 && (
            <Group title="标签">
              <div className="flex flex-wrap gap-2">
                {visibleTags.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    aria-pressed={option.active}
                    onClick={() => go(option.href)}
                    className={cn(
                      'h-8 rounded-full px-3 text-sm',
                      option.active
                        ? 'bg-brand-soft font-semibold text-brand'
                        : 'bg-seg-track text-ink-2',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
                {visibleTags.length < tags.length && (
                  <button
                    type="button"
                    onClick={() => setAllTags(true)}
                    className="h-8 rounded-full px-2 text-sm text-brand"
                  >
                    全部 {tags.length} 个
                  </button>
                )}
              </div>
            </Group>
          )}

          <Group title="排序">
            <div className="surface overflow-hidden rounded-2xl pl-3.5">
              {sorts.map((option) => (
                <button
                  key={option.href}
                  type="button"
                  aria-pressed={option.active}
                  onClick={() => go(option.href)}
                  className="flex h-11 w-full items-center justify-between border-b pr-3.5 text-[15px] last:border-b-0"
                >
                  {option.label}
                  {option.active && <CheckIcon className="size-[18px] text-brand" strokeWidth={2.4} />}
                </button>
              ))}
            </div>
          </Group>
        </div>

        <div className="grid grid-cols-[1fr_2fr] gap-2.5 px-5 pt-1 pb-5">
          <button
            type="button"
            disabled={activeCount === 0}
            onClick={() => go(resetHref)}
            className="h-12.5 rounded-2xl bg-seg-track text-base font-semibold disabled:opacity-50"
          >
            重置
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="btn-glow h-12.5 rounded-2xl bg-primary text-base font-semibold text-primary-foreground tabular-nums"
          >
            {pending ? '正在筛选…' : `查看 ${totalDocs} 个结果`}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-[13px] font-semibold text-muted-foreground">{title}</h3>
      {children}
    </section>
  )
}
