'use client'

import { Button, useDocumentInfo } from '@payloadcms/ui'

/** 后台“卡密批次”详情页侧栏：导出卡密 txt，一行一张，可直接导入发卡平台 */
export function BatchExport() {
  const { id } = useDocumentInfo()
  if (!id) {
    return (
      <p style={{ color: 'var(--theme-elevation-500)', fontSize: 13, marginBottom: 24 }}>
        保存后会按数量生成卡密，然后可以在这里导出。
      </p>
    )
  }
  const base = `/api/redeem-batches/${id}/export`
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
      <span style={{ fontSize: 13, color: 'var(--theme-elevation-800)' }}>导出卡密</span>
      <Button el="anchor" url={base} buttonStyle="primary" size="medium" margin={false}>
        导出未使用的卡密（txt）
      </Button>
      <Button
        el="anchor"
        url={`${base}?status=all`}
        buttonStyle="secondary"
        size="medium"
        margin={false}
      >
        导出全部卡密
      </Button>
    </div>
  )
}
