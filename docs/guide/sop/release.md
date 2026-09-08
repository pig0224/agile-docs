# 团队协作 SOP · 验收、发布与纪律

## 验收与发布（review / release）

run-test 结论非「不通过」后进入验收期（有条件通过可进）；**门禁：review 全部通过才可交付 PR**。验收结论由人做出，`/agile:review` 负责汇总、门禁判定与记录（**AI 不代验收**）；发布动作由人工执行，`/agile:release` 只做前置检查与记录（**不执行任何发布动作**）。

### 验收矩阵（review）

| 验收项 | 谁 | 在哪 | 时机 |
|---|---|---|---|
| 后端接口交叉验收 | 前端 | worktree / stage | 提测后 |
| 前端页面交叉验收 | 后端 | stage | 提测后 |
| AC 业务验收（逐条） | 产品 | stage 环境 | 交叉验收通过后 |
| 独立测试执行（如有） | 测试 | worktree / stage | 提测后 |

- 验收**串行**进行；`/agile:review` 生成验收矩阵与未闭环清单，结论只登记人给出的内容（诚实原则：未验收不标通过）
- **门禁判定**：矩阵全部通过 → 「可交付 PR」；存在未闭环项 → 修复（缺陷走 `/agile:fix-bug`）后重新执行 run-test 与对应验收
- 轻量通道（[STO 轻量 / BUG / OPS](/guide/sop/lite)）降级：一行验收确认记录（报告人确认修复生效 / 提需求人确认 / 负责人自查），不强制矩阵

### 发布记录（release）

**顺序不变：合并先于发版**——PR 合入 main → 从 main 部署 stage / 生产（main 始终对应生产运行中的代码）。

| 动作 | 执行者 | 说明 |
|---|---|---|
| 前置检查 | `/agile:release`（只读） | review 门禁通过、run-test 结论非「不通过」、PR 已合入 main（人工确认） |
| release.md 起草 | `/agile:release` 起草，负责人确认 | 版本/变更清单 + **回滚方案** |
| 合并 / 部署 | **人工** | AI 不执行任何发布动作 |
| 发布后登记 | `/agile:release` | 部署时间、环境、验证结论 → 闭环；提醒 worktree remove |

**回滚方案必备要素**（缺一不算完成）：回滚目标（版本/提交）、回滚步骤、数据影响与处理、回滚后验证点——按本次变更内容起草，不得简化为仅写「回滚上个版本」。

## Git 纪律（全员遵守）

1. **main 禁止直推**——一切变更走 PR，CI 绿才能合；PR 标题与描述均写清需求编号
2. commit message 遵循 **Conventional Commits**：`feat:` 新功能 / `fix:` 修复 / `feat!:` 破坏性
3. 依赖升级一律走 Dependabot PR，不手改 lockfile
4. 不 force push、不删除他人分支

## 发版与应急（运维）

```bash
npm run release        # 质量门 → 自动 CHANGELOG → 建议版本号 → commit + tag + push → CI 发 npm
```

- 版本号自动建议：破坏性（`feat!:`/`BREAKING CHANGE:`）→ major；feat → minor；其余 → patch
- 发布失败脚本自动回退（revert 发版提交 + 删 tag）；npm 已有该版本时提示人工处置
- 线上应急：`npm dist-tag add fcc-agile-cli@<旧版本> latest`；正式修复以前向修复（forward-fix）跟进
- 插件 / 模板 / 文档站：**push 即发布**，无发版动作

## 常见异常

| 现象 | 处置 |
|---|---|
| worktree create 报「没有首次提交」 | 先完成骨架的初始提交 |
| sync 报「无法快进到远端」（分叉） | 进入外部目录人工 merge/rebase 处理，**禁止 force push / reset** |
| sync 提示「存在未提交改动，跳过更新」 | 外部目录本地改动优先——提交或 stash 后再 sync |
| worktree 目录残留 | `agile worktree remove <分支> --force` |
| 模板仓库不可达 | `init project` 不带 `--template` 先建空项目 |
| 需求取消 | 保留分支至下个迭代（需求档案不丢），或补 docs-only PR 归档后删分支 |
| 需求变更 | 产品重新定稿 → 负责人重新 sync-req + 更新 design.md → 知会对端 |
| 轻量通道修复中发现业务行为变化 | 停止轻量流程，补全文档转完整流程（产品立项 STO，见[升级出口](/guide/sop/lite)） |
| 验收期发现新缺陷 | `/agile:fix-bug` 修复后重新执行 run-test 与 review 门禁 |

---

## 📌 实战示例：STO-012 验收与发布（虚构）

### 验收矩阵（`/agile:review STO-012` 生成的 review.md 摘录）

| 验收项 | 验收人 | 环境 | 结论 | 时间 |
|---|---|---|---|---|
| 后端接口交叉验收 | 小琪（前端） | stage | 通过 | 09-06 14:20 |
| 前端页面交叉验收 | 大伟（后端） | stage | 通过 | 09-06 15:02 |
| AC 业务验收（AC1–AC3 逐条） | 林悦（产品） | stage | 通过（AC1/2/3 全勾） | 09-06 16:40 |
| 独立测试执行 | —（无专职测试） | — | 本变更由开发兼任 + 产品 stage 兜底 | — |

门禁判定：**全通过 → 可交付 PR**。

### release.md 回滚方案（四要素实例）

| 要素 | 内容 |
|---|---|
| 回滚目标 | 回滚至合并前提交 `a1b2c3d`（导出功能引入前） |
| 回滚步骤 | 部署系统将 order-service 回滚镜像 tag `v20260906.3` → `v20260905.7`；前端回滚静态资源版本 |
| 数据影响与处理 | 导出任务表新增记录为追加型，回滚后残留任务行不影响旧逻辑；下载对象存储文件保留 30 天自动过期，无需清理 |
| 回滚后验证点 | 订单列表页正常打开；`/api/orders/export` 返回 404（属预期，功能已回滚）；CSV 历史下载链接 30 天内仍可访问 |

### commit message 实例

```text
feat: STO-012 会员订单导出

- 后端：导出任务状态机（pending/done/timeout）+ 导出/查询接口
- 前端：列表页导出按钮 + 轮询下载 + 超时提示
- 过程文档：process-docs/STO-012（design/gen-test/run-test/review/release）
```
