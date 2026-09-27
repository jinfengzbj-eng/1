// 改编自 Mkdirs（Apache-2.0）https://github.com/MkThingsHQ/mkdirs
'use client'

import { useSyncExternalStore } from 'react'

type Device = 'mobile' | 'tablet' | 'desktop'

function subscribe(callback: () => void) {
  window.addEventListener('resize', callback)
  return () => window.removeEventListener('resize', callback)
}

function getDevice(): Device {
  if (window.matchMedia('(max-width: 640px)').matches) return 'mobile'
  if (window.matchMedia('(max-width: 1024px)').matches) return 'tablet'
  return 'desktop'
}

export function useMediaQuery() {
  const device = useSyncExternalStore<Device | null>(subscribe, getDevice, () => null)
  return {
    device,
    isMobile: device === 'mobile',
    isDesktop: device === 'desktop' || device === 'tablet',
  }
}
