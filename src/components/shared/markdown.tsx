import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { cn } from '@/lib/utils'

export function Markdown({ source, className }: { source?: string | null; className?: string }) {
  if (!source) return <p className="text-muted-foreground">暂无介绍</p>
  return (
    <div
      className={cn(
        'prose prose-sm max-w-none dark:prose-invert sm:prose-base',
        'text-ink-2 prose-headings:font-semibold prose-headings:text-foreground prose-h2:mt-7 prose-h2:mb-3 prose-h2:text-lg prose-h3:text-base prose-a:text-brand prose-strong:text-foreground prose-blockquote:rounded-2xl prose-blockquote:border-l-0 prose-blockquote:bg-brand-soft prose-blockquote:px-5 prose-blockquote:py-1 prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-foreground prose-pre:bg-code prose-pre:text-foreground prose-li:marker:text-muted-foreground',
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{source}</ReactMarkdown>
    </div>
  )
}
