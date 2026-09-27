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

// 面向国内用户，时间统一按北京时间显示，不受服务器时区影响
const dateTimeFormat = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** 日期时间，形如 2026年9月27日 14:05（北京时间） */
export function formatDateTime(input: string | number | Date): string {
  const parts = Object.fromEntries(
    dateTimeFormat.formatToParts(new Date(input)).map((part) => [part.type, part.value]),
  )
  return `${parts.year}年${parts.month}月${parts.day}日 ${parts.hour}:${parts.minute}`
}

/** 拼接带查询参数的网址 */
export function createUrl(pathname: string, params: URLSearchParams | ReadonlyURLSearchParams) {
  const paramsString = params.toString()
  return `${pathname}${paramsString.length ? '?' : ''}${paramsString}`
}
