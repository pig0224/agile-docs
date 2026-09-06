# 团队协作 SOP · 总览与角色

> 适用：使用 FCC-Agile 工作区的业务研发团队（产品 / 后端 / 前端 / 运维）。
> 角色可兼任（负责人单端完成小需求时，另一端仅参与验收）；**节点顺序不变**。

## 定位：制度文本 vs 执行器

- **SOP = 制度文本**（本板块）：定义「谁、在哪一步、做什么、产出什么」——流程的裁决依据
- **插件命令 = 执行器**（见[插件概览](/plugin/overview)）：`/agile:xxx` 命令把制度固化为 AI 可执行的流程；Agent 辅助执行，**验收结论由人做出**

## 角色说明

### 负责人（需求 Owner）——由后端或前端兼任

- **每条需求指定一个负责人**，按需求性质定：
  - 新接口 / 服务 / 数据类需求 → **后端**任负责人（默认）
  - 纯 UI / 交互 / 纯前端需求 → **前端**任负责人
  - 有争议由运维（或架构会诊）指定
- 承担：接收产品指派（编号已由产品分配）、worktree 创建、需求入仓、技术设计（架构职责内含）、测试案例设计、**一端开发**、最终 PR 提交、验收结论汇总进 review.md
- 不需要另设架构评审节点：小需求负责人自查设计；重大/跨端需求，开工前拉对端 + 产品做 15 分钟设计走查（会话级，结论记入 design.md，不走 PR）

### 后端

- 承担需求的**后端开发**（负责人兼后端时，即负责人本人）
- 与负责人共用需求分支协作；实施记录只写 `implementation-be.md`
- 参与交叉验收：**验收前端页面**；重大需求参与设计走查

### 前端

- 承担需求的**前端开发**（负责人兼前端时，即负责人本人）
- 与负责人共用需求分支协作；实施记录只写 `implementation-fe.md`
- 参与交叉验收：**验收后端接口**；重大需求参与设计走查

### 产品

- 在**仓库内**编写需求文档（`biz-product-docs/requirements/<编号>/`，GitHub Web 或 VS Code 编辑，走 PR 提交），**最低结构要求：背景、目标、验收标准 AC（≥ 1 条）**；写作模板见 `biz-product-docs/templates/PRD模板.md`
- **分配需求编号 STO-xxx**（递增，产品是唯一分配者）并**指定负责人**（后端或前端）
- 开发完成后按 AC 做**业务验收**（stage 环境由运维支持）
- 使用 `/agile:prd` 生成功能树/菜单树属可选增强，非前提

### 运维

- `npm run release` 发版、CI/CD（分支 CI + stage 自动部署）与分支保护配置、演示/测试环境部署
- 重大需求设计会诊、争议需求指定负责人
- 技术优化类需求（重构/依赖升级/CI 优化）由运维分配编号，前缀 `OPS-xxx`（与业务需求 STO-xxx 号段隔离）

### 测试 = 两个验收动作（无专职岗位，可插拔）

1. **交叉验收**：前端验后端接口、后端验前端页面
2. **AC 验收**：产品按 requirement.md 验收标准逐条确认（stage 环境）
3. 负责人将结论汇总进 review.md（`/agile:review` 辅助汇总与门禁判定）
4. **若有独立测试人员**：开发前先行 `/agile:gen-test`（测试设计前置）；开发提交后独立执行 `/agile:run-test`；没有则由开发兼任 + 产品 stage 验收兜底

## AI 协作者（全员适用）

使用 Claude Code 插件（`/agile:xxx` 命令 + agile agent）辅助开发。红线：**AI 不执行 git add**（人工审阅后自行 add）；add 后 AI 可汇总 commit（commit 前确认全部暂存）；**AI 不 push、不发版**。commit message 由 AI 按 Conventional Commits 起草、人工确认。

**建议配合使用的工具**（可选增强，非流程强制，安装见各自仓库）：

| 工具 | 类型 | 地址 | 建议配合场景 |
|---|---|---|---|
| ui-ux-pro-max | Claude Code skill | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | UI/UX 设计辅助——`/agile:ui` 原型与前端视觉实现 |
| Playwright MCP | MCP Server | [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) | AI 直接驱动浏览器——配合前端浏览器验证与 e2e（e2e 主工具即 Playwright） |
| Chrome DevTools MCP | MCP Server | [ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) | 浏览器调试（控制台/网络/性能）——配合问题定位 |

## 需求生命周期总图（完整流程）

**原则：一个编号、一个分支、一个 worktree、一个 PR。**所有产物（需求文档、设计、测试案例、代码、验收记录）在需求分支累积，交付时随同一个 PR 入 main。main 只接收完整需求（完整流程）；STO 轻量 / BUG / OPS 走[轻量通道](/guide/sop/lite)。

| # | 阶段 | 执行人 | 在哪 | 产物 |
|---|---|---|---|---|
| 0 | 需求立项 | 产品 | 仓库内 | `biz-product-docs/requirements/STO-xxx/`（背景/目标/AC）+ **分配编号 + 指派负责人** |
| 1 | 建环境 | 负责人 | 主工作区 | `agile worktree create feat/STO-xxx`，推送远程分支 |
| 2 | 入仓 + 设计 | 负责人 | worktree 内 | `/agile:sync-req`（AC 校验）→ `/agile:architect`（design.md：方案、**接口设计**）→ design 冻结时填 implementation.md 任务分配表 → 推送 |
| 3 | 拉取环境 | 后端 + 前端 | 各自机器 | `agile worktree create feat/STO-xxx`（**自动跟踪已存在的远程分支**） |
| 4 | 测试设计 | 负责人（有测试则测试先行） | worktree 内 | `/agile:gen-test` → gen-test.md（分「后端用例/前端用例」两节；e2e 用例归前端节） |
| 5 | 并行开发 | 负责人承其一端 + 对端 | 各自本地 | `/agile:backend` ‖ `/agile:frontend`（辅以 ui / fix-bug / add-task / feedback），各自写 `implementation-be/-fe.md`，小步推送（自动 CI + stage CD） |
| 6 | 联调 | 后端 + 前端 | worktree 内 | 集成测试通过 |
| 7 | 自测验收 | 开发兼任（有测试则独立执行） | worktree 内 | `/agile:run-test` → run-test.md |
| 8 | 验收汇总 | 负责人汇总（前端/后端/产品参与） | stage + worktree | 交叉验收 + AC 验收 → `/agile:review` → review.md（门禁：全通过才可交付，见[验收与发布](/guide/sop/release)） |
| 9 | 交付 | 负责人 | — | PR（代码 + 全部过程文档）→ CI 绿 → squash 合入 main → **从 main 发版/部署生产** |
| 10 | 发布记录 | 负责人 | — | `/agile:release` → release.md（变更清单 + 回滚方案；发布动作人工执行） |
| 11 | 清理 | 负责人 | 主工作区 | `agile worktree remove feat/STO-xxx` |

11 步的逐步展开（每步规则 + 命令 + 产物）见[完整流程（STO）](/guide/sop/full-flow)。

## 贯穿案例设定（虚构）

本板块各页的 📌 实战示例统一使用以下虚构案例，与规则正文明确分隔：

| 案例 | 形态 | 用在 |
|---|---|---|
| **STO-012 会员订单导出**（产品林悦立项，后端大伟任负责人，前端小琪对端） | 完整流程 STO | [完整流程](/guide/sop/full-flow)、[验收与发布](/guide/sop/release) 全程贯穿 |
| STO-013 导出按钮增加批量模式 | STO 轻量 | [轻量通道](/guide/sop/lite) |
| BUG-018 导出 CSV 中文乱码 | BUG | [轻量通道](/guide/sop/lite) |
| BUG-019 导出任务偶发超时无提示 → 升级 STO-014 | 升级出口（换号） | [轻量通道](/guide/sop/lite) |
| OPS-007 Playwright 浏览器版本升级 | OPS | [轻量通道](/guide/sop/lite) |
| `/agile:ui maintain 日期选择器增加范围快捷项` | OPS（组件库维护） | [轻量通道](/guide/sop/lite) |

## 阅读指引

| 页面 | 内容 |
|---|---|
| [初始化](/guide/sop/init) | 架构师一次性交付：workspace、外部仓库、模板、插件、CI/CD |
| [完整流程（STO）](/guide/sop/full-flow) | 11 步生命周期逐步展开：规则 + STO-012 实录 |
| [轻量通道](/guide/sop/lite) | STO 轻量 / BUG / OPS 三形态：判定、填写降级、升级出口与编号变更 + 实战案例 |
| [协作与文档规则](/guide/sop/collab) | 并行防冲突（文件级隔离）、过程文档写作规则 + 并行时间线示例 |
| [验收、发布与纪律](/guide/sop/release) | 验收矩阵与门禁、发布记录与回滚、Git 纪律、发版应急、常见异常 + 实录 |
