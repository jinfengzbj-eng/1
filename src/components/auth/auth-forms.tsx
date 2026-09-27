'use client'

import { Loader2Icon, TriangleAlertIcon } from 'lucide-react'
import { useActionState } from 'react'

import { type AuthFormState, loginAction, registerAction } from '@/app/(frontend)/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function FormError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
      <TriangleAlertIcon className="size-4 shrink-0" />
      {message}
    </p>
  )
}

function Field({
  label,
  ...props
}: { label: string } & React.ComponentProps<typeof Input> & { name: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={props.name}>{label}</Label>
      <Input id={props.name} className="h-10" {...props} />
    </div>
  )
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(loginAction, {})
  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="next" value={next ?? ''} />
      <Field
        label="邮箱"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={state.email}
        required
      />
      <Field
        label="密码"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      <FormError message={state.error} />
      <Button type="submit" size="lg" disabled={pending}>
        {pending && <Loader2Icon className="animate-spin" />}
        登录
      </Button>
    </form>
  )
}

export function RegisterForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(registerAction, {})
  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="next" value={next ?? ''} />
      <Field
        label="邮箱"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={state.email}
        required
      />
      <Field label="昵称（选填）" name="nickname" autoComplete="nickname" maxLength={30} />
      <Field
        label="密码"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={6}
        required
      />
      <Field
        label="确认密码"
        name="confirm"
        type="password"
        autoComplete="new-password"
        minLength={6}
        required
      />
      <FormError message={state.error} />
      <Button type="submit" size="lg" disabled={pending}>
        {pending && <Loader2Icon className="animate-spin" />}
        注册
      </Button>
    </form>
  )
}
