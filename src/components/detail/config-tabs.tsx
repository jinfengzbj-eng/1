'use client'

import { CopyButton } from '@/components/shared/copy-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ClientConfig } from '@/lib/mcp-config'

/**
 * 各客户端的接入配置。
 * 桌面端用 iOS 式分段控件切换；手机端换成可横滑的胶囊，复制按钮放到代码下面、占满一行。
 */
export function ConfigTabs({ configs }: { configs: ClientConfig[] }) {
  return (
    <Tabs defaultValue={configs[0]?.id} className="w-full gap-3 md:gap-4">
      <div className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none] max-md:-mr-4 max-md:pr-4">
        <TabsList className="h-auto w-full min-w-max rounded-[14px] p-1 max-md:gap-1.5 max-md:bg-transparent max-md:p-0">
          {configs.map((config) => (
            <TabsTrigger
              key={config.id}
              value={config.id}
              className="h-9 rounded-[10px] px-3.5 max-md:h-7.5 max-md:flex-none max-md:rounded-full max-md:bg-seg-track max-md:px-3 max-md:text-[13px] max-md:font-normal max-md:text-ink-2 max-md:data-[state=active]:bg-brand-soft max-md:data-[state=active]:font-semibold max-md:data-[state=active]:text-brand max-md:data-[state=active]:shadow-none"
            >
              {config.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {configs.map((config) => (
        <TabsContent key={config.id} value={config.id} className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground max-md:text-[13px]">{config.hint}</p>
            <CopyButton value={config.code} label="复制" className="max-md:hidden" />
          </div>
          <pre className="overflow-x-auto rounded-xl border bg-code px-3.5 py-3 font-mono text-xs leading-[1.6] md:rounded-2xl md:px-5 md:py-4 md:text-[13.5px] md:leading-[1.7]">
            <code>{config.code}</code>
          </pre>
          <CopyButton
            value={config.code}
            label="复制配置"
            className="h-11 w-full rounded-xl border-0 bg-brand-soft text-[15px] font-semibold text-brand shadow-none hover:bg-brand-soft hover:text-brand md:hidden"
          />
        </TabsContent>
      ))}
    </Tabs>
  )
}
