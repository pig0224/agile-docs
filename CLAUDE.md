# CLAUDE.md — agile-docs 仓库导航

本仓库 = FCC-Agile 生态文档站（VitePress，中文），部署于 GitHub Pages。**修改文档前先读本文。**

## 协作红线（优先级最高）

1. **绝对不允许执行 `git add`**：哪些变更进入提交，由人工审阅决定。完成修改后，列出变更文件清单与建议的 commit message，等待人工 add。
2. **人工 add 完成后，可汇总执行 `git commit`**：但 commit 前必须先 `git status` 检查——若仍有本次变更相关的未暂存文件，停下来提醒人工补充 add（不得自行 add）；确认全部已暂存后才执行 commit。
3. **不允许执行 `git push`**（含 tag 推送）：推送一律人工处理。本仓无发版动作（无 release workflow/脚本），发布 = merge 到 main 由 pages.yml 自动完成。
4. 只读 git 命令（status / log / diff / blame / fetch）不受限制。

## 常用命令

```bash
pnpm install
pnpm dev            # 本地预览（热更新）
pnpm docs:build     # 构建（死链/语法失败即红——提交前必须过）
pnpm docs:preview   # 预览构建产物
```

## 结构

```
docs/
├── .vitepress/config.ts   # 站点配置：nav、sidebar、中文 UI、本地搜索
├── index.md               # 首页（hero + features）
├── guide/                 # CLI 板块：getting-started / concepts / commands / mcp / troubleshooting
├── plugin/                # 插件板块：overview / commands / roles / dev-guide / publishing
└── templates/             # 模板板块：overview / dev-guide / publishing
.github/workflows/         # ci（构建校验）、pages（main 推送部署——发布即 merge 到 main）
```

## 关键约定

- **内容准确性高于一切**：命令参数表从 `../agile-cli/src/commands/*.ts` 的 commander 定义核对；MCP 参数从 `src/mcp/server.ts` 的 zod schema 核对；插件命令细节从 `../agile-plugins/plugins/agile/` 核对——改文档先看代码，不凭记忆。
- **新增页面必须同步 config.ts 的 sidebar**，否则构建不报错但不可导航。
- 链接用 VitePress 相对路径（`/guide/xxx`）；`base: '/agile-docs/'` 已配置，无需手写前缀。
- 全站中文；代码块内命令输出保持原样。
- 兄弟仓库代码变更（命令/参数/工具增删）时，同步更新 `guide/commands.md` 与 `guide/mcp.md`——这是文档站最容易腐烂的两页。
- **发布 = merge 到 main**：无 tag、无版本号、无 Release 归档；旧状态靠 git 历史（checkout 任意 commit 可重建）。
