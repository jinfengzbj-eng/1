// 改编自 Mkdirs（Apache-2.0）https://github.com/MkThingsHQ/mkdirs
'use client'

import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'

export type FilterItem = { value: string; label: string }

// 不能用空字符串，否则 Command 没有悬停效果
export const DEFAULT_FILTER_VALUE = '%DEFAULT_FILTER_VALUE%'

type ResponsiveComboBoxProps = {
  filterItemList: FilterItem[]
  placeholder: string
  labelPrefix?: string
  selectedValue: string
  searchable?: boolean
  onValueChange: (value: string) => void
}

export function ResponsiveComboBox({
  filterItemList,
  placeholder,
  labelPrefix,
  selectedValue,
  searchable = true,
  onValueChange,
}: ResponsiveComboBoxProps) {
  const { isMobile } = useMediaQuery()
  const [open, setOpen] = useState(false)
  const selected = filterItemList.find((item) => item.value === selectedValue)
  const label =
    selected && selected.value !== DEFAULT_FILTER_VALUE
      ? `${labelPrefix ?? ''}${selected.label}`
      : placeholder

  const handleSelect = (item: FilterItem) => {
    setOpen(false)
    onValueChange(item.value)
  }

  const list = (
    <FilterList
      filterItemList={filterItemList}
      selectedValue={selectedValue}
      searchable={searchable}
      onSelect={handleSelect}
    />
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline" className="w-full justify-between font-normal">
            <span className="truncate">{label}</span>
            <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerTitle className="sr-only">{placeholder}</DrawerTitle>
          <div className="mt-4 border-t">{list}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">{label}</span>
          <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-48 p-0" align="start">
        {list}
      </PopoverContent>
    </Popover>
  )
}

function FilterList({
  filterItemList,
  selectedValue,
  searchable,
  onSelect,
}: {
  filterItemList: FilterItem[]
  selectedValue: string
  searchable: boolean
  onSelect: (item: FilterItem) => void
}) {
  return (
    <Command>
      {searchable && <CommandInput placeholder="搜索…" />}
      <CommandList>
        <CommandEmpty>没有匹配的选项</CommandEmpty>
        <CommandGroup>
          {filterItemList.map((item) => (
            <CommandItem
              key={item.value}
              value={`${item.label} ${item.value}`}
              onSelect={() => onSelect(item)}
              className="cursor-pointer p-3"
            >
              <CheckIcon
                className={cn('size-4', item.value === selectedValue ? 'opacity-100' : 'opacity-0')}
              />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
