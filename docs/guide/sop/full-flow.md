# 团队协作 SOP · 完整流程（STO）

**原则：一个编号、一个分支、一个 worktree、一个 PR。**所有产物（需求文档、设计、测试案例、代码、验收记录）在需求分支累积，交付时随同一个 PR 入 main。

生命周期总图见[总览](/guide/sop/)。本页按 11 步逐步展开：每步先给规则，再用 📌 容器给贯穿案例 **STO-012 会员订单导出** 的实录（虚构）。

---

## #0 需求立项（产品）

**规则**：产品在仓库内编写 `biz-product-docs/requirements/<编号>/`（最低结构：背景、目标、AC ≥ 1 条），**分配编号 STO-xxx**（产品是唯一分配者）并**指派负责人**（后端或前端，按需求性质，见[总览](/guide/sop/)角色说明）。使用 `/agile:prd` 生成功能树/菜单树属可选增强。

::: tip 📌 STO-012 实录
产品林悦创建 `biz-product-docs/requirements/STO-012/PRD.md`（走 PR 提交入库），背景「运营每月手工导订单耗时 2 小时」，目标「页面自助导出 90 天内订单」，AC 摘录：

- AC1：给定 90 天内的订单，当点击「导出 CSV」，则生成下载链接（保留 30 天）
- AC2：当导出任务超过 5 分钟，则页面提示「导出超时，请缩小范围」
- AC3：CSV 以 UTF-8 BOM 编码，Excel 打开中文不乱码

分配编号 STO-012，指派后端大伟为负责人。
:::

## #1 建环境（负责人）

**规则**：主工作区执行 `agile worktree create feat/STO-xxx`（自动创建分支 + 独立检出目录），推送远程分支。

::: tip 📌 STO-012 实录

```bash
$ agile worktree create feat/STO-012
✔ 分支 feat/STO-012 已创建，检出于 .worktrees/feat__STO-012
$ git push -u origin feat/STO-012
```
:::

## #2 入仓 + 设计（负责人）

**规则**：worktree 内执行 `/agile:sync-req STO-xxx`（把抽屉三需求产物同步到 `process-docs/<编号>/`，创建标准七文件目录并做 AC 校验）→ `/agile:architect STO-xxx`（产出 design.md：方案概述、涉及模块、**接口设计**、数据模型）→ **design 冻结时把任务分配表填入 implementation.md**（主文件，写法见[协作与文档规则](/guide/sop/collab)）。design.md 单写者 = 负责人；**无 design.md 不开发（SDD 红线）**。完成后推送。

::: tip 📌 STO-012 实录
`/agile:architect STO-012` 产出 design.md，接口契约摘录：

| 接口 | 方法 | 入参 | 出参 |
|---|---|---|---|
| `/api/orders/export` | POST | `{ from, to }`（≤90 天） | `{ taskId }` |
| `/api/orders/export/{taskId}` | GET | — | `{ status: pending\|done\|timeout, url? }` |

任务分配表（design 冻结时填入 implementation.md）：后端 = 导出任务 + 两个接口（大伟）；前端 = 列表页导出按钮 + 轮询下载（小琪）。
:::

### 页面原型（可选节点）

涉及新页面 / 重交互的需求，建议在测试设计（#4）前后、开发（#5）前执行 `/agile:ui prototype <编号>`（prd 后、frontend 前的可选动作，**不设门禁**）——原型读项目 `docs/ui.md`（**有则必读**，视觉描述引用 token 名）与抽屉三 UI 规范，产出落 `biz-product-docs/prototypes/<编号>/`，规范缺口反馈产品；页面实现仍归 `/agile:frontend`。

::: tip 📌 STO-012 实录
`/agile:ui prototype STO-012` 产出 `page-order-export.md`：导出按钮用主色 token（引用项目 `docs/ui.md` 的 `--color-primary`，不写裸色值）、任务进行中显示进度态；标注一个规范缺口「批量导出上限未定义」反馈产品。
:::

## #3 拉取环境（后端 + 前端）

**规则**：前置——对端本机已完成 workspace 初始化（`agile init workspace` + `agile sync`）。对端在自己机器执行 `agile worktree create feat/STO-xxx`——分支已存在远程时**自动跟踪检出**，无需手工 checkout。

::: tip 📌 STO-012 实录
小琪执行 `agile worktree create feat/STO-012`，输出「远程分支已存在，已跟踪检出」。
:::

## #4 测试设计（负责人；有独立测试则测试先行）

**规则**：`/agile:gen-test STO-xxx` 产出 gen-test.md——测试范围、案例清单（分「**后端用例/前端用例**」两节，TC 表：AC 映射/前置/步骤/期望/优先级/类型）、数据准备、自动化映射（单测/e2e）。质量要求：每条 AC 至少 1 正常 + 1 边界/异常案例；e2e 用例归前端节，只覆盖关键路径。

::: tip 📌 STO-012 实录（摘两行）

| TC | AC | 节 | 类型 | 期望 |
|---|---|---|---|---|
| TC-B2 | AC2 | 后端用例 | 异常 | 超 5 分钟任务状态 = timeout，接口返回提示 |
| TC-F3 | AC1 | 前端用例 | e2e | 关键路径：点击导出 → 轮询 → 浏览器下载 CSV |
:::

## #5 并行开发（负责人承其一端 + 对端）

**规则**：`/agile:backend STO-xxx` ‖ `/agile:frontend STO-xxx` 可并行（前端接口层先 mock）。按 design.md 以 Red-Green-Refactor 循环实现；**无失败测试不写实现（TDD 红线）**；各自只写 `implementation-be.md` / `implementation-fe.md`（文件级隔离，见[协作与文档规则](/guide/sop/collab)）；小步推送（自动 CI + stage CD）。

::: tip 📌 STO-012 实录
大伟的 implementation-be.md 循环记录摘录：

```
- [x] 导出任务服务
  - red: 补 task 超时单测（fail）→ green: 引入超时检查（pass）→ refactor: 抽 TimeoutPolicy
  - commit: STO-012(red): 补导出任务超时失败测试
  - commit: STO-012(green): 导出任务超时状态机
```

小琪接口层先按契约 mock `{ taskId }`，页面层等 #6 联调对真接口。
:::

## #6 联调（后端 + 前端）

**规则**：stage 环境（分支 push 自动部署）对真接口集成测试通过；接口有出入时**先改 design.md 并知会对端**（接口变更纪律），再动代码。

::: tip 📌 STO-012 实录
联调发现导出成功后 `url` 为相对路径，前端拼域名出错——大伟改 design.md 契约为「url 返回绝对地址」，重新生成前端 types，小琪复验通过。
:::

## #7 自测验收（开发兼任；有测试则独立执行）

**规则**：`/agile:run-test STO-xxx` 按 gen-test.md 逐案例执行并产出 run-test.md。**诚实原则**：没执行的标「未执行」，禁止推断填「通过」；测试命令与原始输出摘录写入报告。

::: tip 📌 STO-012 实录（摘录）

| TC | 结果 | 备注 |
|---|---|---|
| TC-B2 | 通过 | 5 分钟任务 → timeout ✅ |
| TC-F3 | 未执行 | 本机无浏览器环境，转 #8 stage 验证 |

结论：有条件通过（e2e 待 stage 验证）。
:::

## #8 验收汇总（负责人汇总；前端/后端/产品参与）

**规则**：交叉验收（前端验后端接口、后端验前端页面）+ AC 验收（产品按 AC 逐条，stage 环境）→ `/agile:review STO-xxx` 生成 review.md 验收矩阵并判定门禁——**全通过才可交付 PR**；未闭环项修复后重走。验收结论由人做出，**AI 不代验收**。矩阵与门禁完整实录见[验收、发布与纪律](/guide/sop/release)。

## #9 交付（负责人）

**规则**：PR（代码 + 全部过程文档随同一分支）→ CI 绿 → squash 合入 main。PR 标题与描述均写清需求编号（含是否走轻量通道）。

::: tip 📌 STO-012 实录
PR 标题 `feat: STO-012 会员订单导出`，描述含 AC 清单、设计要点、验收结论链接；CI 绿后产品确认 AC3 通过，squash 合入。
:::

## #10 发布记录（负责人）

**规则**：`/agile:release STO-xxx` 做前置检查（review 门禁 + run-test 结论 + PR 已合 main 人工确认）并起草 release.md：变更清单 + **回滚方案四要素**（回滚目标/步骤/数据影响/验证点）。**发布动作人工执行**；发布顺序不变：合并先于发版。完整回滚方案实例见[验收、发布与纪律](/guide/sop/release)。

## #11 清理（负责人）

**规则**：主工作区 `agile worktree remove feat/STO-xxx`（同时删除本地分支；分支未合并时保留并警告）；对端同步清理本地 worktree。

---

## 两条 SDD/TDD 红线（插件强制）

**无 design.md 不开发；无失败测试不写实现。**

## 接口变更纪律

改接口必须先改 design.md 并**知会对端**，再动代码；design.md 单写者 = 负责人，对端不直接改。

## 发版与合并顺序

合并先于生产发版（main 始终等于生产在跑的代码），紧急 hotfix 也不例外——走[轻量通道](/guide/sop/lite)的加急通道（压缩验收与审批），CI 绿 → 合并 main → 从 main 发版的顺序不变。
