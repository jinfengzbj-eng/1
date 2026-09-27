import { describe, expect, it } from 'vitest'

import { API_KEY_PLACEHOLDER, buildClientConfigs } from '@/lib/mcp-config'
import { generateApiKey, generateRedeemCode, normalizeRedeemCode } from '@/lib/random'
import { safeNext } from '@/lib/safe-next'

describe('safeNext', () => {
  it('允许站内相对路径', () => {
    expect(safeNext('/tools')).toBe('/tools')
    expect(safeNext('/mcp/weather?x=1')).toBe('/mcp/weather?x=1')
  })

  it('拦截外部地址，回到默认页', () => {
    expect(safeNext('//evil.example.com')).toBe('/console')
    expect(safeNext('/\\evil.example.com')).toBe('/console')
    expect(safeNext('https://evil.example.com')).toBe('/console')
    expect(safeNext(null)).toBe('/console')
  })
})

describe('密钥与卡密', () => {
  it('接入密钥以 sk- 开头且每次不同', () => {
    const a = generateApiKey()
    expect(a).toMatch(/^sk-[\w-]{32}$/)
    expect(generateApiKey()).not.toBe(a)
  })

  it('卡密格式为 4 组 4 位且不含易混淆字符', () => {
    const code = generateRedeemCode()
    expect(code).toMatch(/^[A-Z2-9]{4}(-[A-Z2-9]{4}){3}$/)
    expect(code).not.toMatch(/[01OIL]/)
  })

  it('用户输入的卡密会被规范化', () => {
    expect(normalizeRedeemCode(' abcd efgh-jkmn pqrs ')).toBe('ABCD-EFGH-JKMN-PQRS')
  })
})

describe('buildClientConfigs', () => {
  const base = {
    slug: 'weather',
    endpoint: 'https://mcp.example.com/weather/mcp',
    transport: 'http' as const,
  }

  it('登录后把密钥写进各客户端配置', () => {
    const configs = buildClientConfigs({ ...base, apiKey: 'sk-test' })
    const cursor = JSON.parse(configs.find((c) => c.id === 'cursor')!.code)
    expect(cursor.mcpServers.weather).toEqual({
      url: base.endpoint,
      headers: { Authorization: 'Bearer sk-test' },
    })
    const vscode = JSON.parse(configs.find((c) => c.id === 'vscode')!.code)
    expect(vscode.servers.weather.type).toBe('http')
    expect(configs.find((c) => c.id === 'claude-code')!.code).toBe(
      'claude mcp add --transport http weather https://mcp.example.com/weather/mcp --header "Authorization: Bearer sk-test"',
    )
  })

  it('未登录时使用占位符', () => {
    const configs = buildClientConfigs({ ...base, apiKey: null })
    expect(configs.every((c) => c.code.includes(API_KEY_PLACEHOLDER))).toBe(true)
  })
})
