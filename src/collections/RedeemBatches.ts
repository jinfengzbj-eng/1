import type { CollectionConfig, FieldHook } from 'payload'

import { isAdmin, nobody } from '../access'
import { exportBatchCodes, insertBatchCodes } from '../lib/credits'

export const MAX_BATCH_QUANTITY = 5000

// 已兑换 / 未使用数量：不存库，读取时现算
const countCodes =
  (status: 'used' | 'unused'): FieldHook =>
  async ({ data, req }) => {
    if (!data?.id) return 0
    const { totalDocs } = await req.payload.count({
      collection: 'redeem-codes',
      where: { and: [{ batch: { equals: data.id } }, { status: { equals: status } }] },
      overrideAccess: true,
      req,
    })
    return totalDocs
  }

/**
 * 卡密批次。新建时按数量和面额一次性生成卡密，之后可以导出成 txt 上传到发卡平台。
 * 面额和数量生成后不能改；整批作废用“停用整批”，批次不能删除（保留兑换记录）。
 */
export const RedeemBatches: CollectionConfig = {
  slug: 'redeem-batches',
  labels: { singular: '卡密批次', plural: '卡密批次' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: [
      'name',
      'credits',
      'quantity',
      'usedCount',
      'expiresAt',
      'disabled',
      'createdAt',
    ],
    group: '用户与积分',
    description: '新建批次会按数量生成卡密，保存后在批次详情里导出 txt，上传到发卡平台销售。',
  },
  defaultSort: '-createdAt',
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: nobody,
  },
  endpoints: [
    {
      // GET /api/redeem-batches/:id/export?status=unused|all
      path: '/:id/export',
      method: 'get',
      handler: exportBatchCodes,
    },
  ],
  fields: [
    {
      name: 'name',
      label: '批次名称',
      type: 'text',
      required: true,
      admin: { description: '自己看的，比如“淘宝 100 积分 第 1 批”' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'credits',
          label: '面额（积分）',
          type: 'number',
          required: true,
          min: 1,
          max: 1_000_000,
          access: { update: () => false },
          admin: { description: '每张卡密能兑换的积分，生成后不能改' },
        },
        {
          name: 'quantity',
          label: '数量（张）',
          type: 'number',
          required: true,
          min: 1,
          max: MAX_BATCH_QUANTITY,
          access: { update: () => false },
          admin: { description: `一次最多 ${MAX_BATCH_QUANTITY} 张，生成后不能改` },
        },
      ],
    },
    {
      name: 'expiresAt',
      label: '过期时间',
      type: 'date',
      admin: {
        description: '不填则永久有效；过期后未兑换的卡密不能再兑换',
        date: { pickerAppearance: 'dayAndTime', displayFormat: 'yyyy-MM-dd HH:mm' },
      },
    },
    {
      name: 'disabled',
      label: '停用整批',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: '卡密泄露或下架时勾选，本批未兑换的卡密全部不能再兑换' },
    },
    {
      name: 'note',
      label: '备注',
      type: 'textarea',
    },
    {
      name: 'exportTools',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: { Field: '@/components/admin/batch-export#BatchExport' },
      },
    },
    {
      name: 'usedCount',
      label: '已兑换',
      type: 'number',
      virtual: true,
      admin: { position: 'sidebar', readOnly: true },
      hooks: { afterRead: [countCodes('used')] },
    },
    {
      name: 'unusedCount',
      label: '未使用',
      type: 'number',
      virtual: true,
      admin: { position: 'sidebar', readOnly: true },
      hooks: { afterRead: [countCodes('unused')] },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return doc
        await insertBatchCodes(req.payload, {
          batchId: doc.id,
          credits: doc.credits,
          quantity: doc.quantity,
        })
        return doc
      },
    ],
  },
  timestamps: true,
}
