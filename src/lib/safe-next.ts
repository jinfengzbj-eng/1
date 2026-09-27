/** 只允许站内相对路径，防止登录后被跳到外部网站 */
export function safeNext(next: unknown, fallback = '/console'): string {
  const value = typeof next === 'string' ? next : ''
  return value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\')
    ? value
    : fallback
}
