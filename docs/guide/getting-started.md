# 快速上手

从零搭建 FCC-Agile 工作区，按「初始化 → 同步 → 建项目 → 开发 → 插件」的顺序完成全流程。

## 前置条件

- Node.js ≥ 24、git ≥ 2.30
- （可选）[Claude Code](https://code.claude.com/docs)——使用 /agile:xxx 插件命令时需要；仅使用 CLI 时可不安装

## 1. 安装 CLI

```bash
npm install -g fcc-agile-cli
```

> 插件与模板由 CLI 自动获取，无需额外安装。

## 2. 初始化工作区

```bash
mkdir my-workspace && cd my-workspace
agile init workspace --name my-workspace
```

初始化完成：得到统一配置 `.agile/settings.json`、工作区根 `CLAUDE.md`（导航地图：五类目录表 + 配置与清单指针 + 常用命令 + AI 会话须知，按团队实际增补后随仓库提交；已存在则不覆盖）与五个目录骨架（公司规范、技术知识库、产品知识库、项目代码、过程产物，详见[核心概念](/guide/concepts)）。

## 3. 登记外部资源并同步

```bash
agile config set tech-specs git@gitlab.corp:specs/tech-specs.git
agile config set biz-tech-docs git@gitlab.corp:kb/tech-docs.git   # 可选：多 workspace 团队共享知识库
agile sync
```

`agile sync` 依次处理四步：tech-specs 拉取 → biz-tech-docs 拉取 → 模板缓存刷新 → 插件按声明安装。公司级规范 tech-specs 必选；团队知识库 biz-tech-docs 可选——多 workspace 团队共享同一份知识库，一处维护、处处一致。

tech-specs 与 biz-tech-docs 目录由 CLI 自动维护：有更新时执行 `agile sync` 即拉取最新内容；目录内有未提交改动时 sync 跳过不覆盖，与远端分叉时暂停并提示人工处理。日常无需手动管理这两个目录。

```bash
agile sync --dry-run    # 预先查看执行计划（已同步步骤显示 skipped，属预期行为）
agile config get tech-specs   # 查看仓库地址
agile config list             # settings.json 全量
```

## 4. 创建项目

```bash
agile template list                                # 查看可用单例模板与组合模板（官方注册中心可能尚未登记模板）
agile init project --name order-service            # 空项目骨架（始终可用）
agile init project --template <模板名> --name <目录名>   # 从模板生成（需注册中心已登记对应模板）
```

项目生成于 `projects/<目录名>/`，即建即用。团队私有模板见[模板概览](/templates/overview)。

## 5. 提交首个 commit

```bash
git add -A
git commit -m "chore: init workspace with tech-specs & projects"
```

::: warning
创建 worktree 前需先完成至少一次提交（`agile worktree create` 依赖已有提交历史）。
:::

## 6. 日常开发循环

```bash
agile worktree create feat/STO-001     # 创建隔离开发环境（创建前后各自动 sync 一次）
cd .worktrees/feat__STO-001

# ... 在同一 worktree 内开发（多个项目同时修改；测试在各项目目录内执行）...
cd projects/order-service && npm test

git add -A && git commit -m "feat(STO-001): ..."

agile worktree remove feat/STO-001     # 清理
```

推送分支并发起 PR——前后端代码与过程文档在同一 PR 中，一并评审。

## 7. 安装 Claude Code 插件（SDD/TDD 流程）

```bash
agile plugin install agile
agile plugin ls                           # 声明 × 本机实况对照
```

安装后插件登记进 `.agile/settings.json` 并随工作区提交——其他成员执行一次 `agile sync` 即自动补装（只补缺失，不动已有）。

重启 Claude Code 会话后可用 `/agile:help` 查看全部命令，按 [插件概览](/plugin/overview) 的流程主线开发。团队分工（产品/负责人/后端/前端/运维）与需求全生命周期的协作规范见[团队协作 SOP](/guide/sop/)。

## 8. 排错

同步结果出现 `failed` / `warn` 时，先执行 `agile sync --dry-run` 查看计划，再到[故障排查](/guide/troubleshooting)对照处置（外部目录 dirty 时跳过、分叉报请人工处理、仓库地址切换使用 `agile config set` 覆盖 url）。

## 9. 升级

```bash
agile update                # 更新 CLI（npm）
agile plugin update         # 更新插件（刷新市场 → 强制重装，重启会话生效）
```

## 完整流程图

```
npm i -g fcc-agile-cli
  → agile init workspace
  → agile config set tech-specs <url> → agile sync（再次执行验证幂等）
  → agile template list → agile init project --template <t> [--name <目录>]
  → git commit（首个提交）
  → 日常：worktree create → 开发 → 各项目内执行测试 → commit → PR
  → agile plugin install agile（可选，进入 SDD/TDD 流程）
  → agile sync（例行收敛外部资源与插件）
```
