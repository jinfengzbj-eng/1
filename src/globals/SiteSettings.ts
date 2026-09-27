import type { GlobalConfig } from 'payload'

import { anyone, isAdmin } from '../access'
import { validateOptionalHttpUrl } from '../collections/shared'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: '站点设置',
  admin: { group: '设置' },
  access: {
    read: anyone,
    update: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: '基本信息',
          fields: [
            {
              name: 'siteName',
              label: '网站名称',
              type: 'text',
              required: true,
              defaultValue: 'MCP 集市',
            },
            {
              name: 'tagline',
              label: '一句话介绍',
              type: 'text',
              defaultValue: '好用的 MCP 服务和在线 AI 工具，一个账号全部搞定',
              admin: { description: '显示在页脚和搜索引擎结果里' },
            },
            { name: 'logo', label: '网站 Logo', type: 'upload', relationTo: 'media' },
            {
              name: 'icp',
              label: 'ICP 备案号',
              type: 'text',
              admin: { description: '国内网站需在页脚展示，例如 京ICP备12345678号' },
            },
            {
              name: 'contact',
              label: '联系方式',
              type: 'text',
              admin: { description: '例如客服微信号或邮箱' },
            },
          ],
        },
        {
          label: '首页（MCP）',
          fields: [
            {
              name: 'mcpHeroLabel',
              label: '顶部小标签',
              type: 'text',
              defaultValue: '新用户注册即送积分',
            },
            {
              name: 'mcpHeroTitle',
              label: '大标题（普通部分）',
              type: 'text',
              defaultValue: '发现好用的',
            },
            {
              name: 'mcpHeroHighlight',
              label: '大标题（渐变高亮部分）',
              type: 'text',
              defaultValue: 'MCP 服务',
            },
            {
              name: 'mcpHeroSubtitle',
              label: '副标题',
              type: 'textarea',
              defaultValue:
                '一键接入 Claude、Cursor、Cherry Studio 等 AI 客户端，按次计费，积分支付',
            },
          ],
        },
        {
          label: 'AI 工具页',
          fields: [
            {
              name: 'toolsHeroTitle',
              label: '大标题（普通部分）',
              type: 'text',
              defaultValue: '开箱即用的',
            },
            {
              name: 'toolsHeroHighlight',
              label: '大标题（渐变高亮部分）',
              type: 'text',
              defaultValue: '在线 AI 工具',
            },
            {
              name: 'toolsHeroSubtitle',
              label: '副标题',
              type: 'textarea',
              defaultValue: 'AI 音乐、绘画、配音等工具，打开网页就能用，和 MCP 服务共用积分',
            },
          ],
        },
        {
          label: '积分与卡密',
          fields: [
            {
              name: 'signupBonus',
              label: '注册赠送积分',
              type: 'number',
              defaultValue: 20,
              min: 0,
            },
            {
              name: 'buyCodesUrl',
              label: '购买卡密链接',
              type: 'text',
              validate: validateOptionalHttpUrl,
              admin: { description: '你的发卡平台或店铺链接，用户中心会显示“购买卡密”按钮' },
            },
            {
              name: 'redeemNote',
              label: '兑换说明',
              type: 'textarea',
              defaultValue:
                '卡密可在发卡平台购买，兑换后积分立即到账，可用于所有 MCP 服务和 AI 工具。',
            },
          ],
        },
      ],
    },
  ],
}
