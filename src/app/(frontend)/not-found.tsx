import Link from 'next/link'

import Container from '@/components/container'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <p className="text-gradient_indigo-purple text-6xl font-bold">404</p>
      <p className="text-lg text-muted-foreground">页面不存在，或者这个产品已经下架了</p>
      <Button asChild>
        <Link href="/">返回首页</Link>
      </Button>
    </Container>
  )
}
