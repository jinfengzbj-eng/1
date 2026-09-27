export const CREDIT_TYPE_LABELS = {
  signup: '注册赠送',
  redeem: '卡密兑换',
  consume: '消费',
  refund: '退款',
  admin: '后台调整',
} as const

export type CreditType = keyof typeof CREDIT_TYPE_LABELS
