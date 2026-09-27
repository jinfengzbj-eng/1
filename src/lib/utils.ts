import { type ClassValue, clsx } from 'clsx'
import type { ReadonlyURLSearchParams } from 'next/navigation'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 日期格式化为 2026年9月27日 */
export function formatDate(input: string | number | Date): string {
  const date = new Date(input)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

/** 拼接带查询参数的网址 */
export function createUrl(pathname: string, params: URLSearchParams | ReadonlyURLSearchParams) {
  const paramsString = params.toString()
  return `${pathname}${paramsString.length ? '?' : ''}${paramsString}`
}
