# 积分接口（给 MCP 网关和 AI 工具后端用）

用户在 MCP 客户端里填的是自己的接入密钥（`sk-` 开头，用户中心可以看到）。你的 MCP 服务或 AI 工具后端收到请求后，拿这个密钥来门户站扣积分。

这些接口只给你自己的服务端调用，不要写进网页或客户端代码。

## 鉴权

每个请求都要带请求头 `X-Internal-Secret`，值和门户站环境变量 `INTERNAL_API_SECRET` 一样。

```bash
# 生成一个密钥，写进门户站的 .env，同时配置到你的网关
openssl rand -hex 32
```

没有设置 `INTERNAL_API_SECRET` 时，接口一律返回 `503`。

## 推荐的调用流程

1. 收到用户请求，从 `Authorization: Bearer sk-...` 里取出接入密钥
2. 调 `consume` 先扣费，`requestId` 用这次调用的唯一 ID
3. 扣费成功再真正执行工具；返回 `402` 就告诉用户积分不足，引导去兑换卡密
4. 工具执行失败，调 `refund` 用同一个 `requestId` 退款

同一个 `requestId` 重试多次只会扣一次、退一次，网络超时可以放心重试。

## POST /api/credits/verify

校验密钥、查余额。带上 `product` 时顺便返回价格和余额够不够。

```bash
curl -X POST https://你的域名/api/credits/verify \
  -H "X-Internal-Secret: $INTERNAL_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"apiKey": "sk-用户的密钥", "product": "mcp/pdf-parser"}'
```

```json
{ "ok": true, "userId": 2, "balance": 120, "price": 5, "enough": true }
```

## POST /api/credits/consume

扣费。

| 字段 | 必填 | 说明 |
|---|---|---|
| `apiKey` | 是 | 用户的接入密钥 |
| `product` | 是 | `mcp/<英文短名>` 或 `tool/<英文短名>`，只认已上架的产品 |
| `requestId` | 是 | 这次调用的唯一 ID，1～128 位字母、数字或 `. _ : -` |
| `amount` | 否 | 扣多少积分；不填按后台设置的价格（每次调用 / 每次使用消耗的积分） |
| `note` | 否 | 用户在积分记录里看到的说明，默认“使用 产品名” |

```bash
curl -X POST https://你的域名/api/credits/consume \
  -H "X-Internal-Secret: $INTERNAL_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"apiKey": "sk-用户的密钥", "product": "mcp/pdf-parser", "requestId": "call-7f3a"}'
```

成功：

```json
{ "ok": true, "charged": 5, "balance": 115, "duplicate": false }
```

`duplicate: true` 表示这个 `requestId` 之前已经扣过，这次没有重复扣。免费产品返回 `charged: 0`，不记流水。

积分不足（HTTP 402）：

```json
{ "ok": false, "error": "insufficient_credits", "message": "积分不足：需要 5，余额 2", "balance": 2, "required": 5 }
```

## POST /api/credits/refund

退回某次扣费，每个 `requestId` 只能退一次。

```bash
curl -X POST https://你的域名/api/credits/refund \
  -H "X-Internal-Secret: $INTERNAL_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"requestId": "call-7f3a", "reason": "上游超时"}'
```

```json
{ "ok": true, "refunded": 5, "balance": 120, "duplicate": false }
```

## 错误码

| HTTP | `error` | 说明 |
|---|---|---|
| 400 | `bad_request` | 请求体不是 JSON，或字段不合法 |
| 401 | `unauthorized` | `X-Internal-Secret` 不对 |
| 401 | `invalid_api_key` | 用户的接入密钥无效（可能被用户重新生成了） |
| 402 | `insufficient_credits` | 积分不足 |
| 404 | `product_not_found` | 产品不存在或已下架 |
| 404 | `not_found` | 退款时找不到这个 `requestId` 的扣费记录 |
| 503 | `not_configured` | 门户站没有设置 `INTERNAL_API_SECRET` |

## 余额是怎么保证不出错的

- 余额只通过积分流水变动：每次加减都在一个数据库事务里“带条件地改余额 + 写流水”，余额不够时不改。
- 流水号唯一：扣费用 `consume:<requestId>`，退款用 `refund:<requestId>`，兑换用卡密编号，注册赠送用用户编号，同一个流水号只会记一次账。
- 后台不能直接改用户余额，只能新建一条“后台调整”流水。
- 相关代码：`src/lib/credits.ts`，测试：`tests/int/credits.int.spec.ts`。
