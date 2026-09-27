'use client'

import { CheckCircle2Icon } from 'lucide-react'
import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'

import { redeemAction, type RedeemState } from '@/app/(frontend)/actions/credits'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function RedeemForm() {
  const [state, formAction, pending] = useActionState<RedeemState, FormData>(redeemAction, {})
  useEffect(() => {
    if (state.success) toast.success(`兑换成功，获得 ${state.success.credits} 积分`)
  }, [state.success])

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label htmlFor="redeem-code" className="sr-only">
        卡密
      </label>
      <Input
        id="redeem-code"
        name="code"
        placeholder="XXXX-XXXX-XXXX-XXXX"
        // 输错时保留原输入方便修改；兑换成功后换 key，输入框清空
        defaultValue={state.code}
        key={state.success?.at ?? 'form'}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={40}
        aria-invalid={!!state.error}
        aria-describedby={state.error ? 'redeem-error' : undefined}
        className="h-11 font-mono tracking-wider uppercase placeholder:tracking-normal"
      />
      {state.error && (
        <p id="redeem-error" role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="flex items-center gap-1.5 text-sm text-free">
          <CheckCircle2Icon className="size-4" />
          已到账 {state.success.credits} 积分，当前余额 {state.success.balance}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? '正在兑换…' : '兑换'}
      </Button>
    </form>
  )
}
