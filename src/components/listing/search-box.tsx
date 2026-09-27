// 改编自 Mkdirs 的 HomeSearchBox（Apache-2.0）https://github.com/MkThingsHQ/mkdirs
'use client'

import { SearchIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useDebounce } from 'use-debounce'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, createUrl } from '@/lib/utils'

export default function SearchBox({
  urlPrefix,
  placeholder,
}: {
  urlPrefix: string
  placeholder: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [debouncedQuery] = useDebounce(query, 300)
  const lastExecuted = useRef(searchParams.get('q') ?? '')

  // 地址栏的 q 被外部改掉（比如点了“重置”）时，同步到输入框
  useEffect(() => {
    const current = searchParams.get('q') ?? ''
    if (current !== lastExecuted.current) {
      lastExecuted.current = current
      setQuery(current)
    }
  }, [searchParams])

  useEffect(() => {
    if (debouncedQuery === lastExecuted.current) return
    const params = new URLSearchParams(searchParams.toString())
    if (debouncedQuery) params.set('q', debouncedQuery)
    else params.delete('q')
    params.delete('page')
    lastExecuted.current = debouncedQuery
    router.push(createUrl(urlPrefix, params), { scroll: false })
  }, [debouncedQuery, router, searchParams, urlPrefix])

  return (
    <form
      role="search"
      className="mx-auto flex w-full max-w-2xl items-center justify-center"
      onSubmit={(event) => event.preventDefault()}
    >
      <Input
        type="search"
        placeholder={placeholder}
        autoComplete="off"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className={cn(
          'h-12 min-w-0 flex-1 rounded-r-none text-base',
          'focus:border-2 focus:border-r-0 focus:border-primary focus-visible:ring-0',
        )}
      />
      <Button type="submit" className="size-12 shrink-0 rounded-l-none">
        <SearchIcon className="size-6" aria-hidden="true" />
        <span className="sr-only">搜索</span>
      </Button>
    </form>
  )
}
