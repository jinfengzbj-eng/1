import Image from 'next/image'

import { cn } from '@/lib/utils'

// 没有上传图标时，用名称首字生成应用图标式的圆角方块（渐变 + 顶部高光）
const GRADIENTS = [
  ['#60a5fa', '#1d4ed8'],
  ['#34d399', '#059669'],
  ['#fb923c', '#ea580c'],
  ['#38bdf8', '#0284c7'],
  ['#fb7185', '#e11d48'],
  ['#2dd4bf', '#0f766e'],
  ['#a3e635', '#4d7c0f'],
  ['#fbbf24', '#d97706'],
]

function pickGradient(seed: string) {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  const [from, to] = GRADIENTS[hash % GRADIENTS.length]
  return `linear-gradient(145deg, ${from}, ${to})`
}

export function LetterIcon({
  name,
  seed,
  src,
  size = 44,
  className,
}: {
  name: string
  seed?: string
  src?: string | null
  size?: number
  className?: string
}) {
  // 圆角约为边长的 27%，接近 iOS 应用图标
  const radius = Math.round(size * 0.27)

  if (src) {
    return (
      <Image
        src={src}
        alt={`${name} 图标`}
        width={size}
        height={size}
        className={cn('icon-tile shrink-0 object-cover', className)}
        style={{ width: size, height: size, borderRadius: radius }}
      />
    )
  }

  return (
    <span
      aria-hidden
      className={cn(
        'icon-tile inline-flex shrink-0 items-center justify-center font-semibold text-white',
        className,
      )}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        fontSize: Math.round(size * 0.45),
        background: pickGradient(seed ?? name),
      }}
    >
      {Array.from(name.trim())[0] ?? '?'}
    </span>
  )
}
