import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { zh } from '@payloadcms/translations/languages/zh'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { AiTools } from './collections/AiTools'
import { Categories } from './collections/Categories'
import { CreditTransactions } from './collections/CreditTransactions'
import { McpServers } from './collections/McpServers'
import { Media } from './collections/Media'
import { RedeemBatches } from './collections/RedeemBatches'
import { RedeemCodes } from './collections/RedeemCodes'
import { Users } from './collections/Users'
import { creditEndpoints } from './endpoints/credits'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    // 默认头像走 Gravatar，国内打不开，改用内置头像
    avatar: 'default',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' - 管理后台',
    },
  },
  i18n: {
    supportedLanguages: { zh },
    fallbackLanguage: 'zh',
  },
  collections: [
    McpServers,
    AiTools,
    Categories,
    Media,
    Users,
    CreditTransactions,
    RedeemBatches,
    RedeemCodes,
  ],
  // 给 MCP 网关和 AI 工具调用的内部接口：/api/credits/*
  endpoints: creditEndpoints,
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || '',
    },
    busyTimeout: 5000,
  }),
  sharp,
  plugins: [],
})
