# 角色 Subagent

Agile 插件的 7 个角色 subagent。命令（人机入口）做「前置校验 → Task 委派 → 复核汇报」，角色 agent 做具体执行。`description` 用第三人称描述"何时使用"——这是模型自动委派的触发依据。

全部角色共同约束：

- 产物**全中文**落盘到约定位置（抽屉路径先读 `.agile/workspace.yaml`）
- 规范引用优先级：抽屉一（公司硬规范）> 抽屉二（团队设计）> 抽屉三（产品/UI 规范）> 当前 design.md
- 两条红线：无 design.md 不开发；无失败测试不写实现

---

## product-manager —— 产品经理

| | |
|---|---|
| 何时委派 | 把模糊业务想法整理成结构化产品文档；为需求编号编写 PRD（/agile:prd） |
| 输入 | 需求编号 + 需求描述 + 抽屉三路径 |
| 产出 | `PRD.md`（背景/用户故事/范围/FR 编号/非功能/风险）、`AC.md`（可测、双向映射 FR）、`feature-tree.md`、`menu-tree.md` |
| 工作方式 | 信息不足时列假设继续并标注「待确认」；产出后自检 AC 覆盖度 |

## tech-architect —— 技术架构师

| | |
|---|---|
| 何时委派 | 为需求做架构/状态机/接口设计；SDD 设计阶段（/agile:architect） |
| 输入 | `requirement.md`（含 AC）+ 三个抽屉路径 + projects 现状 |
| 产出 | `design.md`：方案概述与备选取舍、涉及模块表（模块/项目路径/改动类型）、接口设计、数据模型与状态机（mermaid）、关键流程、测试策略、风险与 TBD |
| 硬约束 | 选型只能来自抽屉一允许清单；复用优先禁止重复造轮子；设计可追溯到 AC |

## backend-dev —— 后端 TDD 工程师

| | |
|---|---|
| 何时委派 | 后端开发任务（/agile:backend）；按 TDD 实现服务端逻辑 |
| 输入 | design.md + 测试案例 + worktree 路径 + 任务清单（每批 ≤5） |
| 产出 | worktree 内实现与测试；implementation-be.md 任务勾选与 TDD 循环记录表（**仅后端可写**）；`STO-xxx(red|green|refactor):` 序列 commit |
| TDD 硬规则 | Red（写失败测试并记录输出）→ Green（最小实现）→ Refactor（保持绿色）；脚手架/接口签名之外不提前实现 |

## frontend-dev —— 前端工程师

| | |
|---|---|
| 何时委派 | 前端开发任务（/agile:frontend）；Web 界面实现 |
| 输入 | design.md + UI/交互规范（抽屉三）+ 既有组件清单（抽屉二）+ worktree 路径 |
| 产出 | 接口层（api 封装 + 类型 + mock）→ 组件层（先测试后实现）→ 页面层（组装 + 路由对齐菜单树）；浏览器验证记录；关键路径固化为 e2e 脚本；implementation-fe.md 任务清单与测试记录（**仅前端可写**） |
| 分层顺序 | 接口层 → 组件层 → 页面层，每层 TDD |

## ui-designer —— UI / 组件库专家

| | |
|---|---|
| 何时委派 | 组件库建设/扩展、页面原型产出、组件升级废弃（/agile:ui） |
| 输入 | UI 规范 + 交互规范 + 变更需求 |
| 产出 | 组件（README+示例+测试）、原型 `page-*.md`（结构+交互+mermaid）、CHANGELOG（变更/兼容性）、规范缺口清单 |
| 约定 | props 与既有组件库一致；交互规范未覆盖处显式标注「规范缺口」 |

## test-engineer —— 测试工程师

| | |
|---|---|
| 何时委派 | 生成测试案例（/agile:gen-test，Stage 1）；执行测试验收（/agile:run-test，Stage 2） |
| 输入 | Stage1：requirement.md + design.md；Stage2：gen-test.md + 各项目实现 |
| 产出 | `gen-test.md`（分后端/前端两节的 TC 案例表，e2e 归前端节 + 数据准备 + 自动化映射）；`run-test.md`（逐案例结果 + 通过率 + 结论） |
| 诚实原则 | 没跑过的用例标「未执行」，禁止推断填「通过」；测试命令与输出摘录入报告 |

## bug-hunter —— 缺陷诊断专家

| | |
|---|---|
| 何时委派 | 快速修复 bug（/agile:fix-bug）；定位需要根因分析的缺陷 |
| 输入 | bug 描述 + 涉及项目 + 任务编号 |
| 产出 | 根因（一句话）+ 证据链 + 最小修复 diff + 复现测试（Red→Green）+ 全量回归确认 + 文档登记 |
| 诊断工具箱 | git log/blame/diff 代码考古；`agile status` 看外部仓库漂移；配置/schema/环境差异排查 |
| 原则 | 不能复现时输出「无法复现」报告与所需信息清单，禁止瞎猜；dirty 仓库先停下确认 |
