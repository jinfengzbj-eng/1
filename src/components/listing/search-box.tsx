// 改编自 Mkdirs 的 HomeSearchBox（Apache-2.0）https://github.com/MkThingsHQ/mkdirs
'use client'

import { SearchIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDebounce } from 'use-debounce'

import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { createUrl } from '@/lib/utils'

export default function SearchBox({
  urlPrefix,
  placeholder,
  mobilePlaceholder,
}: {
  urlPrefix: string
  placeholder: string
  mobilePlaceholder: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [debouncedQuery] = useDebounce(query, 300)
  const lastExecuted = useRef(searchParams.get('q') ?? '')

  // 地址栏的 q 被外部改掉（比如点了分类）时，同步到输入框
  useEffect(() => {
    const current = searchParams.get('q') ?? ''
    if (current !== lastExecuted.current) {
      lastExecuted.current = current
      setQuery(current)
    }
  }, [searchParams])

  const run = useCallback(
    (value: string) => {
      if (value === lastExecuted.current) return
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set('q', value)
      else params.delete('q')
      params.delete('page')
      lastExecuted.current = value
      router.push(createUrl(urlPrefix, params), { scroll: false })
    },
    [router, searchParams, urlPrefix],
  )

  // 只在输入框的防抖值变化时搜索；地址栏被外部改动时 run 也会变，但不能把旧关键词写回去
  const lastDebounced = useRef(debouncedQuery)
  useEffect(() => {
    if (debouncedQuery === lastDebounced.current) return
    lastDebounced.current = debouncedQuery
    run(debouncedQuery)
  }, [debouncedQuery, run])

  return (
    // 手机端是 iOS 式的灰底搜索框，输入即搜，不需要按钮；桌面端是玻璃搜索框
    <form
      role="search"
      className="mx-auto flex h-11 w-full max-w-[720px] items-center gap-2 rounded-[14px] bg-seg-track px-3.5 md:glass md:h-15 md:gap-3 md:rounded-[20px] md:pr-2 md:pl-5"
      onSubmit={(event) => {
        event.preventDefault()
        run(query)
      }}
    >
      <SearchIcon className="size-[18px] shrink-0 text-muted-foreground md:size-5" aria-hidden />
      <label htmlFor="listing-search" className="sr-only">
        搜索
      </label>
      <input
        id="listing-search"
        type="search"
        placeholder={isMobile ? mobilePlaceholder : placeholder}
        enterKeyHint="search"
        autoComplete="off"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="h-10 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground md:h-11"
      />
      <Button type="submit" className="h-11 rounded-[14px] px-5.5 max-md:hidden">
        搜索
      </Button>
    </form>
  )
}
