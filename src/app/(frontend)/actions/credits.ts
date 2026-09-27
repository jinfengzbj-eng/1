'use server'

import { refresh } from 'next/cache'

import { redeemCode } from '@/lib/credits'
import { getCurrentUser, getPayloadClient } from '@/lib/data'

export type RedeemState = {
  error?: string
  code?: string
  success?: { credits: number; balance: number; at: number }
}

// 同一用户连续输错太多次就暂停一会儿（单进程内存计数，够防手滑和简单脚本）
const MAX_FAILURES = 10
const LOCK_MS = 10 * 60 * 1000
const failures = new Map<number, { count: number; resetAt: number }>()

function recordFailure(userId: number) {
  const now = Date.now()
  const current = failures.get(userId)
  if (!current || current.resetAt < now) failures.set(userId, { count: 1, resetAt: now + LOCK_MS })
  else current.count += 1
}

export async function redeemAction(_prev: RedeemState, formData: FormData): Promise<RedeemState> {
  const user = await getCurrentUser()
  if (!user) return { error: '请先登录' }

  const code = String(formData.get('code') ?? '').trim()
  if (!code) return { error: '请输入卡密' }

  const limit = failures.get(user.id)
  if (limit && limit.resetAt > Date.now() && limit.count >= MAX_FAILURES) {
    return { error: '输错次数太多，请 10 分钟后再试', code }
  }

  const payload = await getPayloadClient()
  const result = await redeemCode(payload, { userId: user.id, code })
  if (!result.ok) {
    recordFailure(user.id)
    return { error: result.error, code }
  }

  failures.delete(user.id)
  // 让页面上的余额（用户中心、顶栏）立即更新
  refresh()
  return { success: { credits: result.credits, balance: result.balance, at: Date.now() } }
}
