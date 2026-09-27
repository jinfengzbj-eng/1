import type { CollectionConfig } from 'payload'

import { isAdmin, publishedOrAdmin } from '../access'
import { listingFields, publishingFields, validateHttpUrl } from './shared'

export const McpServers: CollectionConfig = {
  slug: 'mcp-servers',
  labels: { singular: 'MCP 服务', plural: 'MCP 服务' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'creditsPerCall', 'status', 'featured', 'updatedAt'],
    group: '产品',
  },
  defaultSort: 'sortOrder',
  access: {
    read: publishedOrAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    ...listingFields('mcp'),
    {
      name: 'tools',
      label: '提供的工具',
      type: 'array',
      labels: { singular: '工具', plural: '工具' },
      admin: { description: '展示在详情页，让用户知道接入后能做什么' },
      fields: [
        { name: 'name', label: '工具名', type: 'text', required: true },
        { name: 'description', label: '说明', type: 'textarea' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'endpoint',
          validate: validateHttpUrl,
          label: '远程 MCP 地址',
          type: 'text',
          required: true,
          admin: {
            width: '60%',
            description: '用户客户端连接的地址，例如 https://mcp.example.com/weather/mcp',
          },
        },
        {
          name: 'transport',
          label: '传输方式',
          type: 'select',
          required: true,
          defaultValue: 'http',
          options: [
            { label: 'Streamable HTTP', value: 'http' },
            { label: 'SSE', value: 'sse' },
          ],
          admin: { width: '40%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'creditsPerCall',
          label: '每次调用消耗积分',
          type: 'number',
          required: true,
          defaultValue: 0,
          min: 0,
          admin: { width: '50%', description: '填 0 表示免费' },
        },
        {
          name: 'version',
          label: '版本',
          type: 'text',
          admin: { width: '50%' },
        },
      ],
    },
    ...publishingFields,
  ],
}
