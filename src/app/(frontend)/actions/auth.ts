'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { grantSignupBonus } from '@/lib/credits'
import { getCurrentUser, getPayloadClient, getSiteSettings } from '@/lib/data'
import { generateApiKey } from '@/lib/random'
import { safeNext } from '@/lib/safe-next'

export type AuthFormState = { error?: string; email?: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function setAuthCookie(token: string, exp?: number) {
  const payload = await getPayloadClient()
  const cookieStore = await cookies()
  cookieStore.set(`${payload.config.cookiePrefix}-token`, token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: exp ? new Date(exp * 1000) : undefined,
  })
}

async function signIn(email: string, password: string): Promise<string | null> {
  const payload = await getPayloadClient()
  try {
    const result = await payload.login({ collection: 'users', data: { email, password } })
    if (!result.token) return '登录失败，请稍后再试'
    await setAuthCookie(result.token, result.exp)
    return null
  } catch (err) {
    const name = err instanceof Error ? err.name : ''
    if (name === 'LockedAuth') return '登录失败次数过多，请 10 分钟后再试'
    return '邮箱或密码错误'
  }
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const password = String(formData.get('password') ?? '')
  if (!email || !password) return { error: '请输入邮箱和密码', email }

  const error = await signIn(email, password)
  if (error) return { error, email }
  redirect(safeNext(formData.get('next')))
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirm') ?? '')
  const nickname = String(formData.get('nickname') ?? '').trim()

  if (!EMAIL_RE.test(email)) return { error: '请输入正确的邮箱地址', email }
  if (password.length < 6) return { error: '密码至少 6 位', email }
  if (password !== confirm) return { error: '两次输入的密码不一致', email }

  const payload = await getPayloadClient()
  const { totalDocs } = await payload.count({
    collection: 'users',
    where: { email: { equals: email } },
    overrideAccess: true,
  })
  if (totalDocs > 0) return { error: '这个邮箱已经注册过了，请直接登录', email }

  const settings = await getSiteSettings()
  // 注册只开放这几个字段，角色固定为普通用户
  const user = await payload.create({
    collection: 'users',
    data: {
      email,
      password,
      nickname: nickname || undefined,
      role: 'user',
      credits: 0,
      apiKey: generateApiKey(),
    },
    overrideAccess: true,
    context: { publicSignup: true },
  })
  // 赠送积分走积分流水，用户在积分记录里能看到
  await grantSignupBonus(payload, user.id, settings.signupBonus ?? 0)

  const error = await signIn(email, password)
  if (error) return { error, email }
  redirect(safeNext(formData.get('next')))
}

export async function logoutAction() {
  const payload = await getPayloadClient()
  const cookieStore = await cookies()
  cookieStore.delete(`${payload.config.cookiePrefix}-token`)
  redirect('/')
}

/** 重新生成接入密钥，旧密钥立即失效 */
export async function regenerateApiKeyAction(): Promise<{ apiKey?: string; error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { error: '请先登录' }
  const payload = await getPayloadClient()
  const apiKey = generateApiKey()
  await payload.update({
    collection: 'users',
    id: user.id,
    data: { apiKey },
    overrideAccess: true,
  })
  return { apiKey }
}
