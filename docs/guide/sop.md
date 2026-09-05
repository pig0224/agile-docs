# 团队协作 SOP

> 适用：使用 FCC-Agile 工作区的业务研发团队（产品 / 后端 / 前端 / 运维）。
> 角色可兼任（负责人单端完成小需求时，另一端仅参与验收）；**节点顺序不变**。

## 1. 角色说明

### 1.1 负责人（需求 Owner）——由后端或前端兼任

- **每条需求指定一个负责人**，按需求性质定：
  - 新接口 / 服务 / 数据类需求 → **后端**任负责人（默认）
  - 纯 UI / 交互 / 纯前端需求 → **前端**任负责人
  - 有争议由运维（或架构会诊）指定
- 承担：接收产品指派（编号已由产品分配）、worktree 创建、需求入仓、技术设计（架构职责内含）、测试案例设计、**一端开发**、最终 PR 提交、验收结论汇总进 review.md
- 不需要另设架构评审节点：小需求负责人自查设计；重大/跨端需求，开工前拉对端 + 产品做 15 分钟设计走查（会话级，结论记入 design.md，不走 PR）

### 1.2 后端

- 承担需求的**后端开发**（负责人兼后端时，即负责人本人）
- 与负责人共用需求分支协作；实施记录只写 `implementation-be.md`
- 参与交叉验收：**验收前端页面**；重大需求参与设计走查

### 1.3 前端

- 承担需求的**前端开发**（负责人兼前端时，即负责人本人）
- 与负责人共用需求分支协作；实施记录只写 `implementation-fe.md`
- 参与交叉验收：**验收后端接口**；重大需求参与设计走查

### 1.4 产品

- 在**仓库内**编写需求文档（`biz-product-docs/requirements/<编号>/`，GitHub Web 或 VS Code 编辑，走 PR 提交），**最低结构要求：背景、目标、验收标准 AC（≥ 1 条）**；写作模板见 `biz-product-docs/templates/PRD模板.md`
- **分配需求编号 STO-xxx**（递增，产品是唯一分配者）并**指定负责人**（后端或前端）
- 开发完成后按 AC 做**业务验收**（stage 环境由运维支持）
- 使用 `/agile:prd` 生成功能树/菜单树属可选增强，非前提

### 1.5 运维

- `npm run release` 发版、CI/CD（分支 CI + stage 自动部署）与分支保护配置、演示/测试环境部署
- 重大需求设计会诊、争议需求指定负责人
- 技术优化类需求（重构/依赖升级/CI 优化）由运维分配编号，前缀 `OPS-xxx`（与业务需求 STO-xxx 号段隔离）

### 1.6 测试 = 两个验收动作（无专职岗位，可插拔）

1. **交叉验收**：前端验后端接口、后端验前端页面
2. **AC 验收**：产品按 requirement.md 验收标准逐条确认（stage 环境）
3. 负责人将结论汇总进 review.md
4. **若有独立测试人员**：开发前先行 `/agile:gen-test`（测试设计前置）；开发提交后独立执行 `/agile:run-test`；没有则由开发兼任 + 产品 stage 验收兜底

### 1.7 AI 协作者（全员适用）

使用 Claude Code 插件（`/agile:xxx` 命令 + agile agent）辅助开发。红线：**AI 不执行 git add**（人工审阅后自行 add）；add 后 AI 可汇总 commit（commit 前确认全部暂存）；**AI 不 push、不发版**。commit message 由 AI 按 Conventional Commits 起草、人工确认。

## 2. 一次性架构初始化（架构师交付）

```bash
agile init workspace                                 # 五抽屉骨架 + .agile 配置 + git 仓库
agile repo add tech-specs <公司规范仓库 URL>          # 登记公司级规范（submodule）
agile repo add biz-tech-docs <团队知识库仓库 URL>     # 可选：多 workspace 团队共享知识库（submodule）
agile sync
agile plugin install agile                           # Claude Code 插件
```

架构师一次性交付：

| 交付物 | 落点 |
|---|---|
| 公司级技术规范 | tech-specs（外部 submodule） |
| 团队技术知识库（多 workspace 时） | biz-tech-docs（登记为 submodule，单一事实源；单 workspace 保持普通目录） |
| 产品文档模板（PRD/AC/功能树/菜单树） | `biz-product-docs/templates/`（init 已内置 PRD 模板） |
| UI / 交互规范 | `biz-product-docs/` |
| 项目模板 | [agile-templates](/templates/overview) 注册中心 |
| **CI/CD**：分支 push 自动 CI + stage 环境自动部署、main 分支保护 | 各项目仓库 / workspace 仓库 |

骨架首次 commit 并 push（worktree 依赖首次提交存在）。**空间纪律**：主工作区（main）只做「收 PR + 发版」，日常开发一律在需求分支的 worktree 进行。

## 3. 需求生命周期（全 worktree 交付）

**原则：一个编号、一个分支、一个 worktree、一个 PR。所有产物（需求文档、设计、测试案例、代码、验收记录）在需求分支累积，交付时随同一个 PR 入 main。main 只接收完整需求。**

| # | 阶段 | 执行人 | 在哪 | 产物 |
|---|---|---|---|---|
| 0 | 需求立项 | 产品 | 仓库内 | `biz-product-docs/requirements/STO-xxx/`（背景/目标/AC）+ **分配编号 + 指派负责人** |
| 1 | 建环境 | 负责人 | 主工作区 | `agile worktree create feat/STO-xxx`，推送远程分支 |
| 2 | 入仓 + 设计 | 负责人 | worktree 内 | `/agile:sync-req`（AC 校验）→ `/agile:architect`（design.md：方案、**接口契约**、任务分配表）→ 推送 |
| 3 | 拉取环境 | 后端 + 前端 | 各自机器 | `agile worktree create feat/STO-xxx`（**自动跟踪已存在的远程分支**） |
| 4 | 测试设计 | 负责人（有测试则测试先行） | worktree 内 | `/agile:gen-test` → gen-test.md（分「后端用例/前端用例」两节） |
| 5 | 并行开发 | 负责人承其一端 + 对端 | 各自本地 | `/agile:backend` ‖ `/agile:frontend`（辅以 ui / bugfix / add-task / feedback），各自写 `implementation-be/-fe.md`，小步推送（自动 CI + stage CD） |
| 6 | 联调 | 后端 + 前端 | worktree 内 | 集成测试通过 |
| 7 | 自测验收 | 开发兼任（有测试则独立执行） | worktree 内 | `/agile:run-test` → run-test.md |
| 8 | stage 业务验收 | 产品 | stage 环境 | 按 AC 逐条确认 |
| 9 | 交付 | 负责人 | — | PR（代码 + 全部过程文档）→ CI 绿 → squash 合入 main → **从 main 发版/部署生产** |
| 10 | 清理 | 负责人 | 主工作区 | `agile worktree remove feat/STO-xxx` |

**两条 SDD/TDD 红线（插件强制）**：无 design.md 不开发；无失败测试不写实现。

**接口变更纪律**：改接口必须先改 design.md 并**知会对端**，再动代码；design.md 单写者 = 负责人，对端不直接改。

**发版与合并顺序**：合并先于生产发版（main 始终等于生产在跑的代码）；「先发版后合并」仅限紧急 hotfix 临时使用。

## 4. 并行协作与防冲突

- **同一需求分支**：负责人推送后，另一端 `agile worktree create` 自动跟踪检出；后 push 者 `git pull --rebase`
- **文件级隔离（防冲突核心）**：后端只写 `implementation-be.md`，前端只写 `implementation-fe.md`；主文件 `implementation.md`（任务分配表）design 冻结后**只读**；gen-test.md 各自只在自己节内补充
- **代码隔离**：projects/ 下各项目目录天然隔离；共享契约产物（openapi / 生成的 types）由后端生成、前端只消费
- **通用纪律**：小步提交、高频 push；不重排他人段落、不做全文批量替换；换行符由 `.gitattributes` 统一为 LF（init workspace 自动生成），杜绝跨平台假冲突

## 5. 过程文档写作规则

| 文件 | 谁写 | 内容 | 规则 |
|---|---|---|---|
| requirement.md | 负责人（sync-req 时并入） | 需求 + AC | 入仓后只读；需求变更 = 产品重新定稿 → 负责人重新 sync |
| design.md | 负责人 | 方案、接口契约、任务分配 | **单一事实源**；变更先改这里 |
| implementation.md | 负责人建骨架 | 任务分配表 + 联调约定 | design 冻结时填写，之后**只读**；只允许 add-task 追加行 |
| implementation-be.md | **仅后端**（无论是否负责人） | 后端任务清单、TDD 循环记录、变更清单 | 前端禁写 |
| implementation-fe.md | **仅前端**（无论是否负责人） | 前端任务清单、测试记录、变更清单 | 后端禁写 |
| gen-test.md | 负责人（或有测试则测试） | 测试范围、案例清单（分后端/前端两节）、数据准备、自动化映射 | 开发期各自只在自己节内补充 |
| run-test.md | 开发兼任（或有测试则测试） | 验收报告 | 诚实原则：未执行不标通过 |
| review.md | 负责人汇总 | 交叉验收 + AC 验收结论 | 验收期才写，验收串行 |
| release.md | 负责人 | 发布记录（如涉及发版） | 发布期才写 |

单端需求：用不到的角色文件写一行「本需求无此端改动」。

## 6. Git 纪律（全员红线）

1. **main 禁止直推**——一切变更走 PR，CI 绿才能合；PR 描述写清需求编号
2. commit message 遵循 **Conventional Commits**：`feat:` 新功能 / `fix:` 修复 / `feat!:` 破坏性
3. 依赖升级一律走 Dependabot PR，不手改 lockfile
4. 不 force push、不删除他人分支

## 7. 发版与应急（运维）

```bash
npm run release        # 质量门 → 自动 CHANGELOG → 建议版本号 → commit + tag + push → CI 发 npm
```

- 版本号自动建议：破坏性（`feat!:`/`BREAKING CHANGE:`）→ major；feat → minor；其余 → patch
- 发布失败脚本自动回退（revert 发版提交 + 删 tag）；npm 已有该版本时提示人工处置
- 线上应急：`npm dist-tag add fcc-agile-cli@<旧版本> latest`；正式修复走 forward-fix
- 插件 / 模板 / 文档站：**push 即发布**，无发版动作

## 8. 常见异常

| 现象 | 处置 |
|---|---|
| worktree create 报「没有首次提交」 | 先把骨架 commit 一次 |
| sync 报分叉（ff-only 失败） | 人工确认后 pin 或 rebase，**绝不 force push** |
| worktree 目录残留 | `agile worktree remove <分支> --force` |
| 模板仓库不可达 | `init project` 不带 `--template` 先建空项目 |
| 需求取消 | 保留分支至下个迭代（需求档案不丢），或补 docs-only PR 归档后删分支 |
| 需求变更 | 产品重新定稿 → 负责人重新 sync-req + 更新 design.md → 知会对端 |
