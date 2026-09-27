import type { CollectionConfig, FieldAccess } from 'payload'

import { isAdmin, isAdminField, userIsAdmin } from '../access'
import { generateApiKey } from '../lib/random'

const adminOrSelfField: FieldAccess = ({ req: { user }, doc }) =>
  userIsAdmin(user) || (!!user && user.id === doc?.id)

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: '用户', plural: '用户' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'nickname', 'role', 'credits', 'createdAt'],
    group: '用户与积分',
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30,
    maxLoginAttempts: 10,
    lockTime: 10 * 60 * 1000,
  },
  access: {
    // 只有管理员能进后台；前台注册走服务端逻辑，不开放 REST 创建
    admin: ({ req: { user } }) => userIsAdmin(user),
    create: isAdmin,
    read: ({ req: { user } }) => {
      if (userIsAdmin(user)) return true
      if (user) return { id: { equals: user.id } }
      return false
    },
    update: ({ req: { user } }) => {
      if (userIsAdmin(user)) return true
      if (user) return { id: { equals: user.id } }
      return false
    },
    delete: isAdmin,
  },
  fields: [
    {
      name: 'nickname',
      label: '昵称',
      type: 'text',
    },
    {
      name: 'role',
      label: '角色',
      type: 'select',
      required: true,
      defaultValue: 'user',
      options: [
        { label: '管理员', value: 'admin' },
        { label: '普通用户', value: 'user' },
      ],
      access: { create: isAdminField, update: isAdminField },
      admin: { position: 'sidebar' },
    },
    {
      name: 'credits',
      label: '积分余额',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
      access: { create: isAdminField, update: isAdminField },
      admin: { position: 'sidebar' },
    },
    {
      name: 'apiKey',
      label: '接入密钥',
      type: 'text',
      unique: true,
      index: true,
      access: { read: adminOrSelfField, create: isAdminField, update: isAdminField },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: '用户在 MCP 客户端和 AI 工具中使用的密钥',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, req, context }) => {
        if (operation !== 'create') return data
        if (!data.apiKey) data.apiKey = generateApiKey()
        // 后台“创建首个用户”时，第一个用户自动成为管理员；前台注册永远是普通用户
        if (context.publicSignup) return data
        const { totalDocs } = await req.payload.count({ collection: 'users', req })
        if (totalDocs === 0) data.role = 'admin'
        return data
      },
    ],
  },
}
