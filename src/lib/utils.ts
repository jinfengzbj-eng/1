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

/** 短日期：今年的写 9月27日，往年的写 2025年9月 */
export function formatShortDate(input: string | number | Date, now: Date = new Date()): string {
  const date = new Date(input)
  return date.getFullYear() === now.getFullYear()
    ? `${date.getMonth() + 1}月${date.getDate()}日`
    : `${date.getFullYear()}年${date.getMonth() + 1}月`
}

/** 拼接带查询参数的网址 */
export function createUrl(pathname: string, params: URLSearchParams | ReadonlyURLSearchParams) {
  const paramsString = params.toString()
  return `${pathname}${paramsString.length ? '?' : ''}${paramsString}`
}
