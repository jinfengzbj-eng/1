'use client'

import { EyeIcon, EyeOffIcon, RefreshCwIcon } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { regenerateApiKeyAction } from '@/app/(frontend)/actions/auth'
import { CopyButton } from '@/components/shared/copy-button'
import { Button } from '@/components/ui/button'

const mask = (key: string) => `${key.slice(0, 7)}${'•'.repeat(16)}${key.slice(-4)}`

export function ApiKeyCard({ initialKey }: { initialKey: string }) {
  const [apiKey, setApiKey] = useState(initialKey)
  const [visible, setVisible] = useState(false)
  const [pending, startTransition] = useTransition()

  const regenerate = () => {
    if (!window.confirm('重新生成后，旧密钥会立即失效，已配置的客户端需要更新。确定继续吗？'))
      return
    startTransition(async () => {
      const result = await regenerateApiKeyAction()
      if (result.apiKey) {
        setApiKey(result.apiKey)
        setVisible(true)
        toast.success('已生成新密钥')
      } else {
        toast.error(result.error ?? '操作失败，请重试')
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded-xl border bg-code px-3.5 py-2.5 font-mono text-sm">
          {visible ? apiKey : mask(apiKey)}
        </code>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? '隐藏密钥' : '显示密钥'}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </Button>
        <CopyButton value={apiKey} />
      </div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          MCP 详情页的接入配置会自动填入这个密钥，请勿泄露给他人。
        </p>
        <Button variant="outline" size="sm" onClick={regenerate} disabled={pending}>
          <RefreshCwIcon className={pending ? 'animate-spin' : ''} />
          重新生成
        </Button>
      </div>
    </div>
  )
}
