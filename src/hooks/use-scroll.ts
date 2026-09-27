// 改编自 Mkdirs（Apache-2.0）https://github.com/MkThingsHQ/mkdirs
'use client'

import { useCallback, useSyncExternalStore } from 'react'

function subscribe(callback: () => void) {
  window.addEventListener('scroll', callback, { passive: true })
  return () => window.removeEventListener('scroll', callback)
}

export function useScroll(threshold: number) {
  const getSnapshot = useCallback(() => window.scrollY > threshold, [threshold])
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
