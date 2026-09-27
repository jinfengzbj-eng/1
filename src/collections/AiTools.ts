import type { CollectionConfig } from 'payload'

import { isAdmin, publishedOrAdmin } from '../access'
import { listingFields, publishingFields, validateHttpUrl } from './shared'

export const AiTools: CollectionConfig = {
  slug: 'ai-tools',
  labels: { singular: 'AI 工具', plural: 'AI 工具' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'creditsPerUse', 'status', 'featured', 'updatedAt'],
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
    ...listingFields('tool'),
    {
      type: 'row',
      fields: [
        {
          name: 'url',
          validate: validateHttpUrl,
          label: '工具地址',
          type: 'text',
          required: true,
          admin: {
            width: '60%',
            description: '点击“开始使用”后打开的网址，例如 https://music.example.com',
          },
        },
        {
          name: 'creditsPerUse',
          label: '每次使用消耗积分',
          type: 'number',
          required: true,
          defaultValue: 0,
          min: 0,
          admin: { width: '40%', description: '填 0 表示免费' },
        },
      ],
    },
    {
      name: 'badge',
      label: '角标',
      type: 'select',
      options: [
        { label: '新品', value: 'new' },
        { label: '热门', value: 'hot' },
        { label: '内测', value: 'beta' },
      ],
      admin: { position: 'sidebar' },
    },
    ...publishingFields,
  ],
}
