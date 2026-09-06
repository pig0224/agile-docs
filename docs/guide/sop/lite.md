# 团队协作 SOP · 轻量通道（STO 轻量 / BUG / OPS）

完整流程（[STO 全流程](/guide/sop/full-flow)）只留给「需要产品定稿 PRD/AC」的需求；不需要完整立项的走轻量通道——**负责人自判，PR 描述中声明**（例：`走轻量通道：BUG-012 回归修复`）。

## 两个维度正交

**性质**（编号前缀）决定谁拍板，**深度**（完整 / 轻量）决定文档写多少：

| 形态 | 性质 / 拍板人 | 典型场景 | 编号分配 | 入口 |
|---|---|---|---|---|
| STO 轻量 | 业务需求 / 产品一句话确认 | 独立提出的 mini feat、文案/样式调整 | 产品确认后分配 | `/agile:backend` / `/agile:frontend` |
| BUG | 缺陷 / 无需拍板（回归正确） | 行为与预期不符的修复 | 报告人/负责人顺延 | `/agile:fix-bug`（标准入口） |
| OPS | 技术变更 / 运维拍板 | 重构、依赖升级、日志/配置/CI 微调、组件库维护升级（`/agile:ui maintain`） | 运维顺延分配（前端发起时向运维取号） | `/agile:backend` / `/agile:frontend` |

> **「小」不是 OPS 的判定维度**——文案/样式调整业务可见，归 STO 轻量；OPS 只收纯技术项。

> **编号顺延参照系**：以 `process-docs/` 现有编号为准（全形态统一账本）；`/agile:prd` 自动分配另查抽屉三 `requirements/`（完整需求可能已立项未同步）。`/agile:sync-req` 对用户给的编号强制查重。

> **验收反馈挂靠原需求**：产品按 AC 验收提出的文案/样式调整，直接在原 STO 分支上修、结论记 review.md，随原需求合并——不另开编号；仅独立提出的变更才开新号。

## 目录创建（谁建 process-docs）

目录统一 `process-docs/<编号>/`（七文件结构不变；下表另含 gen-test / run-test 两份阶段产物的轻量填法）。轻量通道不走 `/agile:prd`：

- **STO 轻量 / OPS**：`/agile:sync-req <编号> <一句话需求>` **轻量形态**创建（requirement 落一句话需求 + 1–2 条 AC（STO 轻量）或改动说明（OPS）+ 头部轻量标记）
- **BUG**：`/agile:fix-bug` 创建（无编号时顺延 BUG-xxx 并轻量初始化）

requirement.md 头部的轻量标记（`本变更走轻量通道`）使 `/agile:architect` 等命令自动按轻量深度执行（design.md 三五行简述）。

## 填写降级

| 文件 | 轻量通道填法 |
|---|---|
| requirement.md | 缺陷描述 + 复现步骤（BUG）；一句话需求 + 1–2 条 AC（STO 轻量）；改动说明（OPS） |
| design.md | **根因分析**（BUG）或三五行方案简述（STO 轻量 / OPS）（SDD 红线按此放宽） |
| implementation-be/-fe.md | 修复/改动记录 + **失败测试先行**（TDD 红线不放宽：bug 修复必须先有复现测试 Red→Green） |
| gen-test.md | 一行 `> 本变更走轻量通道，此文档不适用` |
| review.md | **一行验收确认**（`/agile:review` 轻量形态）：报告人确认修复生效（BUG）/ 提需求人确认（STO 轻量）/ 负责人自查（OPS）+ 确认时间 |
| run-test.md | 回归结论（所在仓库全量测试通过） |
| release.md | 涉及部署时 `/agile:release` 记一行（变更 + 回滚点）；不涉及部署不填 |

## 不变的红线

worktree 照建（`feat/<编号>`）、main 禁直推照守、PR 照走（标题与描述均标 `[编号]`）、CI 绿才能合。

## 验收降级

报告人确认修复生效（BUG）/ 提需求人确认（STO 轻量）/ 负责人自查（OPS）；不强制产品 AC 验收与交叉验收。review / release 相应降级（见[验收、发布与纪律](/guide/sop/release)）：一行确认记录；涉及部署时 release.md 记一行（变更 + 回滚点）。

## 编号变更与升级出口

过程中发现影响面超出预期（涉及接口契约 / 数据模型 / 业务行为明显变化）→ 停止轻量通道，补全文档转[完整流程](/guide/sop/full-flow)。目录结构已就位，无需迁移；编号是否更换按下述规则。

**何时换号**：

- **升级出口**：BUG / OPS 经产品确认升级为完整 STO——**换 STO 编号**（新号由产品分配）；STO 轻量升级**编号不变**，只补全文档
- **产品重排**：产品按优先级重排 / 重新分配编号（换号）——较少见，同样走下述纪律

**换号步骤**（**人工主导**——换号是低频高风险操作，全程由人工驱动；AI 仅在被指认时辅助机械步骤如引用替换、文档补全初稿，标 ⛑ 的步骤必须人工）：

1. **分配新编号**——由有分配权者分配（STO = 产品）并**两处查重**（`process-docs/` 与抽屉三 `requirements/`）
2. **知会对端**——对端可能持有旧分支 / 旧 worktree，先知会再动手
3. **过程目录改名**——`git mv process-docs/<旧编号> process-docs/<新编号>`，目录内全部 .md 的编号引用（标题、TDD 循环记录、commit message 引用）批量替换
4. **抽屉三产物改名**——`<bizProductDocs>/requirements/<旧编号>/` 存在则同样 `git mv`（完整需求）
5. **升级出口的深度转换**——删除 requirement.md 头部 `> 本变更走轻量通道` 标记，按完整深度补全 requirement（AC ≥ 1 条）与 design.md（SDD 红线恢复全效）
6. **worktree 换环境**——`agile worktree remove feat/<旧编号>` → `agile worktree create feat/<新编号>`
7. ⛑ **人工收尾**——远程分支改名（push 新分支 + 删旧远程分支）、PR 标题/描述更新、知会对端重新 `agile worktree create feat/<新编号>` 跟踪检出

**换号纪律**：每步经人工确认后执行；**旧编号不回收复用**——避免历史引用歧义。

## 紧急 hotfix（线上事故）

仍走 PR，只是加急——压缩验收范围（复现测试 + 冒烟）、审批人快速 approve；CI 绿 → 合并 main → 从 main 发版的顺序不变。

---

## 📌 实战示例（虚构）

### STO-013（STO 轻量）：导出按钮增加批量模式

1. 产品向负责人确认一句话需求「导出支持勾选批量模式」——STO 轻量立项，编号 STO-013
2. `/agile:sync-req STO-013 导出按钮增加批量模式` 轻量建目录：requirement.md 头部带 `本变更走轻量通道` 标记 + 一句话需求 + AC 1 条（勾选多条时一次导出一个压缩包）
3. `/agile:architect STO-013` 自动按轻量深度：design.md 三五行（复用 STO-012 导出任务，入参加 `ids[]`）
4. TDD 开发 → PR 标题 `feat: STO-013 批量导出（走轻量通道）` → 提需求人一行确认 → 合并

### BUG-018（BUG）：导出 CSV 中文乱码

1. `/agile:fix-bug STO-012 导出 CSV 中文乱码`（挂靠原需求编号）——无独立编号时自动建 BUG-xxx
2. bug-hunter 复现：写失败测试断言 BOM 头（**Red**）→ 根因：流式输出未写 BOM → 最小修复（**Green**）→ design.md 记根因分析
3. 全量回归通过 → run-test.md 记回归结论 → `/agile:review` 轻量形态：报告人一行确认修复生效
4. TDD 红线未豁免：先有复现测试，后写修复

### OPS-007（OPS）：Playwright 浏览器版本升级

1. 运维顺延分配 OPS-007，`/agile:sync-req OPS-007 升级 Playwright 浏览器基线` 轻量建目录（requirement = 改动说明）
2. design.md 三五行：e2e/ 目录浏览器版本升级 + 回归范围
3. worktree 照建、PR 照走（标题标 `[OPS-007]`）、CI 绿 → 负责人自查一行确认 → 合并

### 组件库维护（OPS）：`/agile:ui maintain`

1. `/agile:ui maintain 日期选择器增加范围快捷项`——命令默认引导走 OPS 轻量：`/agile:sync-req OPS-xxx <变更一句话>` 建目录，worktree / PR 照走
2. 升级 = 改实现 + 更新测试 + CHANGELOG 登记；废弃 = deprecated 标记 + 迁移指引
3. **改设计 token 须同步回写项目 `docs/ui.md`**（单一事实源）；grep 组件库引用列出受影响页面与批量验证建议
4. 变更含业务可见行为时提醒升级 STO 轻量

### BUG-019 → STO-014（升级出口换号）：导出任务偶发超时无提示

1. `/agile:fix-bug 导出任务偶发卡在 pending 且无超时提示` 自动建 BUG-019；bug-hunter 写复现测试（**Red**）→ 定位：超时检查仅在任务创建时注册，进程重启后丢失——**根因是导出任务状态机设计缺陷**，修复涉及状态模型与接口契约变化
2. 触发升级出口：停止轻量流程，大伟知会林悦；产品确认升级完整 STO 并分配新编号 **STO-014**（两处查重：`process-docs/` 现有最大 STO-013、抽屉三 `requirements/` 现有最大 STO-012 → STO-014 未占用）
3. 换号步骤 3–5：`git mv process-docs/BUG-019 process-docs/STO-014` + 目录内编号引用批量替换；删除 requirement 头部轻量标记，按完整深度补全——AC 3 条（超时后状态 = timeout 且页面提示 / 服务重启后在途任务恢复超时检查 / 历史任务不受影响）+ design.md（根因分析扩写为状态机方案）
4. `agile worktree remove feat/BUG-019` → `agile worktree create feat/STO-014`；补全的文档走[完整流程](/guide/sop/full-flow)后续步骤（gen-test → 开发 → run-test → review）
5. 人工收尾：远程分支改名、PR 标题 `feat: STO-014 导出任务状态机补超时恢复（原 BUG-019）`；**旧编号 BUG-019 归档不复用**
