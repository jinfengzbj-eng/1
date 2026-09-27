import { CREDIT_TYPE_LABELS, type CreditType } from '@/lib/credit-types'
import type { CreditHistoryItem } from '@/lib/data'
import { cn, formatDateTime } from '@/lib/utils'

/** 积分流水列表：左边类型和说明，右边变动数量和变动后余额 */
export function CreditHistory({ items }: { items: CreditHistoryItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed text-sm text-muted-foreground">
        暂无记录，兑换卡密或使用服务后会显示在这里
      </div>
    )
  }
  return (
    <ul className="-my-3 divide-y">
      {items.map((item) => {
        const label = CREDIT_TYPE_LABELS[item.type as CreditType] ?? item.type
        return (
          <li key={item.id} className="flex items-center gap-3 py-3">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-[15px] font-medium">{item.note || label}</span>
              <span className="truncate text-xs text-muted-foreground tabular-nums">
                {label} · {formatDateTime(item.createdAt)}
              </span>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-0.5 tabular-nums">
              <span
                className={cn(
                  'text-base font-semibold',
                  item.amount > 0 ? 'text-free' : 'text-foreground',
                )}
              >
                {item.amount > 0 ? `+${item.amount}` : item.amount}
              </span>
              {item.balanceAfter !== null && (
                <span className="text-xs text-muted-foreground">余额 {item.balanceAfter}</span>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
