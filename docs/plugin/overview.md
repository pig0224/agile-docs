# 插件概览与流程

Agile 插件是 [Claude Code](https://code.claude.com/docs) 插件（市场仓库 [agile-plugins](https://github.com/pig0224/agile-plugins)），以 **SDD（先设计后开发）/ TDD（测试驱动开发）** 方法论组织团队研发流程：

- **13 个 `/agile:xxx` 斜杠命令**——人机入口（[命令详解](/plugin/commands)）
- **7 个角色 subagent**——具体执行（[角色说明](/plugin/roles)）
- **1 个方法论 skill**——共享知识（命令按需加载）

## 安装

在 Agile workspace 内：

```bash
agile plugin install agile
```

（或在 Claude Code 中 `claude plugin marketplace add <市场地址>` + `claude plugin install agile@fcc`。私有市场见[插件发布](/plugin/publishing)。）

安装后重启 Claude Code 会话，`/agile:help` 查看全部命令。

## SDD/TDD 流程主线

```
需求输入
  → /agile:prd           PRD / AC / 功能树 / 菜单树（写入抽屉三）
  → /agile:sync-req      需求产物同步到 process-docs/STO-xxx（创建任务目录）
  → /agile:architect     技术设计 design.md（SDD：先设计后开发）
  → /agile:gen-test      Stage 1：测试案例文档（先于实现）
  → /agile:backend | /agile:frontend    TDD 开发（Red → Green → Refactor）
  → /agile:run-test      Stage 2：测试执行与验收报告
  → review.md / release.md 归档闭环
```

辅助命令随时可用：`/agile:fix-bug`（任意阶段修缺陷，轻量通道标准入口）、`/agile:add-task`（补充遗漏任务）、`/agile:ui`（组件库工作）、`/agile:knowledge`（知识库建设与沉淀）、`/agile:feedback`（反馈报告）、`/agile:help`（总览）。

前后端并行开发时各写各的角色文件（implementation-be.md / implementation-fe.md），git 合并零冲突——团队分工与全生命周期协作见[团队协作 SOP](/guide/sop)。

## 两条红线

写进 skill 与全部角色 agent，任何命令不得绕过：

1. **SDD 红线**：没有 `design.md` 不进入开发——architect/backend/frontend 命令都有前置校验，缺失即停止
2. **TDD 红线**：没有失败测试不写实现——每任务先写失败测试（Red），最小实现转绿（Green），重构保持绿色（Refactor），循环记录登记进角色文件（implementation-be.md / implementation-fe.md）

轻量通道豁免：STO 轻量 / BUG-xxx / OPS-xxx（判定与填写规范见[团队协作 SOP](/guide/sop)）下 SDD 红线放宽——design.md 可由根因分析（BUG）或三五行方案简述替代；TDD 红线**不豁免**。

**分工模式（硬规则，不得反转）**：命令（主会话）负责前置校验、Task 委派与复核汇报，实施一律委派角色 subagent——禁止以「subagent 不可靠」等理由改由主会话直接实施、subagent 验收；subagent 拿不到主会话上下文，委派时必须显式传入任务编号、约束与验收要求，产出经主会话复核后才汇报。

## 与 CLI / MCP 的协作

插件命令不手搓 git 和文件系统，统一经 CLI/MCP：

- Bash 执行 `agile status / worktree create / doctor / template list`
- MCP 工具：`agile_task_create`（创建任务目录，**无 CLI 命令**）、`agile_sync`（默认 dry-run）、`agile_status` 等

抽屉路径不硬编码——命令先读 `.agile/workspace.yaml` 的 `paths` 段。

## 典型一周

| 时点 | 动作 |
|---|---|
| 需求评审后 | `/agile:prd STO-001 需求描述` → `/agile:sync-req STO-001` |
| 设计阶段 | `/agile:architect STO-001` |
| 测试先行 | `/agile:gen-test STO-001` |
| 开发 | `agile worktree create feature/STO-001` → `/agile:backend STO-001` + `/agile:frontend STO-001` |
| 提测 | `/agile:run-test STO-001`（不通过 → `/agile:fix-bug STO-001 问题描述`） |
| 收尾 | 填 review/release.md，worktree remove，PR 合并 |
