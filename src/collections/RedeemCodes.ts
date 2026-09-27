import { APIError, type CollectionConfig } from 'payload'

import { isAdmin, isAdminField, nobody } from '../access'

export const REDEEM_STATUS_LABELS = {
  unused: '未使用',
  used: '已兑换',
  disabled: '已停用',
} as const

/**
 * 卡密。由“卡密批次”一次性生成，不能单独新建；
 * 泄露或退款时把状态改成“已停用”即可，已兑换的卡密不能再改。
 */
export const RedeemCodes: CollectionConfig = {
  slug: 'redeem-codes',
  labels: { singular: '卡密', plural: '卡密' },
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'batch', 'credits', 'status', 'usedBy', 'usedAt'],
    group: '用户与积分',
    listSearchableFields: ['code'],
  },
  defaultSort: '-createdAt',
  access: {
    read: isAdmin,
    create: nobody,
    update: isAdmin,
    delete: nobody,
  },
  fields: [
    {
      name: 'code',
      label: '卡密',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      access: { update: () => false },
      admin: { readOnly: true },
    },
    {
      name: 'batch',
      label: '批次',
      type: 'relationship',
      relationTo: 'redeem-batches',
      required: true,
      index: true,
      access: { update: () => false },
      admin: { readOnly: true },
    },
    {
      name: 'credits',
      label: '面额（积分）',
      type: 'number',
      required: true,
      access: { update: () => false },
      admin: { readOnly: true },
    },
    {
      name: 'status',
      label: '状态',
      type: 'select',
      required: true,
      defaultValue: 'unused',
      index: true,
      options: Object.entries(REDEEM_STATUS_LABELS).map(([value, label]) => ({ label, value })),
      access: { update: isAdminField },
      admin: { position: 'sidebar' },
    },
    {
      name: 'usedBy',
      label: '兑换用户',
      type: 'relationship',
      relationTo: 'users',
      access: { update: () => false },
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'usedAt',
      label: '兑换时间',
      type: 'date',
      access: { update: () => false },
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime', displayFormat: 'yyyy-MM-dd HH:mm' },
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc, operation }) => {
        if (operation !== 'update') return data
        // 兑换只能由系统完成，后台只能在“未使用”和“已停用”之间切换
        if (originalDoc?.status === 'used' && data.status !== 'used') {
          throw new APIError('已兑换的卡密不能修改状态', 400, null, true)
        }
        if (originalDoc?.status !== 'used' && data.status === 'used') {
          throw new APIError('不能手动把卡密改成“已兑换”', 400, null, true)
        }
        return data
      },
    ],
  },
  timestamps: true,
}
