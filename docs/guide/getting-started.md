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

生成 `.agile/` 三个配置、五个抽屉骨架、git 仓库。此时整个工作区是一个**空的单仓 git 仓库**。

## 3. 登记公司规范仓库（唯一的外部 submodule）

```bash
agile repo add tech-specs git@gitlab.corp:specs/tech-specs.git
agile sync
```

sync 会拉取 tech-specs 并挂载为 submodule。规范仓库后续更新时，`agile sync`（或创建 worktree 时的自动 sync）会拉到最新；需要锁定版本时 `agile repo pin tech-specs`。

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
agile worktree create feature/STO-001     # 创建隔离开发环境（自动 sync）
cd .worktrees/feature__STO-001

# ... 开发（多项目在同一 worktree 内，前后端一起改）...

agile foreach 'npm test'                  # 遍历全部项目跑测试
git add -A && git commit -m "feat(STO-001): ..."

agile worktree remove feature/STO-001     # 清理
```

推送 feature 分支、发 PR、merge——**一个 PR 包含前后端代码与过程文档**，天然原子。

## 7. 安装 Claude Code 插件（SDD/TDD 流程）

```bash
agile plugin install agile
```

重启 Claude Code 会话后可用 `/agile:help` 查看全部命令，按 [插件概览](/plugin/overview) 的流程主线开发。团队分工（产品/负责人/后端/前端/运维）与需求全生命周期的协作规范见[团队协作 SOP](/guide/sop)。

## 8. 健康检查与排错

```bash
agile doctor                # 配置/权限/漂移全面检查
agile doctor --fix          # 自动修复可修复项
agile status                # 外部仓库状态
```

错误码含义见 [故障排查](/guide/troubleshooting)。

## 9. 升级

```bash
agile update                # 更新 CLI（npm），--plugin 更新插件，--all 全部
agile update --plugin       # 重装插件（拉市场最新）
```

## 完整流程图

```
npm i -g fcc-agile-cli
  → agile init workspace
  → agile repo add tech-specs <url> → agile sync
  → agile template list → agile init project <name> --template <t>
  → git commit（首个提交）
  → 日常：worktree create → 开发 → foreach 测试 → commit → PR
  → agile plugin install agile（可选，进入 SDD/TDD 流程）
  → agile doctor（例行体检）
```
