# 团队协作 SOP · 并行协作与文档规则

## 并行协作与防冲突

- **同一需求分支**：负责人推送后，另一端 `agile worktree create` 自动跟踪检出；后 push 者 `git pull --rebase`
- **文件级隔离（防冲突核心）**：后端只写 `implementation-be.md`，前端只写 `implementation-fe.md`；主文件 `implementation.md`（任务分配表）design 冻结后**只读**；gen-test.md 各自只在自己节内补充
- **接口契约纪律**：design.md「接口设计」是前后端并行开发的唯一契约（跨接口统一约定表 + 逐接口契约块）——前端 mock 按契约逐字段生成、后端实现按契约；契约要改 → 负责人改 design.md 并知会对端，对方重读对齐后再继续
- **代码隔离**：projects/ 下各项目目录相互隔离；共享契约产物（openapi / 生成的 types）由后端生成、前端只消费
- **通用纪律**：小步提交、高频 push；不重排他人段落、不做全文批量替换；换行符统一为 LF（初始化时自动设置），杜绝跨平台假冲突

## 过程文档写作规则

| 文件 | 谁写 | 内容 | 规则 |
|---|---|---|---|
| requirement.md | 负责人（sync-req 时并入） | 需求 + AC | 入仓后只读；需求变更 = 产品重新定稿 → 负责人重新 sync |
| design.md | 负责人 | 方案、接口契约（跨接口统一约定 + 逐接口契约块）、任务分配 | **以此为准**——并行开发唯一契约依赖；变更先改这里 |
| implementation.md | 负责人（/agile:architect 冻结时填写） | 任务分配表 + 联调约定 | design 冻结（architect 完成填表）后**只读**；只允许 add-task 追加行 |
| implementation-be.md | **仅后端**（无论是否负责人） | 后端任务清单、TDD 循环记录、变更清单 | 前端禁写 |
| implementation-fe.md | **仅前端**（无论是否负责人） | 前端任务清单、测试记录、变更清单 | 后端禁写 |
| gen-test.md | 负责人兼任/测试 | 测试范围、案例清单（分后端/前端两节）、数据准备、自动化映射 | 开发期各自只在自己节内补充 |
| run-test.md | 开发兼任（或有测试则测试） | 验收报告 | 诚实原则：未执行不标通过 |
| review.md | 负责人汇总 | 交叉验收 + AC 验收结论 | 验收期才写，验收串行；`/agile:review` 生成矩阵与门禁判定 |
| release.md | 负责人 | 发布记录（如涉及发版） | 发布期才写；`/agile:release` 起草（含回滚方案） |

单端需求：用不到的角色文件写一行「本需求无此端改动」；轻量通道（[STO 轻量 / BUG / OPS](/guide/sop/lite)）的豁免文档统一填一行「本变更走轻量通道，此文档不适用」。

## 测试脚本与产物归属

- **固化 e2e 脚本**入项目 `e2e/`（长期资产，随页面同 PR 演进，供 `/agile:run-test` 与 stage 冒烟复用；**默认不进 PR CI 门禁**——e2e 依赖浏览器与环境，不稳定且耗时较长，各项目可选择执行关键路径冒烟子集）
- **临时验证/复现脚本**放 `process-docs/<编号>/scripts/`，**严禁放置在 projects/ 下的项目内**
- **运行产物**（`test-results/`、`playwright-report/`、截图、trace）一律不提交（已列入忽略规则）；报告引用的关键截图归档 `process-docs/<编号>/assets/`
- e2e 主要测试工具 **Playwright**，辅助调试 **Chrome DevTools**；项目尚无测试工具时建议引入 Playwright（经负责人确认）

---

## 📌 实战示例：STO-012 并行时间线（虚构）

```text
Day 1  大伟（负责人·后端）
       worktree create feat/STO-012 → sync-req → architect → push
Day 1  小琪（前端）
       worktree create feat/STO-012（自动跟踪远程分支）
       各自开工：大伟只写 implementation-be.md，小琪只写 implementation-fe.md
Day 2  小琪推送页面层 → 大伟后 push 前 git pull --rebase（零冲突：文件级隔离）
Day 3  联调：stage 环境对接真实接口；实现与契约不一致 → 大伟改 design.md + 知会 → 小琪复验
```

正反例（文档规则）：

- ✅ 小琪在 gen-test.md 的「前端用例」节追加 TC-F3（只动自己的节）
- ❌ 小琪把 gen-test.md 全文重排并把后端用例节也改了一遍——违反文件级隔离
- ✅ 实现与契约不一致：大伟先改 design.md 契约（以此为准），再改代码，并知会小琪
- ❌ 小琪直接改 design.md 的接口契约——对端不直接改 design.md
- ✅ 小琪的 mock 数据逐字段按 design.md 契约生成——并行开发只依赖契约，不臆造字段
