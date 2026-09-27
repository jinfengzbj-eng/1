# 第三方代码声明

## Mkdirs

前台界面（导航栏、页脚、首页布局、卡片、筛选、分页、详情页布局、登录卡片等）改编自 Mkdirs：

- 项目地址：https://github.com/MkThingsHQ/mkdirs
- 许可证：Apache License 2.0，全文见 [licenses/mkdirs-LICENSE](licenses/mkdirs-LICENSE)

改编内容：界面文字改为中文，数据来源从 Sanity 换成 Payload，登录从 Auth.js 换成 Payload 自带账号，去掉了 Stripe 付费、邮件订阅和 AI 提交，组件升级到 Tailwind CSS v4 / React 19。改编过的文件在开头注明了来源。

本项目不使用 Mkdirs 的名称或商标来标识自身。

## shadcn/ui

`src/components/ui/` 下的组件由 shadcn/ui 命令行生成（MIT 许可证）：https://ui.shadcn.com
