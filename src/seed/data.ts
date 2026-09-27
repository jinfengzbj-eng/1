// 示例数据：名称、地址都是演示用的，上线前在后台替换成你自己的产品

export const mcpCategories = [
  { name: '效率办公', slug: 'productivity', sortOrder: 1 },
  { name: '数据获取', slug: 'data', sortOrder: 2 },
  { name: '内容创作', slug: 'content', sortOrder: 3 },
  { name: '开发工具', slug: 'dev', sortOrder: 4 },
  { name: '生活服务', slug: 'life', sortOrder: 5 },
]

export const toolCategories = [
  { name: '音频', slug: 'audio', sortOrder: 1 },
  { name: '图像', slug: 'image', sortOrder: 2 },
  { name: '文本', slug: 'text', sortOrder: 3 },
  { name: '视频', slug: 'video', sortOrder: 4 },
]

type SeedMcp = {
  name: string
  slug: string
  category: string
  summary: string
  tags: string[]
  tools: { name: string; description: string }[]
  creditsPerCall: number
  featured?: boolean
  version?: string
  intro: string
}

const intro = (lead: string, features: string[], scenes: string[], example: string) =>
  `${lead}

## 功能特点

${features.map((f) => `- ${f}`).join('\n')}

## 适用场景

${scenes.map((s) => `- ${s}`).join('\n')}

## 使用示例

接入后，直接在对话里说：

> ${example}
`

export const mcpServers: SeedMcp[] = [
  {
    name: '网页阅读器',
    slug: 'web-reader',
    category: 'data',
    summary:
      '把任意网页转换成干净的 Markdown，支持需要 JavaScript 渲染的动态页面，让 AI 读懂网页内容。',
    tags: ['网页', '爬虫', 'Markdown'],
    tools: [
      { name: 'fetch_url', description: '抓取网页并转换为 Markdown，自动去除广告和导航栏' },
      { name: 'extract_links', description: '提取页面中的所有链接及其标题' },
    ],
    creditsPerCall: 2,
    featured: true,
    version: '1.2.0',
    intro: intro(
      '网页阅读器帮你的 AI 助手“打开”网页。它会渲染页面、去掉广告和无关内容，只把正文以 Markdown 格式交给模型。',
      [
        '支持动态渲染页面（SPA）',
        '自动去除广告、导航栏、页脚',
        '保留标题层级、表格和代码块',
        '单次最多读取 5 万字',
      ],
      ['让 AI 总结一篇长文章', '对比多个商品页面的参数', '收集资料写调研报告'],
      '帮我读一下这篇文章并总结成 5 个要点：https://example.com/article',
    ),
  },
  {
    name: '天气查询',
    slug: 'weather',
    category: 'life',
    summary: '全国 3000+ 城市的实时天气、空气质量和未来 7 天预报，数据每 10 分钟更新一次。',
    tags: ['天气', '免费'],
    tools: [
      { name: 'get_weather', description: '查询城市实时天气和空气质量' },
      { name: 'get_forecast', description: '查询未来 7 天逐日天气预报' },
    ],
    creditsPerCall: 0,
    version: '1.0.3',
    intro: intro(
      '免费的天气查询服务，适合在出行规划、日程安排类对话中使用。',
      ['覆盖全国 3000+ 城市和区县', '包含温度、降水、风力、AQI', '7 天逐日预报'],
      ['出差前查目的地天气', '周末出游规划', '每日早报自动附上天气'],
      '明天杭州会下雨吗？需要带伞吗？',
    ),
  },
  {
    name: 'PDF 解析',
    slug: 'pdf-parser',
    category: 'productivity',
    summary: '把 PDF、Word、扫描件转换成结构化文本，精准提取表格，支持中英文 OCR 识别。',
    tags: ['文档', 'PDF', 'OCR'],
    tools: [
      { name: 'parse_document', description: '解析文档为 Markdown，保留标题和段落结构' },
      { name: 'extract_tables', description: '提取文档中的表格，输出为 CSV 或 Markdown 表格' },
    ],
    creditsPerCall: 5,
    featured: true,
    version: '2.0.1',
    intro: intro(
      '专为中文文档优化的解析服务，扫描件、双栏排版、复杂表格都能处理。',
      [
        '支持 PDF、DOCX、图片',
        '中英文 OCR，识别率 98%+',
        '复杂表格还原为结构化数据',
        '单个文件最大 50 MB',
      ],
      ['合同条款快速审阅', '财报数据提取', '论文资料整理'],
      '把这份财报 PDF 里的利润表提取成表格：https://example.com/report.pdf',
    ),
  },
  {
    name: '小红书文案',
    slug: 'xhs-copywriter',
    category: 'content',
    summary: '按小红书爆款风格生成标题和正文，自动配 emoji 和话题标签，支持多种人设语气。',
    tags: ['小红书', '文案', '营销'],
    tools: [
      { name: 'generate_note', description: '根据产品信息生成完整笔记（标题 + 正文 + 话题）' },
      { name: 'suggest_titles', description: '一次生成 10 个不同风格的标题供挑选' },
    ],
    creditsPerCall: 3,
    version: '1.1.0',
    intro: intro(
      '基于大量爆款笔记总结的写作模板，让 AI 写出更像真人博主的小红书文案。',
      ['内置 20+ 种爆款标题公式', '自动添加 emoji 和话题标签', '可选闺蜜种草、专业测评等人设'],
      ['新品上市种草', '探店笔记', '个人品牌运营'],
      '帮我写一篇推荐这款保温杯的小红书笔记，语气像闺蜜分享',
    ),
  },
  {
    name: '快递查询',
    slug: 'express',
    category: 'life',
    summary:
      '输入单号即可查询物流轨迹，支持顺丰、京东、中通、圆通等 100+ 家快递公司，自动识别快递公司。',
    tags: ['快递', '物流'],
    tools: [{ name: 'track_package', description: '查询快递物流轨迹，自动识别快递公司' }],
    creditsPerCall: 1,
    version: '1.0.0',
    intro: intro(
      '不用再挨个打开快递 App，直接问 AI 你的包裹到哪了。',
      ['支持 100+ 家快递公司', '单号自动识别快递公司', '返回完整物流轨迹和预计送达时间'],
      ['网购包裹追踪', '电商客服查件', '批量核对发货状态'],
      '帮我查一下单号 SF1234567890 到哪了',
    ),
  },
  {
    name: '数据库助手',
    slug: 'sql-assistant',
    category: 'dev',
    summary: '用自然语言查询 MySQL / PostgreSQL，自动理解表结构并生成只读 SQL，结果以表格返回。',
    tags: ['数据库', 'SQL', '开发'],
    tools: [
      { name: 'list_tables', description: '列出数据库中的表和字段说明' },
      { name: 'run_query', description: '执行只读 SQL 查询并返回结果' },
    ],
    creditsPerCall: 4,
    version: '0.9.2',
    intro: intro(
      '让不会写 SQL 的同事也能自己查数据。所有查询都在只读模式下执行，不会修改你的数据。',
      ['支持 MySQL 5.7+ / PostgreSQL 12+', '强制只读，自动拦截写操作', '大结果集自动分页'],
      ['运营同学自助查数据', '开发调试时快速看数据', '生成周报数据'],
      '上周每天新注册用户数是多少？按天列出来',
    ),
  },
  {
    name: '汇率换算',
    slug: 'exchange-rate',
    category: 'life',
    summary: '160+ 种货币的实时汇率和历史汇率查询，支持金额换算，适合跨境电商和出境旅行。',
    tags: ['汇率', '金融', '免费'],
    tools: [
      { name: 'convert_currency', description: '按实时汇率换算金额' },
      { name: 'get_history', description: '查询某个货币对的历史汇率走势' },
    ],
    creditsPerCall: 0,
    version: '1.0.0',
    intro: intro(
      '免费的汇率查询服务，数据来自多家银行和交易所的公开报价。',
      ['覆盖 160+ 种货币', '实时汇率，每分钟更新', '支持近 5 年历史汇率'],
      ['跨境电商定价', '出境旅行预算', '外币账单核对'],
      '1000 美元现在能换多少人民币？',
    ),
  },
  {
    name: 'AI 绘图',
    slug: 'image-gen',
    category: 'content',
    summary: '在对话里直接生成图片，支持写实、插画、国风等多种风格，生成后返回可下载的图片链接。',
    tags: ['绘画', '图片', 'AIGC'],
    tools: [
      { name: 'generate_image', description: '根据描述生成图片，可指定风格和尺寸' },
      { name: 'upscale_image', description: '把图片放大到 4 倍分辨率' },
    ],
    creditsPerCall: 10,
    featured: true,
    version: '1.3.0',
    intro: intro(
      '让不支持画图的 AI 客户端也能画图。描述越具体，效果越好。',
      ['10+ 种预设风格', '支持 1:1、16:9、9:16 等尺寸', '图片链接保存 7 天'],
      ['公众号配图', '电商主图草稿', '头像和壁纸'],
      '画一张国风插画：月下的江南小镇，有乌篷船',
    ),
  },
  {
    name: '企业信息查询',
    slug: 'company-info',
    category: 'data',
    summary: '查询企业工商信息、股东结构、经营风险和对外投资，数据来自公开的工商登记信息。',
    tags: ['企业', '工商', '尽调'],
    tools: [
      { name: 'search_company', description: '按名称或统一社会信用代码搜索企业' },
      { name: 'get_company_detail', description: '获取企业工商详情、股东和风险信息' },
    ],
    creditsPerCall: 8,
    version: '1.0.1',
    intro: intro(
      '合作前快速了解对方公司的基本情况。',
      ['覆盖全国 2 亿+ 市场主体', '工商、股东、变更记录一次查全', '经营异常、司法风险提示'],
      ['签合同前查对方资质', '销售线索调研', '投资尽调初筛'],
      '帮我查一下“某某科技有限公司”的注册资本和股东',
    ),
  },
  {
    name: '文档翻译',
    slug: 'translator',
    category: 'productivity',
    summary: '中英日韩等 30+ 语言互译，保留 Markdown 格式和专业术语，适合翻译技术文档和长文。',
    tags: ['翻译', '多语言'],
    tools: [{ name: 'translate_text', description: '翻译文本，保留原有格式' }],
    creditsPerCall: 1,
    version: '1.0.0',
    intro: intro(
      '专门针对长文和技术文档优化的翻译服务。',
      ['支持 30+ 种语言', '保留 Markdown、代码块格式', '可上传自定义术语表'],
      ['翻译英文技术文档', '外贸邮件往来', '多语言产品说明'],
      '把这段 README 翻译成中文，代码块不要动',
    ),
  },
]

type SeedTool = {
  name: string
  slug: string
  category: string
  summary: string
  tags: string[]
  creditsPerUse: number
  url: string
  badge?: 'new' | 'hot' | 'beta'
  featured?: boolean
  intro: string
}

export const aiTools: SeedTool[] = [
  {
    name: 'AI 音乐生成',
    slug: 'ai-music',
    category: 'audio',
    summary: '输入歌词或一句描述，一键生成带人声的完整歌曲，支持流行、民谣、说唱、古风等风格。',
    tags: ['音乐', '作曲', '人声'],
    creditsPerUse: 20,
    url: 'https://music.example.com',
    badge: 'hot',
    featured: true,
    intro: intro(
      '不会作曲也能写歌。描述你想要的感觉，或者直接贴上歌词，几十秒就能听到成品。',
      ['支持 20+ 种音乐风格', '可生成纯音乐或带人声歌曲', '单首最长 4 分钟', '支持下载 MP3 / WAV'],
      ['短视频背景音乐', '生日祝福歌', '品牌宣传曲小样'],
      '一首轻快的夏日民谣，讲的是和朋友去海边',
    ),
  },
  {
    name: 'AI 配音',
    slug: 'ai-voice',
    category: 'audio',
    summary: '文字一键转成自然的语音，100+ 种中文音色，支持情感和语速调节，适合短视频和有声书。',
    tags: ['配音', '语音合成'],
    creditsPerUse: 5,
    url: 'https://voice.example.com',
    badge: 'new',
    intro: intro(
      '真人级别的语音合成，告别机器人腔。',
      ['100+ 种音色，含方言', '可调情感、语速、停顿', '支持长文本分段合成'],
      ['短视频旁白', '有声书录制', '课程讲解'],
      '用温柔的女声读一段睡前故事',
    ),
  },
  {
    name: 'AI 绘画',
    slug: 'ai-painting',
    category: 'image',
    summary: '输入描述生成高清图片，内置海报、头像、插画等模板，支持以图生图和局部重绘。',
    tags: ['绘画', '设计'],
    creditsPerUse: 10,
    url: 'https://paint.example.com',
    featured: true,
    intro: intro(
      '面向普通用户的 AI 绘画工具，模板开箱即用。',
      ['50+ 场景模板', '以图生图、局部重绘', '最高 4K 分辨率'],
      ['社交媒体配图', '电商海报', '个人头像'],
      '赛博朋克风格的猫咪头像',
    ),
  },
  {
    name: 'AI 抠图',
    slug: 'ai-cutout',
    category: 'image',
    summary: '上传图片自动去除背景，发丝级精细抠图，支持批量处理和一键换底色。',
    tags: ['抠图', '去背景'],
    creditsPerUse: 2,
    url: 'https://cutout.example.com',
    intro: intro(
      '3 秒完成抠图，边缘自然。',
      ['发丝级边缘处理', '一次最多 50 张批量处理', '支持换纯色或自定义背景'],
      ['证件照换底色', '电商白底图', '设计素材准备'],
      '上传商品照片，一键换成白底',
    ),
  },
  {
    name: 'AI 写作助手',
    slug: 'ai-writer',
    category: 'text',
    summary: '周报、公文、营销文案、小说续写，选好模板填几个关键词，几秒生成初稿。',
    tags: ['写作', '文案'],
    creditsPerUse: 3,
    url: 'https://writer.example.com',
    badge: 'beta',
    intro: intro(
      '覆盖工作和生活中常见写作场景的 AI 助手。',
      ['100+ 写作模板', '支持改写、扩写、缩写、润色', '可导出 Word'],
      ['写周报和总结', '活动策划方案', '朋友圈文案'],
      '帮我写一份本周工作周报，主要做了三件事……',
    ),
  },
  {
    name: 'AI 视频字幕',
    slug: 'ai-subtitle',
    category: 'video',
    summary: '上传视频自动识别语音生成字幕，支持中英双语字幕和 SRT 导出，识别准确率 97%+。',
    tags: ['字幕', '语音识别', '视频'],
    creditsPerUse: 8,
    url: 'https://subtitle.example.com',
    intro: intro(
      '剪辑视频最费时间的加字幕环节，交给 AI。',
      ['中文识别准确率 97%+', '自动断句和时间轴对齐', '一键生成双语字幕', '导出 SRT / ASS'],
      ['短视频字幕', '课程视频', '会议录像整理'],
      '上传一段 10 分钟的访谈视频，生成中英双语字幕',
    ),
  },
]
