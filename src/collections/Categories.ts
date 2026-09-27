import type { CollectionConfig } from 'payload'

import { anyone, isAdmin } from '../access'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: '分类', plural: '分类' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'kind', 'sortOrder'],
    group: '内容',
  },
  defaultSort: 'sortOrder',
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', label: '名称', type: 'text', required: true },
    {
      name: 'slug',
      label: '英文标识',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: '用于网址筛选，例如 productivity' },
    },
    {
      name: 'kind',
      label: '用于',
      type: 'select',
      required: true,
      defaultValue: 'mcp',
      options: [
        { label: 'MCP 服务', value: 'mcp' },
        { label: 'AI 工具', value: 'tool' },
      ],
    },
    {
      name: 'sortOrder',
      label: '排序',
      type: 'number',
      defaultValue: 0,
      admin: { description: '数字越小越靠前' },
    },
  ],
}
