# 插件命令详解

Agile 插件的 17 个 `/agile:xxx` 斜杠命令。每个命令：**用途 / 使用场景 / 参数 / 前置条件 / 产物 / 示例**。

流程主线位置标注：`①prd → ②sync-req → ③architect → ④gen-test → ⑤backend|frontend → ⑥run-test → ⑦review → ⑧release`。

---

## /agile:help —— 命令总览

| | |
|---|---|
| 用途 | 列出全部命令与流程主线说明，检查当前工作区状态 |
| 场景 | 新成员上手；忘记命令时 |
| 参数 | 无 |
| 委派 | 无（**分工红线显式例外**：主会话直接执行） |
| 产物 | 终端输出（命令表 + 流程图 + workspace 状态概览） |

---

## /agile:prd —— PRD 生成 ①

| | |
|---|---|
| 用途 | 从需求描述产出 PRD、验收标准（AC）、功能树、菜单树 |
| 场景 | 立项后、设计前——**负责人**把产品在外部平台（腾讯文档/飞书）编写的需求文档结构化入仓；也适用口头/纪要式需求 |
| 参数 | `<需求编号或需求描述>`，如 `STO-001` 或一段需求文字（外部平台文档的要点/链接内容；无编号时自动顺延分配） |
| 委派 | product-manager subagent |
| 前置 | 无（需求信息不足时列假设继续，PRD 顶部标注「待确认」） |
| 产物 | `<抽屉三>/requirements/<编号>/`：`PRD.md`、`AC.md`、`feature-tree.md`、`menu-tree.md` |
| 示例 | `/agile:prd STO-001 支持用户导出三个月内的订单流水，CSV 格式` |

**质量要求**：每条 AC 可测试（给定…当…则…）、与功能需求编号双向映射、覆盖正常+边界+异常路径。

---

## /agile:sync-req —— 需求同步 ②

| | |
|---|---|
| 用途 | 把抽屉三的需求产物同步到 `process-docs/<编号>/`，创建标准任务目录（7 个 .md） |
| 场景 | prd 完成后、进入设计前——为开发准备过程目录；**轻量通道（无 PRD 产物）时以一句话需求轻量创建**（STO 轻量 / OPS 的目录入口） |
| 参数 | `<需求编号> [一句话需求]`（缺省列出 process-docs 现有编号供选择） |
| 委派 | 无（**分工红线显式例外**：主会话直接执行） |
| 前置 | 完整同步需 `/agile:prd` 已产出；轻量形态无前置 |
| 产物 | 按 SKILL 附录 A 模板直接创建任务目录（7 个 .md，幂等）。完整：PRD+AC 并入 `requirement.md`，功能树/菜单树复制（抽屉三原件保留）；轻量：`requirement.md` 落一句话需求 + 1–2 条 AC（头部轻量标记）、`gen-test.md` 填豁免行 |
| 示例 | `/agile:sync-req STO-001`；轻量 `/agile:sync-req STO-013 导出按钮增加批量模式` |

校验：完整同步 `requirement.md` 中 AC 至少 1 条，否则警告回到 `/agile:prd`。requirement 头部轻量标记使 `/agile:architect` 等命令自动按轻量深度执行。

---

## /agile:architect —— 技术方案设计 ③

| | |
|---|---|
| 用途 | 产出技术设计文档 design.md（SDD 核心） |
| 场景 | 进入开发前；设计评审时 |
| 参数 | `<需求编号>` |
| 委派 | tech-architect subagent |
| 前置 | `requirement.md` 已填充（完整含 AC，或轻量形态含一句话需求）（**SDD 红线：无设计不开发**，未填充即停止） |
| 产物 | `process-docs/<编号>/design.md`：完整形态输出方案概述/涉及模块/接口设计/数据模型与状态机/关键流程/测试策略/风险取舍；**轻量通道**（requirement 头部轻量标记）输出三五行方案简述 |
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
| 产物 | `process-docs/<编号>/gen-test.md`：测试范围、案例清单（分「后端用例/前端用例」两节，TC 表：AC 映射/前置/步骤/期望/优先级/类型 正常/边界/异常/e2e——e2e 归前端节，只覆盖关键路径）、数据准备、自动化映射（单测/e2e） |
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
| 前置 | design.md 已填充（红线）；建议先 `agile worktree create feat/<编号>`；工作区干净 |
| 产物 | worktree 内代码 + 测试；`implementation-be.md` 任务清单与 TDD 循环记录；`STO-xxx(red\|green\|refactor):` 序列 commit |
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
| 产物 | 分层代码 + 组件测试；浏览器验证记录（关键路径固化项目 `e2e/` 目录，Playwright）；implementation-fe.md 更新 |
| 示例 | `/agile:frontend STO-001 frontend-web` |

每层都 TDD；浏览器验证走查关键路径对照 AC。

---

## /agile:run-test —— 测试执行与验收 ⑥

| | |
|---|---|
| 用途 | Stage 2：按测试案例逐条执行并产出验收报告，**全程 auto 模式**（不中途提问） |
| 场景 | 提测验收（含 e2e 用例）；发布前 stage 冒烟 |
| 参数 | `<需求编号> [--only P0] [--repo 仓库路径]` |
| 委派 | test-engineer subagent |
| 前置 | implementation-be/-fe.md 有已完成任务；gen-test.md 缺失时现场生成精简清单（报告注明） |
| 产物 | `process-docs/<编号>/run-test.md`：范围/环境/逐案例结果表/失败清单/通过率/结论（通过/有条件通过/不通过）；关键截图归档 `assets/` 子目录（运行产物不提交 git） |
| 示例 | `/agile:run-test STO-001` |

**诚实原则**：没执行的标「未执行」，禁止推断填「通过」；测试命令与原始输出摘录写入报告。

---

## /agile:review —— 验收汇总与门禁 ⑦

| | |
|---|---|
| 用途 | 收集交叉验收与 AC 验收结论生成 review.md，判定「可交付 PR」门禁 |
| 场景 | run-test 通过后的验收期；交付 PR 前的门禁检查 |
| 参数 | `<需求编号>` |
| 委派 | 无（**分工红线显式例外**：验收结论在主会话交互中收集，主会话直接执行） |
| 前置 | run-test.md 存在且结论非「不通过」 |
| 产物 | `process-docs/<编号>/review.md`：验收矩阵（验收项/验收人/环境/结论/时间）+ 未闭环清单 + 门禁结论 |
| 示例 | `/agile:review STO-001` |

**硬规则**：AI 只记录、格式化与判定门禁，**不代替任何角色的验收**——交叉验收、AC 验收的结论必须由人做出。全部通过 → 可交付 PR；有未闭环 → 不得交付，缺陷走 `/agile:fix-bug` 修复后重走。轻量通道（STO 轻量 / BUG / OPS）降级为报告人/提需求人一行确认（[SOP · 轻量通道](/guide/sop/lite)）。

---

## /agile:release —— 发布前置检查与记录 ⑧

| | |
|---|---|
| 用途 | 检查发布前置条件，起草 release.md（变更清单 + 回滚方案），登记发布结果 |
| 场景 | PR 合入 main 前后的发布期；为需求发布留档与回滚准备 |
| 参数 | `<需求编号>` |
| 委派 | 无（**分工红线显式例外**：主会话直接执行） |
| 前置 | review 门禁「可交付」；run-test 结论非「不通过」；PR 已合入 main（人工确认） |
| 产物 | `process-docs/<编号>/release.md`：前置检查结论、变更清单、回滚方案（目标/步骤/数据影响/验证点）、发布记录 |
| 示例 | `/agile:release STO-001` |

**硬规则**：本命令**不执行任何发布动作**——合并 PR、部署、发版一律人工执行，只做前置检查、记录起草与结果登记。发布顺序不变：合并先于发版。**回滚方案必备要素**：回滚目标、回滚步骤、数据影响与处理、回滚后验证点——按本次变更内容起草，不得敷衍为「回滚上个版本」。轻量通道涉及部署时记一行（变更 + 回滚点）。

---

## /agile:fix-bug —— 快速修复

| | |
|---|---|
| 用途 | 自主完成「复现 → 定位 → 根因 → 最小修复 → 回归验证 → 登记」闭环 |
| 场景 | **任意阶段**的缺陷：开发期、测试期、线上问题；团队 SOP 轻量通道中 **BUG 形态**的标准入口（[SOP · 轻量通道](/guide/sop/lite)） |
| 参数 | `<问题描述或 编号+问题描述>`，如 `STO-001 下单接口 500`（无编号则创建 BUG-xxx 并轻量初始化目录） |
| 委派 | bug-hunter subagent |
| 前置 | 工作区干净（修复基于干净基线） |
| 产物 | 最小修复 diff + 复现测试（Red→Green）+ 全量回归确认；无编号时建 BUG-xxx 目录（requirement 落缺陷描述+复现步骤、gen-test 豁免行）；design.md 记根因分析、run-test.md 记回归结论；review.md 由 `/agile:review` 轻量形态生成验收确认 |
| 示例 | `/agile:fix-bug STO-001 导出 CSV 中文乱码` |

---

## /agile:ui —— UI 与组件库

UI 设计与组件库全生命周期，按 `$ARGUMENTS` 中的子命令选择模式（缺省时询问用户选择）。

| | |
|---|---|
| 用途 | 组件库建设（build，含选型判定与立项）/ 页面原型（prototype）/ 组件维护升级（maintain，OPS 轻量） |
| 参数 | `<子命令与参数>`，三个模式见下 |
| 委派 | ui-designer subagent（三个模式均委派） |
| 通用约定 | 遵循抽屉三 UI/交互规范；组件先测试后实现（TDD）；产物全中文；**分工边界**——只管组件库与页面原型，页面实现归 `/agile:frontend`，长期结论沉淀归 `/agile:knowledge capture` |

### /agile:ui build —— 组件库建设

| | |
|---|---|
| 用途 | 前置选型判定（现成库 or 自建）后从 0 到 1 建设团队组件库 |
| 前置 | 抽屉三 UI 规范、抽屉二前端工程规范已就位（缺失时先补规范或与负责人确认） |
| 产物 | 选型结论（现成库时）或组件库代码（组件 + 测试 + README + 设计 token，token 同步项目 `docs/ui.md`）；自建走独立 STO 立项，随后 `agile init project <name> --template vue3-vite` 或 `react-vite` 落库并登记模板注册中心 |
| 示例 | `/agile:ui build` |

**前置选型判定**：先问「现成组件库 or 自建」——选现成库（如 ant.design）**不进建设流程**，登记选型结论后引导 `/agile:init` 配框架 AI 能力包；自建才走建设流程。自建走**独立 STO 立项**（规模小经确认可走轻量通道），设计 token 是第一批产物；长期结论建议 `/agile:knowledge capture` 沉淀（组件用法 → `frameworks/<前端栈>/`）。

### /agile:ui prototype —— 页面原型

| | |
|---|---|
| 用途 | 为需求产出页面原型，开发前对齐页面结构与交互（**prd 后、frontend 前的可选动作**——建议执行，不设门禁） |
| 参数 | `/agile:ui prototype <STO-xxx> [页面描述]` |
| 前置 | `process-docs/<编号>/requirement.md` 已存在（否则先执行 `/agile:prd`） |
| 产物 | `<抽屉三>/prototypes/<编号>/page-*.md`：页面结构、交互说明、mermaid 流程、规范缺口清单 |
| 示例 | `/agile:ui prototype STO-001` |

必读链条（按优先级链、受团队库匹配状态约束）：项目 `docs/ui.md`（有则必读——视觉描述用 token 名，不写裸色值）→ 抽屉三 UI 规范 → `frameworks/<前端栈>/`（仅匹配确认后）。

### /agile:ui maintain —— 组件维护 / 升级

| | |
|---|---|
| 用途 | 既有组件的升级或废弃，并盘点受影响面；**默认走 OPS 轻量通道**（变更含业务可见行为时提醒升级 STO 轻量） |
| 参数 | `/agile:ui maintain <变更描述>` |
| 前置 | 经 `/agile:sync-req OPS-xxx <变更一句话>` 轻量创建过程目录；worktree / PR 照走 |
| 产物 | 组件变更：升级 = 改实现 + 更新测试 + CHANGELOG 登记；废弃 = deprecated 标记 + 迁移指引；**token 变更同步回写项目 `docs/ui.md`**（单一事实源）；附受影响页面清单（grep 组件库引用，列出受影响仓库与文件）与批量验证建议 |
| 示例 | `/agile:ui maintain 日期选择器增加范围快捷项` |

---

## /agile:init —— AI 陪同初始化项目

| | |
|---|---|
| 用途 | AI 陪同建项目：模板选择与骨架生成（单模板，或组合模板平铺生成全部成员项目）、项目约定问答定制（目录 / 命名 / 测试 / UI 约定 / 依赖选型，组合场景按成员逐项目）、团队库匹配人工确认、辅助开发能力配置（环境检测 + 框架 AI 能力包推荐） |
| 场景 | 新项目启动（"帮我建个 xx 项目"）；想让项目 CLAUDE.md / docs 约定与实际情况一致 |
| 参数 | 无——**自动感知**：扫 `projects/` 一层（`projects/*/`，单例与组合成员项目全部平铺）检测 CLI 刚创建的未定制项目（CLAUDE.md 规范段带「⛔ 栈领域待人工确认」标记，技术栈节自带来源模板）则续接定制；无候选则进入全新创建交互（选单模板或组合模板 + 定名） |
| 委派 | 无（主会话执行——问答素材在主会话上下文中，分工红线显式例外） |
| 前置 | agile workspace 内 |
| 产物 | `projects/<name>/`（CLI 生成 + 问答改写）：conventions.md 定制版；CLAUDE.md 团队规范段确认改写 + 新增「环境要求」「辅助开发配置」节；`docs/ui.md` 定制版（前端模板——UI 约定问答落 token 管理方式与基准值，未问到处保留「待定」）；组合场景另产出成员映射表（成员 → 成员模板（组合专属）→ 实际目录） |
| 示例 | `/agile:init`（先 `agile init project` 也可——命令会感知到刚创建的项目并续接） |

要点：**默认值兜底**——开头一问「定制 or 全默认」（推荐全默认），全默认则产物与纯 CLI init 完全一致；**组合模板场景**——生成前先做事前撞名核对（有效成员目录名扫 `projects/` 比对，撞名问用户）与成员目录命名问答（预选项 = 组合定义的成员名，可自定义短名，CLI 拼 `--member`），约定问答按成员逐项目循环（支持「沿用上一成员口径」），汇报附成员映射表，生成完成后 CLI 自动带出组合根耦合资产快照（`.agile/solutions/<组合名>/`），可接 `/agile:knowledge sync-template <组合名>` 同步进抽屉；**分级落盘**——只读环境检测直接做，MCP / design.md / llms.txt 确认后 AI 写入（MCP 进项目 `.mcp.json`），框架 CLI 确认后自动安装（优先 devDep + `npx`），**skills 安装与权限白名单只输出建议清单、人工自己配**。框架 AI 能力包推荐来源按序：团队库（仅团队库匹配已确认栈领域时）→ 命令内置映射（Vue / Vite / React / Node 官方 llms.txt、Ant Design AI 能力包等，2026-09 核实可达）→ 现场检索（WebSearch 核实存在才推荐，防幻觉包名）。定制不回写模板；团队库未确认前只引用通用领域。

---

## /agile:add-template —— AI 辅助建设模板

| | |
|---|---|
| 用途 | AI 陪同一键建设 agile-templates 新模板：四流程（A 从零手写单例 / B 派生改造单例 / C 上游脚手架引入 / D 组合模板）× 统一收口（registry.json 登记、check.mjs 校验、init project 冒烟验证）；SDD/TDD 组织（设计定稿先行、骨架测试基线、冒烟验收清单先行） |
| 场景 | 团队沉淀新栈 / 新变体模板（"加一个 vue3-nuxt 模板"）；模板化上游脚手架（"把 create-xxx 产物变成我们的模板"）；组合底座（"加一套 前台+后台 系统组合"） |
| 参数 | `[模板名/组合名或技术栈描述]`；无参进入交互设计 |
| 委派 | 无（主会话执行——设计问答素材在主会话上下文中，分工红线显式例外） |
| 前置 | **仅限在 agile-templates 仓库根目录使用**（检测 `registry.json` + `scripts/check.mjs` + `singles/` 同时存在；其他位置如 workspace 内一律拒绝，先 cd 过去）；组合模板冒烟需支持 singles/solutions 布局的 CLI（布局自 2.1.0 引入；生成清单断点续建语义需 ≥ 2.2.0） |
| 产物 | 单模板：模板目录（项目骨架 + CLAUDE.md / docs/conventions.md / docs/architecture.md + 前端栈模板另加 docs/ui.md + README + 构建特征文件 + 可运行测试）+ `singles` 数组登记。组合：`solutions/<组合>/<成员>/` 成员目录（复制单例起点）+ `solutions` 数组登记 |
| 示例 | `/agile:add-template vue3-nuxt`（单模板，A/B/C 判定）；`/agile:add-template admin-base`（组合，进入成员构成问答） |

要点：**位置硬性限定**——只能在模板仓根目录运行，不做仓库定位猜测；**设计定稿门**——设计问答全部决策经用户确认后才写盘；**测试基线**——每个新骨架自带可运行测试且骨架阶段跑绿，跑绿后、登记前清理安装/构建产物（`node_modules` / `.next` / `dist` 等，见命令文件的示例命令）。**占位符与 init 语义相反——<span v-pre>`{{name}}`</span> / <span v-pre>`{{safeName}}`</span> 原样保留**（init 替换、建模板保留）；模板中立原则（预填默认值只来自模板自身选型与社区惯例，不引入 `frameworks/<栈>/` 条款，团队库领域只在项目级确认后引入）；check.mjs 全绿（条目形状 / JSON 重复键 / 数组重复登记 / 目录派生 / 双向一致 / 全局唯一 / 规范骨架 / 根白名单）+ 冒烟验证（验收清单先行，先核实模板目录无安装产物残留，临时 workspace + 本地模板源 `agile init project`，占位符替换正确且项目测试可跑）必须实际执行；**本仓全程不 add / 不 commit / 不 push**（推送即发版，人工处理）。**流程 D（组合模板）**：设计问答改问成员构成（组合名 + `projects` 成员问答 + 派生起点，前置查重三段全局唯一）；成员骨架**复制最接近的单例模板作起点**（仓库无对应技术栈单例的成员按**流程 A 从零手写**：依赖版本经 `npm dist-tags` 实查、工程配置对齐上游脚手架形态），组合专属深度定制按实际需求另行开发；登记进 `solutions` 数组（projects 条目与 singles 同形状 = name + 一句话 description，数组顺序 = 生成顺序）后 check.mjs 校验登记与成员目录双向一致、成员名全局唯一；冒烟验证成员平铺落盘、<span v-pre>`{{name}}`</span> 替换与重跑补缺（布局自 2.1.0 引入；生成清单断点续建语义需 ≥ 2.2.0）。

---

## /agile:add-task —— 补充任务

| | |
|---|---|
| 用途 | 把遗漏的开发任务**追加**到任务清单（只增不改：已有条目、勾选状态、顺序一律不动） |
| 场景 | 开发中发现 design 遗漏的工作项 |
| 参数 | `<需求编号> <任务描述>`（多条用分号/换行） |
| 委派 | 无（**分工红线显式例外**：主会话直接执行） |
| 前置 | implementation.md（主文件）存在 |
| 产物 | 任务清单追加条目（编号顺延，按归属写入 implementation-be/-fe.md 并同步主文件表）；与既有任务重复时不追加只汇报 |
| 示例 | `/agile:add-task STO-001 增加导出接口的限流逻辑` |

---

## /agile:feedback —— 问题反馈

| | |
|---|---|
| 用途 | 收集当前会话中的错误/异常/未闭环问题，生成标准反馈报告 |
| 场景 | 会话出问题后归档；给 CLI/插件/规范提 issue 前整理现场 |
| 参数 | `[主题或需求编号]` |
| 委派 | 无（**分工红线显式例外**：主会话直接执行） |
| 前置 | 无（仅人工触发，模型不会自动调用） |
| 产物 | `process-docs/<编号>/feedback-<日期>.md`（无编号时放 `process-docs/feedback/`）：环境信息（agile version + `agile sync --dry-run` / `agile plugin ls` 摘要）、问题清单（现象/期望/严重级/建议归属）、原始错误摘录 |
| 示例 | `/agile:feedback STO-001` |

---

## /agile:knowledge —— 知识库建设与沉淀

| | |
|---|---|
| 用途 | `build` 辅助建设知识库（判库 → 调库调研 → 提纲 → 落盘骨架）；`capture` 从会话、过程产物、历史材料沉淀长期结论；`sync-template` 把组合模板根归总的耦合约定/规范按资产类型同步进抽屉 |
| 场景 | build：新团队/新技术栈初始化知识库；capture：会话形成的技术决策当场沉淀、design.md 中长期结论入库、公司规范缺失的提案；sync-template：`agile init project --template <组合名>` 之后，把组合耦合知识落入知识库（最终符合「1 根 5 抽屉」范式） |
| 参数 | `build <建设提示词>` 或 `capture <主题> [--from <编号/路径/项目>]`，均可选 `--to team/product/tech`；或 `sync-template [组合名]`（缺省列出 `.agile/solutions/` 下全部组合）；无参显示库概况 |
| 委派 | 无（**分工红线显式例外**：素材在主会话对话历史中，主会话直接执行） |
| 前置 | 无（需在 agile workspace 或知识库仓库内执行；落点经三问判别法推断后向用户确认；sync-template 仅 workspace 内可用，依赖 `.agile/solutions/` 快照与两个知识库抽屉） |
| 产物 | 知识库领域目录下文档（frontmatter：领域/创建/来源/状态——状态取值「有效 / 已废弃 / 已被替代」，`来源` 格式 `<workspace 名>/<素材>`——workspace 名读 settings.json 的 `name`，单库模式用当前仓库名）+ 导航登记（根导航 + 所在模块导航）；tech-specs 相关落 `biz-tech-docs/proposals/` 提案 |
| 示例 | `/agile:knowledge build 我用的是 go-zero 后端 + ant.design 前端`；`/agile:knowledge capture 订单状态机设计结论 --from STO-012`；`/agile:knowledge sync-template admin-base` |

**运行环境**：agile workspace 内三库齐备（路径读 `.agile/settings.json`）；也可**脱离 workspace** 直接在 tech-specs / biz-tech-docs 仓库内使用——单库模式仅支持 tech / team 操作，`--from <编号>` 不可用，tech 提案不落盘、输出提案要点由人工带回团队走流程；biz-product-docs 绑定具体产品，始终随 workspace 使用。

**三问判别法**定落点：换产品还成立 → `tech`（tech-specs 团队只读，走提案）；说系统怎么实现 → `team`（biz-tech-docs；组件 API 约定、组件库用法落 `frameworks/<前端栈>/`）；说业务规则、用户看到什么 → `product`（biz-product-docs；视觉规则、交互模式含 token 语义）。

**划分约定**（tech / team 库）：按「通用 + 技术栈」两维组织——通用领域（`architecture/`、`engineering/`）跨技术栈共享，技术栈领域（`frameworks/go-zero/`、`frameworks/springboot/` 等）每栈一目录；**调取时按当前项目技术栈选择性引用**（识别优先级：提示词 > 扫 projects 标志文件 > 询问），其他技术栈领域不混入——go-zero 工作区不读 springboot 领域，反之亦然。

**通用硬规则**：知识禁止单文件堆积；**任何新文档必须导航双登记**（根导航对应分组 + 所在模块导航，build 与 capture 一致；模块导航存在才登记——建立时机：`frameworks/<栈>/` 必建、通用领域 ≥ 3 篇才建；归档单一位置——只在根导航「归档」分组，模块导航只列有效文档）；知识过期不删文件，改「状态」字段移入归档分组；跨会话历史不可检索——旧材料需 `--from` 指认。

**sync-template（组合模板耦合资产同步，仅 workspace 内）**：`init project --template <组合名>` 成功后 CLI 已把模板仓组合根两件套快照到 `.agile/solutions/<组合名>/`（组合定位/成员清单/耦合资产导航 + docs/ 耦合文档，见 [init project · 组合模板](/guide/commands#agile-init-project)）。本模式读该快照，逐篇按 frontmatter `类型` 定去向（`tech` → biz-tech-docs，`product` → biz-product-docs；缺失时按三问判别法推断并确认），正文复制进目标库并重写 frontmatter（`来源` = `<workspace 名>/模板 <组合名>`、`状态` = 有效），同名/同主题文档展示差异由人工决定 跳过/覆盖/另名，同样**导航双登记**。同步是复制不是移动：抽屉里的文档此后由团队演进，模板更新不自动回流，模板重度升级可重跑本模式逐篇对比。tech-specs 不接收（公司级只读，相关缺失走提案）。
