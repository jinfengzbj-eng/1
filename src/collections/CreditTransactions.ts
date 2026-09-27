import { randomUUID } from 'crypto'
import { APIError, type CollectionConfig } from 'payload'

import { isAdmin, nobody, userIsAdmin } from '../access'
import { CREDIT_TYPE_LABELS } from '../lib/credit-types'
import { applyAdminAdjustment } from '../lib/credits'

/**
 * 积分流水。用户余额只通过这里变动：每条流水和余额变化在同一个事务里写入。
 * 后台“新建”一条流水就是手动调整积分（正数加、负数扣）；其他类型由系统写入。
 * 流水写入后不能修改或删除。
 */
// 系统填写的字段，新建时不显示
const isSaved = (data: Partial<{ id: unknown }>) => Boolean(data?.id)

export const CreditTransactions: CollectionConfig = {
  slug: 'credit-transactions',
  labels: { singular: '积分流水', plural: '积分流水' },
  admin: {
    useAsTitle: 'note',
    defaultColumns: ['user', 'type', 'amount', 'balanceAfter', 'note', 'createdAt'],
    group: '用户与积分',
    description: '想给用户加减积分，点标题旁的“创建新条目”，填用户和数量即可（负数为扣减）。',
  },
  defaultSort: '-createdAt',
  access: {
    read: ({ req: { user } }) => {
      if (userIsAdmin(user)) return true
      if (user) return { user: { equals: user.id } }
      return false
    },
    create: isAdmin,
    update: nobody,
    delete: nobody,
  },
  fields: [
    {
      name: 'user',
      label: '用户',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: { allowCreate: false },
    },
    {
      name: 'amount',
      label: '积分变动',
      type: 'number',
      required: true,
      admin: { description: '正数为增加，负数为扣减' },
      validate: (value: number | null | undefined) => {
        if (typeof value !== 'number' || !Number.isInteger(value) || value === 0) {
          return '请填写不为 0 的整数'
        }
        return true
      },
    },
    {
      name: 'note',
      label: '备注',
      type: 'text',
      admin: { description: '用户在积分记录里能看到，比如“客服补偿”' },
    },
    {
      name: 'type',
      label: '类型',
      type: 'select',
      required: true,
      defaultValue: 'admin',
      options: Object.entries(CREDIT_TYPE_LABELS).map(([value, label]) => ({ label, value })),
      admin: { position: 'sidebar', condition: isSaved, readOnly: true },
    },
    {
      name: 'balanceAfter',
      label: '变动后余额',
      type: 'number',
      admin: { position: 'sidebar', condition: isSaved, readOnly: true },
    },
    {
      name: 'product',
      label: '产品',
      type: 'text',
      admin: {
        position: 'sidebar',
        condition: isSaved,
        readOnly: true,
        description: '消费时记录，如 mcp/pdf-parser',
      },
    },
    {
      name: 'redeemCode',
      label: '卡密',
      type: 'relationship',
      relationTo: 'redeem-codes',
      admin: { position: 'sidebar', condition: isSaved, readOnly: true },
    },
    {
      name: 'operator',
      label: '操作人',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar', condition: isSaved, readOnly: true },
    },
    {
      // 幂等键：同一个键只能记一次账，防止重复扣费、重复兑换、重复赠送
      name: 'key',
      label: '流水号',
      type: 'text',
      unique: true,
      index: true,
      admin: { position: 'sidebar', condition: isSaved, readOnly: true },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation, req, context }) => {
        if (operation !== 'create' || context.system) return data
        // 后台手动新建的流水：固定为“后台调整”，余额在写入后再原子地更新
        return {
          ...data,
          type: 'admin',
          key: `admin:${randomUUID()}`,
          balanceAfter: null,
          product: null,
          redeemCode: null,
          operator: req.user?.id ?? null,
        }
      },
    ],
    afterChange: [
      async ({ doc, operation, req, context }) => {
        if (operation !== 'create' || context.system) return doc
        const userId = typeof doc.user === 'object' ? doc.user.id : doc.user
        const result = await applyAdminAdjustment(req.payload, {
          transactionId: doc.id,
          userId,
          amount: doc.amount,
        })
        if (!result.ok) {
          // 扣减后会变成负数：撤回这条流水
          await req.payload.delete({
            collection: 'credit-transactions',
            id: doc.id,
            overrideAccess: true,
          })
          throw new APIError(
            `余额不足：当前 ${result.balance} 积分，不能扣减 ${-doc.amount}`,
            400,
            null,
            true,
          )
        }
        return { ...doc, balanceAfter: result.balance }
      },
    ],
  },
  timestamps: true,
}
