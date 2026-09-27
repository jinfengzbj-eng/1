'use client'

import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

/**
 * 包住 Markdown 正文：手机端只显示第一段（最多 3 行），点“更多”展开全文；
 * 桌面端始终完整显示。
 */
export function MobileCollapse({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    const prose = ref.current?.querySelector<HTMLElement>('.prose')
    const first = prose?.firstElementChild as HTMLElement | null | undefined
    if (!prose || !first) return
    // 不止一段，或者第一段超过 3 行
    const measure = () =>
      setHasMore(prose.childElementCount > 1 || first.scrollHeight > first.clientHeight + 1)
    const observer = new ResizeObserver(measure)
    observer.observe(first)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex flex-col gap-1">
      <div
        ref={ref}
        className={cn(
          !open &&
            'max-md:[&_.prose>*:first-child]:line-clamp-3 max-md:[&_.prose>*:not(:first-child)]:hidden',
        )}
      >
        {children}
      </div>
      {!open && hasMore && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="self-end text-[15px] font-medium text-brand md:hidden"
        >
          更多
        </button>
      )}
    </div>
  )
}
