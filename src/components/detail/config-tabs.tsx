'use client'

import { CopyButton } from '@/components/shared/copy-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ClientConfig } from '@/lib/mcp-config'

export function ConfigTabs({ configs }: { configs: ClientConfig[] }) {
  return (
    <Tabs defaultValue={configs[0]?.id} className="w-full">
      <TabsList className="h-auto w-full flex-wrap justify-start">
        {configs.map((config) => (
          <TabsTrigger key={config.id} value={config.id} className="flex-none">
            {config.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {configs.map((config) => (
        <TabsContent key={config.id} value={config.id} className="mt-3">
          <div className="mb-2 flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">{config.hint}</p>
            <CopyButton value={config.code} label="复制" />
          </div>
          <pre className="overflow-x-auto rounded-lg border bg-background p-4 font-mono text-[13px] leading-relaxed">
            <code>{config.code}</code>
          </pre>
        </TabsContent>
      ))}
    </Tabs>
  )
}
