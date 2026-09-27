import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { cn } from '@/lib/utils'

export function Markdown({ source, className }: { source?: string | null; className?: string }) {
  if (!source) return <p className="text-muted-foreground">暂无介绍</p>
  return (
    <div
      className={cn(
        'prose prose-sm max-w-none dark:prose-invert sm:prose-base',
        'prose-headings:font-semibold prose-a:text-primary prose-pre:bg-muted prose-pre:text-foreground',
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{source}</ReactMarkdown>
    </div>
  )
}
