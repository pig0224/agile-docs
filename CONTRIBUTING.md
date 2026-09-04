# 贡献指南（CONTRIBUTING）

感谢关注 agile-docs（fcc-agile 生态文档站）！欢迎修正错误、补充示例、完善指南。

## 环境搭建

```bash
git clone git@github.com:pig0224/agile-docs.git
cd agile-docs
pnpm install
pnpm dev            # 本地预览（热更新）
pnpm docs:build     # 构建校验（死链/语法失败即红）
```

## 文档结构

`docs/guide/`（CLI）、`docs/plugin/`（插件）、`docs/templates/`（模板）；导航与侧边栏在 `docs/.vitepress/config.ts`。

## 提交流程

1. 分支开发（`docs/xxx`），push 后开 PR 指向 main
2. CI 构建校验通过 + 维护者 review 后合并
3. **merge 即上线**：https://pig0224.github.io/agile-docs/ 自动更新

## 内容约定

- **准确性高于一切**：命令参数对照 `../agile-cli/src/commands/*.ts`；MCP 参数对照 `../agile-cli/src/mcp/server.ts`；插件细节对照 `../agile-plugins/plugins/agile/`——改文档先看代码
- 新增页面必须同步 `docs/.vitepress/config.ts` 的 sidebar
- 品牌词规范：FCC-Agile / Agile / FCC；命令语法保持小写（`agile sync`、`/agile:prd`）
- 全站中文

## 报告问题

使用 [issue 模板](https://github.com/pig0224/agile-docs/issues/new/choose)。行为准则见 [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)。
