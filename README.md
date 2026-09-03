# Agile-Docs

[![CI](https://github.com/pig0224/agile-docs/actions/workflows/ci.yml/badge.svg)](https://github.com/pig0224/agile-docs/actions/workflows/ci.yml)
[![Deploy Pages](https://github.com/pig0224/agile-docs/actions/workflows/pages.yml/badge.svg)](https://github.com/pig0224/agile-docs/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**FCC-Agile 生态文档站**（VitePress，中文）：CLI 命令参考、MCP 工具、使用流程、插件角色与开发指南、模板开发指南。

在线阅读：**https://pig0224.github.io/agile-docs/**

覆盖的三个兄弟仓库：

| 仓库 | 职责 |
|---|---|
| [agile-cli](https://github.com/pig0224/agile-cli) | 工作区 CLI（npm: `fcc-agile-cli`，bin: `agile`） |
| [agile-plugins](https://github.com/pig0224/agile-plugins) | Claude Code 插件市场（SDD/TDD） |
| [agile-templates](https://github.com/pig0224/agile-templates) | 项目模板注册中心 |

## 本地开发

```bash
pnpm install
pnpm dev            # 本地预览（热更新）
pnpm docs:build     # 构建校验（死链/语法失败即红，CI 同款）
pnpm docs:preview   # 预览构建产物
```

文档结构：`docs/guide/`（CLI）、`docs/plugin/`（插件）、`docs/templates/`（模板）；侧边栏与导航在 `docs/.vitepress/config.ts`。

## 发布

- **push main** → [pages.yml](./.github/workflows/pages.yml) 自动部署 GitHub Pages
- **`npm run release`**（[scripts/release.mjs](./scripts/release.mjs)）→ 质量门（docs:build）→ bump 版本 → tag → 触发 [release.yml](./.github/workflows/release.yml)（部署 Pages + GitHub Release 归档站点 zip）

```bash
npm run release -- patch          # 或 minor / major / x.y.z
```

> 一次性设置：仓库 Settings → Pages → Source 选 **GitHub Actions**。

## License

[MIT](./LICENSE) © FCC contributors
