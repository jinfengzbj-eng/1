// 改编自 Mkdirs 的 HomeSearchFilterClient（Apache-2.0）https://github.com/MkThingsHQ/mkdirs
'use client'

import { useRouter, useSearchParams } from 'next/navigation'

import { DEFAULT_FILTER_VALUE, ResponsiveComboBox } from '@/components/shared/combobox'
import { Button } from '@/components/ui/button'

type Option = { value: string; label: string }

export default function SearchFilter({
  urlPrefix,
  categories,
  tags,
  sortOptions,
  filterOptions,
}: {
  urlPrefix: string
  categories: { name: string; slug: string }[]
  tags: string[]
  sortOptions: Option[]
  filterOptions: Option[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === DEFAULT_FILTER_VALUE) params.delete(key)
    else params.set(key, value)
    params.delete('page')
    const query = params.toString()
    router.push(query ? `${urlPrefix}?${query}` : urlPrefix)
  }

  // 第一个选项是默认值，用占位值表示“不筛选”
  const withDefault = (options: Option[]) =>
    options.map((option, index) =>
      index === 0 ? { ...option, value: DEFAULT_FILTER_VALUE } : option,
    )

  return (
    <div className="z-10 grid grid-cols-2 items-center gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:gap-4">
      <div className="md:hidden">
        <ResponsiveComboBox
          filterItemList={[
            { value: DEFAULT_FILTER_VALUE, label: '全部分类' },
            ...categories.map((c) => ({ value: c.slug, label: c.name })),
          ]}
          placeholder="全部分类"
          labelPrefix="分类："
          selectedValue={searchParams.get('category') ?? DEFAULT_FILTER_VALUE}
          onValueChange={(value) => update('category', value)}
        />
      </div>

      <ResponsiveComboBox
        filterItemList={[
          { value: DEFAULT_FILTER_VALUE, label: '全部标签' },
          ...tags.map((tag) => ({ value: tag, label: tag })),
        ]}
        placeholder="全部标签"
        labelPrefix="标签："
        selectedValue={searchParams.get('tag') ?? DEFAULT_FILTER_VALUE}
        onValueChange={(value) => update('tag', value)}
      />

      <ResponsiveComboBox
        filterItemList={withDefault(filterOptions)}
        placeholder={filterOptions[0].label}
        selectedValue={searchParams.get('filter') ?? DEFAULT_FILTER_VALUE}
        searchable={false}
        onValueChange={(value) => update('filter', value)}
      />

      <ResponsiveComboBox
        filterItemList={withDefault(sortOptions)}
        placeholder={sortOptions[0].label}
        selectedValue={searchParams.get('sort') ?? DEFAULT_FILTER_VALUE}
        searchable={false}
        onValueChange={(value) => update('sort', value)}
      />

      <Button
        variant="outline"
        className="col-span-2 md:col-span-1"
        onClick={() => router.push(urlPrefix)}
      >
        重置
      </Button>
    </div>
  )
}
