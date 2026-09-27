'use client'

import { CheckIcon, ChevronDownIcon, HashIcon, SlidersHorizontalIcon } from 'lucide-react'
import Link from 'next/link'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export type FilterMenuOption = { label: string; href: string; active: boolean }

const ICONS = { tag: HashIcon, sort: SlidersHorizontalIcon }

/** 工具栏里的下拉筛选（标签、排序），选项是普通链接 */
export function FilterMenu({
  icon,
  label,
  options,
}: {
  icon: keyof typeof ICONS
  label: string
  options: FilterMenuOption[]
}) {
  const Icon = ICONS[icon]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-10 items-center gap-2 rounded-xl bg-seg-track px-3.5 text-sm text-ink-2 outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50">
        <Icon className="size-4" />
        <span className="max-w-32 truncate">{label}</span>
        <ChevronDownIcon className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-80 min-w-44">
        {options.map((option) => (
          <DropdownMenuItem key={option.href} asChild className="rounded-lg py-2">
            <Link href={option.href} scroll={false}>
              <CheckIcon className={cn('size-4', !option.active && 'opacity-0')} />
              {option.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
