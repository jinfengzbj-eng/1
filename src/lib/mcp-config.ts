export type ClientConfig = {
  id: string
  name: string
  hint: string
  language: 'json' | 'bash' | 'text'
  code: string
}

export const API_KEY_PLACEHOLDER = '<登录后自动填入你的密钥>'

/** 生成各个 AI 客户端的接入配置，密钥放在 Authorization 请求头里 */
export function buildClientConfigs({
  slug,
  endpoint,
  transport,
  apiKey,
}: {
  slug: string
  endpoint: string
  transport: 'http' | 'sse'
  apiKey?: string | null
}): ClientConfig[] {
  const key = apiKey || API_KEY_PLACEHOLDER
  const bearer = `Bearer ${key}`
  const json = (value: unknown) => JSON.stringify(value, null, 2)

  return [
    {
      id: 'cursor',
      name: 'Cursor',
      hint: '写入 ~/.cursor/mcp.json（全局）或项目里的 .cursor/mcp.json',
      language: 'json',
      code: json({ mcpServers: { [slug]: { url: endpoint, headers: { Authorization: bearer } } } }),
    },
    {
      id: 'claude-code',
      name: 'Claude Code',
      hint: '在终端执行下面的命令',
      language: 'bash',
      code: `claude mcp add --transport ${transport} ${slug} ${endpoint} --header "Authorization: ${bearer}"`,
    },
    {
      id: 'vscode',
      name: 'VS Code',
      hint: '写入项目里的 .vscode/mcp.json',
      language: 'json',
      code: json({
        servers: { [slug]: { type: transport, url: endpoint, headers: { Authorization: bearer } } },
      }),
    },
    {
      id: 'claude-desktop',
      name: 'Claude Desktop',
      hint: '写入 claude_desktop_config.json（需要本机装有 Node.js），保存后重启 Claude',
      language: 'json',
      code: json({
        mcpServers: {
          [slug]: {
            command: 'npx',
            args: ['-y', 'mcp-remote', endpoint, '--header', 'Authorization:${AUTH_HEADER}'],
            env: { AUTH_HEADER: bearer },
          },
        },
      }),
    },
    {
      id: 'cherry-studio',
      name: 'Cherry Studio',
      hint: '在 设置 → MCP 服务器 → 添加服务器 中按下面填写',
      language: 'text',
      code: [
        `名称：${slug}`,
        `类型：${transport === 'http' ? '可流式传输的 HTTP（streamableHttp）' : '服务器发送事件（sse）'}`,
        `URL：${endpoint}`,
        `请求头：Authorization=${bearer}`,
      ].join('\n'),
    },
    {
      id: 'generic',
      name: '其他客户端',
      hint: '支持远程 MCP 的客户端都可以按下面的信息接入',
      language: 'text',
      code: [
        `地址：${endpoint}`,
        `传输方式：${transport === 'http' ? 'Streamable HTTP' : 'SSE'}`,
        `请求头：Authorization: ${bearer}`,
      ].join('\n'),
    },
  ]
}
