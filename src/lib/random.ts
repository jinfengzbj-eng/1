import { randomBytes } from 'crypto'

// 去掉了容易混淆的 0/O、1/I/L
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/** 生成卡密，形如 ABCD-EFGH-JKMN-PQRS（16 位，约 79 bit 随机性） */
export function generateRedeemCode(): string {
  const bytes = randomBytes(16)
  let raw = ''
  for (const byte of bytes) raw += CODE_ALPHABET[byte % CODE_ALPHABET.length]
  return raw.match(/.{4}/g)!.join('-')
}

/** 用户输入的卡密统一成存储格式：大写、去空白、补回分隔符 */
export function normalizeRedeemCode(input: string): string {
  const raw = input.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (raw.length !== 16) return input.trim().toUpperCase()
  return raw.match(/.{4}/g)!.join('-')
}

/** 用户的接入密钥，用于 MCP 网关和 AI 工具鉴权 */
export function generateApiKey(): string {
  return `sk-${randomBytes(24).toString('base64url')}`
}
