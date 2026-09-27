import Image from 'next/image'

import { cn } from '@/lib/utils'

// 没有上传图标时，用名称首字 + 渐变底色生成图标
const GRADIENTS = [
  'from-indigo-500 to-purple-500',
  'from-sky-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-pink-500',
  'from-rose-500 to-fuchsia-500',
  'from-amber-500 to-orange-500',
  'from-violet-500 to-blue-500',
  'from-cyan-500 to-emerald-500',
]

function pickGradient(seed: string) {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return GRADIENTS[hash % GRADIENTS.length]
}

export function LetterIcon({
  name,
  seed,
  src,
  size = 32,
  className,
}: {
  name: string
  seed?: string
  src?: string | null
  size?: number
  className?: string
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={`${name} 图标`}
        width={size}
        height={size}
        className={cn('shrink-0 rounded-md object-cover', className)}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md bg-gradient-to-br font-semibold text-white',
        pickGradient(seed ?? name),
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.5) }}
    >
      {Array.from(name.trim())[0] ?? '?'}
    </span>
  )
}
