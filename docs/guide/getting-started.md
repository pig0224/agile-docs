# 快速上手

从零搭建一个 FCC-Agile 工作区，走完「初始化 → 同步 → 建项目 → 开发 → 插件」全流程。

## 前置条件

- Node.js ≥ 24、git ≥ 2.30
- （可选）[Claude Code](https://code.claude.com/docs)——使用 /agile:xxx 插件命令时需要

## 1. 安装 CLI

```bash
npm install -g fcc-agile-cli
```

> 插件与模板由各自 git 仓库分发（`agile-plugins` / `agile-templates`），无需额外安装。

## 2. 初始化工作区

```bash
mkdir my-workspace && cd my-workspace
agile init workspace --name my-workspace
```

生成唯一配置 `.agile/settings.json`、五个抽屉骨架、git 仓库、`.gitignore`（外部资源不入库）与 `.gitattributes`。此时整个工作区是一个**空的单仓 git 仓库**。

## 3. 登记外部资源并同步

```bash
agile config set tech-specs git@gitlab.corp:specs/tech-specs.git
agile config set biz-tech-docs git@gitlab.corp:kb/tech-docs.git   # 可选：多 workspace 团队共享知识库
agile sync
```

`agile sync` 依次处理四步：tech-specs 拉取 → biz-tech-docs 拉取 → 模板缓存刷新 → 插件按声明安装。公司级规范 tech-specs 必选；团队知识库 biz-tech-docs 可选——团队有多个 workspace 时共享同一份知识库，保持单一事实源。

外部目录**不入库**（写入 `.gitignore`），各自是独立 git 仓库，由 sync clone/快进拉取——它们是**可写工作区**，sync 本地优先：有未提交改动就跳过绝不覆盖，分叉报人工。仓库后续更新时再次 `agile sync`（或创建 worktree 时的自动 sync）即可拉到最新。

```bash
agile sync --dry-run    # 先看计划（幂等：再跑一次全是 skipped）
agile config get tech-specs   # 查看仓库地址
agile config list             # settings.json 全量
```

## 4. 创建项目（模板脚手架）

```bash
agile template list                              # 查看可用模板
agile init project order-service --template go-service
agile init project frontend-web --template vue3-vite
```

项目直接落在 `projects/` 下（workspace 单仓内普通目录），已 `git add`，commit 时机由你决定。团队私有模板见[模板概览](/templates/overview)。

## 5. 提交首个 commit

```bash
git add -A
git commit -m "chore: init workspace with tech-specs & projects"
```

::: warning
必须完成首次提交后 `agile worktree create` 才可用（worktree 基于已有 commit 创建）。
:::

## 6. 日常开发循环

```bash
agile worktree create feature/STO-001     # 创建隔离开发环境（创建前后各自动 sync 一次）
cd .worktrees/feature__STO-001

# ... 开发（多项目在同一 worktree 内，前后端一起改；测试进各项目目录执行）...
cd projects/order-service && npm test

git add -A && git commit -m "feat(STO-001): ..."

agile worktree remove feature/STO-001     # 清理
```

推送 feature 分支、发 PR、merge——**一个 PR 包含前后端代码与过程文档**，天然原子。

## 7. 安装 Claude Code 插件（SDD/TDD 流程）

```bash
agile plugin install agile
agile plugin ls                           # 声明 × 本机实况对照
```

安装即写入 `.agile/settings.json` 的 `plugins.dependencies` 依赖声明并随 workspace 提交——其他成员 clone 后 `agile sync` 一条命令补齐（缺的装、绝不卸载）。

重启 Claude Code 会话后可用 `/agile:help` 查看全部命令，按 [插件概览](/plugin/overview) 的流程主线开发。团队分工（产品/负责人/后端/前端/运维）与需求全生命周期的协作规范见[团队协作 SOP](/guide/sop)。

## 8. 排错

同步计划有 `failed`/`warn`？先 `agile sync --dry-run` 看计划，再到 [故障排查](/guide/troubleshooting) 对照处置（外部目录 dirty 跳过、分叉人工、切换仓库地址用 `agile config set` 覆盖 url）。

## 9. 升级

```bash
agile update                # 更新 CLI（npm）
agile plugin update         # 更新插件（刷新市场 → 强制重装，重启会话生效）
```

## 完整流程图

```
npm i -g fcc-agile-cli
  → agile init workspace
  → agile config set tech-specs <url> → agile sync（再跑一次验证幂等）
  → agile template list → agile init project <name> --template <t>
  → git commit（首个提交）
  → 日常：worktree create → 开发 → 各项目跑测试 → commit → PR
  → agile plugin install agile（可选，进入 SDD/TDD 流程）
  → agile sync（例行收敛外部资源与插件）
```
