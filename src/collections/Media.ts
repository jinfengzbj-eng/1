import type { CollectionConfig } from 'payload'

import { anyone, isAdmin } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: '图片', plural: '图片' },
  admin: { group: '内容' },
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'alt',
      label: '替代文字',
      type: 'text',
    },
  ],
  upload: {
    mimeTypes: ['image/*'],
  },
}
