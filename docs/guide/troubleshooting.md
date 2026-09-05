# 故障排查

## 常见问题

### tech-specs / biz-tech-docs 目录为什么不入库？

这两个抽屉是**外部资源**：公司级规范（跨团队共享、团队无写权限）与团队知识库（多 workspace 共享单一事实源）。它们各自是独立 git 仓库，目录写入 `.gitignore` 不进 workspace 版本管理，由 `agile sync` clone / 快进拉取。

原因：

- 这两个目录是**可写工作区**（如 `/agile:knowledge` 直接落盘），内容演进与 workspace 代码节奏不同
- 不入库就没有 submodule 指针滚动，跨仓协作零 PR 负担

`init workspace` 已自动把 `.worktrees/`、`tech-specs/`、`biz-tech-docs/` 追加进 `.gitignore`，无需手工维护。

### sync 提示「存在未提交改动，跳过更新」是什么意思？

外部目录是可写工作区，**本地改动优先**：sync 发现目录 dirty 就跳过该仓库（状态 `warn`），**绝不覆盖你的未提交内容**。想拉取远端最新，先自行提交或 stash：

```bash
cd tech-specs
git status                          # 确认本地改动
git add -A && git commit            # 提交（推不推由你）
cd ..
agile sync                          # 重新快进拉取
```

### sync 报「无法快进到远端，需人工处理」

本地与远端分叉（sync 只做 `--ff-only` 快进，分叉即停下，不会自动 reset 丢提交）。进入目录看清分叉内容后自行决定：

```bash
cd tech-specs
git fetch origin
git merge --ff-only origin/main     # 或 rebase / merge 后推送，自行判断
```

处理完再 `agile sync` 确认恢复 `done`。**绝不 force push**。

### 如何切换 / 移除外部仓库地址？

`config set` 覆盖 url 即可（写入 `.agile/settings.json` 对应键），下次 `agile sync` 生效：

```bash
agile config set tech-specs git@gitlab.corp:new-path/tech-specs.git   # 换地址
agile config unset biz-tech-docs                                      # 移除登记（sync 将提示跳过）
agile config list                                                     # 查看全量配置
```

若目录里已 clone 了旧仓库且要换源，删除该目录（或清成仅剩 README 骨架）后 `agile sync` 会按新地址重新 clone。插件市场与模板源同理：`config set plugin-repo / template-repo` 换私有源，`config unset` 恢复内置官方源。

### sync 报「目录已存在且非空且不是 git 仓库」

目标目录有非骨架内容，sync 不会动它。`init workspace` 生成的抽屉骨架（仅 README.md）会自动让位；其他内容需你确认后手工清理再 sync。

### worktree create 报「workspace 仓库还没有首次提交」

worktree 基于已有 commit 创建。先完成初始提交：

```bash
git add -A && git commit -m "chore: init workspace"
```

### init project 报「目录已存在」或模板不存在

- 目录已存在：换项目名，或确认旧目录可删除
- 模板不存在：`agile template list` 查可用模板；模板源不对就改 `.agile/settings.json` 的 `templates.registry`
- 注册中心一致性问题：`agile template list` 会逐条输出 issues 并以退出码 1 结束，按提示修复模板仓库

### template list 提示「使用本地缓存」（stale）

模板源失联时降级使用缓存。网络恢复后 `agile template update` 强制刷新。

### 插件安装失败 / /agile:xxx 命令不可用

1. `agile plugin ls` 看依赖声明 × 本机实况对照（✓ 已装 / ○ 未装 / ✖ 市场冲突 / · 未声明）
2. 安装输出里的失败原因（市场地址不可达/权限）；失败时 CLI 会给出手动命令
3. 手动安装定位：`claude plugin marketplace add <市场地址>` + `claude plugin install agile@fcc`
4. 命令文件修改后需**重启 Claude Code 会话**才生效

### Windows 下「Access is denied」删不掉目录

通常是进程占用（编辑器索引、esbuild 常驻进程、vitest watcher）。关闭占用进程后重试；`.worktrees/`、`node_modules` 是高发区。

---

仍未解决？运行 `agile sync --dry-run` 与 `agile config list`，把输出附到 [issue](https://github.com/pig0224/agile-cli/issues)。
