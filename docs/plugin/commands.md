# 插件命令详解

agile 插件的 12 个 `/agile:xxx` 斜杠命令。每个命令：**用途 / 使用场景 / 参数 / 前置条件 / 产物 / 示例**。

流程主线位置标注：`①prd → ②sync-req → ③architect → ④gen-test → ⑤backend|frontend → ⑥run-test`。

---

## /agile:help —— 命令总览

| | |
|---|---|
| 用途 | 列出全部命令与流程主线说明，检查当前工作区状态 |
| 场景 | 新成员上手；忘记命令时 |
| 参数 | 无 |
| 产物 | 终端输出（命令表 + 流程图 + workspace 状态概览） |

---

## /agile:prd —— PRD 生成 ①

| | |
|---|---|
| 用途 | 从需求描述产出 PRD、验收标准（AC）、功能树、菜单树 |
| 场景 | 需求评审后、进入设计前；把口头/纪要式需求结构化 |
| 参数 | `<需求编号或需求描述>`，如 `STO-001` 或一段需求文字（无编号时自动顺延分配） |
| 委派 | product-manager subagent |
| 前置 | 无（需求信息不足时列假设继续，PRD 顶部标注「待确认」） |
| 产物 | `<抽屉三>/requirements/<编号>/`：`PRD.md`、`AC.md`、`feature-tree.md`、`menu-tree.md` |
| 示例 | `/agile:prd STO-001 支持用户导出三个月内的订单流水，CSV 格式` |

**质量要求**：每条 AC 可测试（给定…当…则…）、与功能需求编号双向映射、覆盖正常+边界+异常路径。

---

## /agile:sync-req —— 需求同步 ②

| | |
|---|---|
| 用途 | 把抽屉三的需求产物同步到 `process-docs/<编号>/`，创建标准五文档目录 |
| 场景 | prd 完成后、进入设计前——为开发准备过程目录 |
| 参数 | `<需求编号>`（缺省列出 process-docs 现有编号供选择） |
| 前置 | `/agile:prd` 已产出需求产物 |
| 产物 | 调 MCP `agile_task_create` 创建五文档目录；PRD+AC 并入 `requirement.md`；AC/功能树/菜单树复制到过程目录（抽屉三原件保留） |
| 示例 | `/agile:sync-req STO-001` |

校验：`requirement.md` 中 AC 至少 1 条，否则警告回到 `/agile:prd`。

---

## /agile:architect —— 技术方案设计 ③

| | |
|---|---|
| 用途 | 产出技术设计文档 design.md（SDD 核心） |
| 场景 | 进入开发前；设计评审时 |
| 参数 | `<需求编号>` |
| 委派 | tech-architect subagent |
| 前置 | `requirement.md` 已填充含 AC（**SDD 红线：无设计不开发**，未填充即停止） |
| 产物 | `process-docs/<编号>/design.md`：方案概述/涉及模块/接口设计/数据模型与状态机/关键流程/测试策略/风险取舍 |
| 示例 | `/agile:architect STO-001` |

设计约束：技术选型只能来自抽屉一允许清单；复用优先（先查抽屉二既有设计）；每个接口/表可追溯 AC；不确定处显式标注 TBD。

---

## /agile:gen-test —— 测试案例生成 ④

| | |
|---|---|
| 用途 | Stage 1：基于 AC 与设计产出测试案例文档（**先于实现**） |
| 场景 | 设计完成后、开发开始前；让测试意图指导 TDD |
| 参数 | `<需求编号>` |
| 委派 | test-engineer subagent |
| 前置 | `requirement.md`（AC）必须有；`design.md` 缺失时警告（可经确认仅基于 AC 生成） |
| 产物 | `process-docs/<编号>/gen-test.md`：测试范围、案例清单（TC 表：AC 映射/前置/步骤/期望/优先级/类型）、数据准备、自动化映射 |
| 示例 | `/agile:gen-test STO-001` |

质量要求：每条 AC 至少 1 正常 + 1 边界/异常案例。

---

## /agile:backend —— 后端 TDD 开发 ⑤

| | |
|---|---|
| 用途 | 调度 backend-dev subagent 按 design.md 以 Red-Green-Refactor 循环实现后端任务 |
| 场景 | 测试案例就绪后的后端开发阶段 |
| 参数 | `<需求编号> [项目名]`，如 `STO-001` 或 `STO-001 order-service` |
| 委派 | backend-dev subagent（分批，每批 ≤5 任务） |
| 前置 | design.md 已填充（红线）；建议先 `agile worktree create feature/<编号>`；工作区干净 |
| 产物 | worktree 内代码 + 测试；`implementation.md` 任务清单与 TDD 循环记录；`STO-xxx(red|green|refactor):` 序列 commit |
| 示例 | `/agile:backend STO-001` |

闭环条件：任务全勾、测试全绿、循环记录完整、无 design 外依赖。

---

## /agile:frontend —— 前端分层开发 ⑤

| | |
|---|---|
| 用途 | 调度 frontend-dev subagent 完成接口层→组件层→页面层分层实现与浏览器验证 |
| 场景 | 前端开发阶段（可与 backend 并行——接口层先 mock） |
| 参数 | `<需求编号> [前端项目名]` |
| 委派 | frontend-dev subagent（分批） |
| 前置 | design.md 已填充（红线）；menu-tree/feature-tree 确定页面范围；工作区干净 |
| 产物 | 分层代码 + 组件测试；浏览器验证记录；implementation.md 更新 |
| 示例 | `/agile:frontend STO-001 frontend-web` |

每层都 TDD；浏览器验证走查关键路径对照 AC。

---

## /agile:run-test —— 测试执行与验收 ⑥

| | |
|---|---|
| 用途 | Stage 2：按测试案例逐条执行并产出验收报告，**全程 auto 模式**（不中途提问） |
| 场景 | 提测验收；发布前确认 |
| 参数 | `<需求编号> [--only P0] [--repo 仓库路径]` |
| 委派 | test-engineer subagent |
| 前置 | implementation.md 有已完成任务；gen-test.md 缺失时现场生成精简清单（报告注明） |
| 产物 | `process-docs/<编号>/run-test.md`：范围/环境/逐案例结果表/失败清单/通过率/结论（通过/有条件通过/不通过） |
| 示例 | `/agile:run-test STO-001` |

**诚实原则**：没执行的标「未执行」，禁止推断填「通过」；测试命令与原始输出摘录写入报告。

---

## /agile:fix-bug —— 快速修复

| | |
|---|---|
| 用途 | 自主完成「复现 → 定位 → 根因 → 最小修复 → 回归验证 → 登记」闭环 |
| 场景 | **任意阶段**的缺陷：开发期、测试期、线上问题 |
| 参数 | `<问题描述或 编号+问题描述>`，如 `STO-001 下单接口 500`（无编号则创建 BUG-xxx） |
| 委派 | bug-hunter subagent |
| 前置 | 工作区干净（修复基于干净基线） |
| 产物 | 最小修复 diff + 复现测试（Red→Green）+ 全量回归确认；登记进对应任务文档；接口变更同步更新 design.md |
| 示例 | `/agile:fix-bug STO-001 导出 CSV 中文乱码` |

---

## /agile:ui —— UI 与组件库

| | |
|---|---|
| 用途 | 组件库全生命周期：建设（build）/ 原型（prototype）/ 维护（maintain） |
| 场景 | 建团队组件库；为需求产出页面原型；组件升级/废弃 |
| 参数 | `<子命令与参数>`：`build` / `prototype STO-xxx` / `maintain <变更描述>`（缺省询问） |
| 委派 | ui-designer subagent |
| 前置 | prototype 需求编号已存在；遵循抽屉三 UI 规范 |
| 产物 | 组件库代码（组件+测试+CHANGELOG）；`<抽屉三>/prototypes/<编号>/page-*.md` 原型；规范缺口清单 |
| 示例 | `/agile:ui prototype STO-001` |

---

## /agile:add-task —— 补充任务

| | |
|---|---|
| 用途 | 把遗漏的开发任务**追加**到任务清单（只增不改：已有条目、勾选状态、顺序一律不动） |
| 场景 | 开发中发现 design 遗漏的工作项 |
| 参数 | `<需求编号> <任务描述>`（多条用分号/换行） |
| 前置 | implementation.md 存在 |
| 产物 | 任务清单追加条目（编号顺延）；与既有任务重复时不追加只汇报 |
| 示例 | `/agile:add-task STO-001 增加导出接口的限流逻辑` |

---

## /agile:feedback —— 问题反馈

| | |
|---|---|
| 用途 | 收集当前会话中的错误/异常/未闭环问题，生成标准反馈报告 |
| 场景 | 会话出问题后归档；给 CLI/插件/规范提 issue 前整理现场 |
| 参数 | `[主题或需求编号]` |
| 前置 | 无（仅人工触发，模型不会自动调用） |
| 产物 | `process-docs/<编号>/feedback-<日期>.md`：环境信息（agile version + doctor 摘要）、问题清单（现象/期望/严重级/建议归属）、原始错误摘录 |
| 示例 | `/agile:feedback STO-001` |
