'use client'

import { CheckIcon, CopyIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function CopyButton({
  value,
  label,
  className,
}: {
  value: string
  label?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // 非 HTTPS 环境下 clipboard API 不可用，退回旧方法
      const textarea = document.createElement('textarea')
      textarea.value = value
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={label ? 'sm' : 'icon-sm'}
      onClick={copy}
      className={cn('shrink-0', className)}
    >
      {copied ? <CheckIcon className="text-emerald-500" /> : <CopyIcon />}
      {label && <span>{copied ? '已复制' : label}</span>}
      {!label && <span className="sr-only">{copied ? '已复制' : '复制'}</span>}
    </Button>
  )
}
