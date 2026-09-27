// 改编自 Mkdirs（Apache-2.0）https://github.com/MkThingsHQ/mkdirs
'use client'

import { useRouter, useSearchParams } from 'next/navigation'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

export default function CustomPagination({
  totalPages,
  routePrefix,
}: {
  totalPages: number
  routePrefix: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get('page')) || 1

  if (totalPages <= 1) return null

  const goTo = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(page))
    router.push(`${routePrefix}?${params.toString()}`)
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={currentPage > 1 ? () => goTo(currentPage - 1) : undefined}
            aria-disabled={currentPage <= 1}
            className={currentPage <= 1 ? 'pointer-events-none opacity-40' : 'cursor-pointer'}
          />
        </PaginationItem>
        {generatePagination(currentPage, totalPages).map((page, index) => (
          <PaginationItem key={`${page}-${index}`}>
            {page === '...' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                onClick={() => goTo(page)}
                isActive={currentPage === page}
                className={currentPage === page ? '' : 'cursor-pointer'}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            onClick={currentPage < totalPages ? () => goTo(currentPage + 1) : undefined}
            aria-disabled={currentPage >= totalPages}
            className={
              currentPage >= totalPages ? 'pointer-events-none opacity-40' : 'cursor-pointer'
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

/** 页码少时全部显示，多时首尾加省略号 */
function generatePagination(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 3) return [1, 2, 3, '...', total - 1, total]
  if (current >= total - 2) return [1, 2, '...', total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}
