# CLAUDE.md — agile-docs 仓库导航

本仓库 = FCC-Agile 生态文档站（VitePress，中文），部署于 GitHub Pages。**修改文档前先读本文。**

## 常用命令

```bash
pnpm install
pnpm dev            # 本地预览（热更新）
pnpm docs:build     # 构建（死链/语法失败即红——提交前必须过）
pnpm docs:preview   # 预览构建产物
npm run release -- patch --dry-run   # 发版演练（正式：npm run release，tag 触发部署+Release）
```

## 结构

```
docs/
├── .vitepress/config.ts   # 站点配置：nav、sidebar、中文 UI、本地搜索
├── index.md               # 首页（hero + features）
├── guide/                 # CLI 板块：getting-started / concepts / commands / mcp / troubleshooting
├── plugin/                # 插件板块：overview / commands / roles / dev-guide / publishing
└── templates/             # 模板板块：overview / dev-guide / publishing
scripts/release.mjs        # 发版脚本（质量门 → bump → tag → 轮询 workflow）
.github/workflows/         # ci（构建校验）、pages（main 推送部署）、release（tag：部署+归档）
```

## 关键约定

- **内容准确性高于一切**：命令参数表从 `../agile-cli/src/commands/*.ts` 的 commander 定义核对；MCP 参数从 `src/mcp/server.ts` 的 zod schema 核对；插件命令细节从 `../agile-plugins/plugins/agile/` 核对——改文档先看代码，不凭记忆。
- **新增页面必须同步 config.ts 的 sidebar**，否则构建不报错但不可导航。
- 链接用 VitePress 相对路径（`/guide/xxx`）；`base: '/agile-docs/'` 已配置，无需手写前缀。
- 全站中文；代码块内命令输出保持原样。
- 兄弟仓库代码变更（命令/参数/工具增删）时，同步更新 `guide/commands.md` 与 `guide/mcp.md`——这是文档站最容易腐烂的两页。
- 发版：`npm run release`（tag → release.yml 部署 Pages + GitHub Release 归档）；push main 自动部署。
