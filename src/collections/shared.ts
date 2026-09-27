import type { Field } from 'payload'

/** MCP 服务和 AI 工具共用的展示字段 */
export const listingFields = (kind: 'mcp' | 'tool'): Field[] => [
  { name: 'name', label: '名称', type: 'text', required: true },
  {
    name: 'summary',
    label: '一句话介绍',
    type: 'textarea',
    required: true,
    maxLength: 120,
    admin: { description: '显示在卡片上，建议 50 字以内' },
  },
  {
    name: 'logo',
    label: '图标',
    type: 'upload',
    relationTo: 'media',
    admin: { description: '不上传则自动用名称首字生成图标' },
  },
  {
    name: 'category',
    label: '分类',
    type: 'relationship',
    relationTo: 'categories',
    filterOptions: { kind: { equals: kind } },
  },
  {
    name: 'tags',
    label: '标签',
    type: 'text',
    hasMany: true,
  },
  {
    name: 'description',
    label: '详细介绍',
    type: 'textarea',
    admin: {
      description: '支持 Markdown，可以直接粘贴 README',
      rows: 16,
    },
  },
]

/** 侧栏里的上架状态、推荐、排序 */
export const publishingFields: Field[] = [
  {
    name: 'slug',
    label: '英文短名',
    type: 'text',
    required: true,
    unique: true,
    index: true,
    admin: {
      position: 'sidebar',
      description: '用于网址和客户端配置，只能用小写字母、数字和横线，例如 weather',
    },
    validate: (value: unknown) =>
      typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
        ? true
        : '只能用小写字母、数字和横线',
  },
  {
    name: 'status',
    label: '状态',
    type: 'select',
    required: true,
    defaultValue: 'published',
    options: [
      { label: '已上架', value: 'published' },
      { label: '已下架', value: 'hidden' },
    ],
    admin: { position: 'sidebar' },
  },
  {
    name: 'featured',
    label: '推荐',
    type: 'checkbox',
    defaultValue: false,
    admin: { position: 'sidebar', description: '推荐的会排在前面并带标记' },
  },
  {
    name: 'sortOrder',
    label: '排序',
    type: 'number',
    defaultValue: 0,
    admin: { position: 'sidebar', description: '数字越小越靠前' },
  },
]

/** 只允许 http/https 地址，防止写入 javascript: 之类的链接 */
export const validateHttpUrl = (value: unknown) => {
  if (typeof value !== 'string' || !value) return '请填写地址'
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? true
      : '只能填写 http 或 https 地址'
  } catch {
    return '地址格式不正确'
  }
}

export const validateOptionalHttpUrl = (value: unknown) =>
  value === null || value === undefined || value === '' ? true : validateHttpUrl(value)
