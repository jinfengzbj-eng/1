'use client'

import { useSyncExternalStore } from 'react'

// 与 Tailwind 的 md 断点一致
const QUERY = '(max-width: 767px)'

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

/** 是否手机宽度。服务端渲染时按手机算，国内访问以手机为主 */
export function useIsMobile() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => true,
  )
}
