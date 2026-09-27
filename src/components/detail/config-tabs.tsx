'use client'

import { CopyButton } from '@/components/shared/copy-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ClientConfig } from '@/lib/mcp-config'

/** 各客户端的接入配置，用 iOS 式分段控件切换 */
export function ConfigTabs({ configs }: { configs: ClientConfig[] }) {
  return (
    <Tabs defaultValue={configs[0]?.id} className="w-full gap-4">
      <div className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none]">
        <TabsList className="h-auto w-full min-w-max rounded-[14px] p-1">
          {configs.map((config) => (
            <TabsTrigger key={config.id} value={config.id} className="h-9 rounded-[10px] px-3.5">
              {config.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {configs.map((config) => (
        <TabsContent key={config.id} value={config.id} className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">{config.hint}</p>
            <CopyButton value={config.code} label="复制" />
          </div>
          <pre className="overflow-x-auto rounded-2xl border bg-code px-5 py-4 font-mono text-[13.5px] leading-[1.7]">
            <code>{config.code}</code>
          </pre>
        </TabsContent>
      ))}
    </Tabs>
  )
}
