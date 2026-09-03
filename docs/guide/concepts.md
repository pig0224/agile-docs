# 核心概念

## 一个根、五个抽屉

fcc-agile 的工作区（workspace）是一个**单一 git 仓库**，内部按「抽屉」组织知识：

```
workspace/                     # 单一 git 仓库（团队）
├── .gitmodules                # 仅外部 submodule（由 agile sync 维护）
├── .agile/
│   ├── workspace.yaml         # workspace 元信息
│   ├── registry.yaml          # 外部仓库登记处（唯一事实源）
│   └── plugin.yaml            # 已安装插件登记
├── tech-specs/                # 抽屉一：公司级技术规范（submodule）
├── biz-tech-docs/             # 抽屉二：团队技术设计知识库（普通目录）
├── biz-product-docs/          # 抽屉三：产品设计知识库（普通目录）
├── projects/                  # 抽屉四：项目代码（普通目录，多项目平铺）
└── process-docs/              # 抽屉五：过程产物（STO-xxx 五文档）
```

| 抽屉 | 内容 | 维护角色 |
|---|---|---|
| 一 `tech-specs` | 公司级技术栈/SQL/安全硬规范 | 公司规范团队（跨团队共享，独立演进） |
| 二 `biz-tech-docs` | 架构/状态机/技术方案/工程规范 | 团队架构师 |
| 三 `biz-product-docs` | PRD 模板/产品规范/UI 规范 | 产品 |
| 四 `projects` | 前后端项目代码 | 开发 |
| 五 `process-docs` | 按需求编号归档的过程文档 | 全员 |

## 单仓模式（为什么）

早期设计采用多仓 submodule 解决角色拉取权限隔离，代价是跨模块变更需要多 PR + 指针滚动。最终取舍为**单仓 + 目录治理**：

- 跨模块变更**一个 PR 原子完成**（前后端代码 + 过程文档一起 review）
- 发版 = workspace 仓库打 tag（可目录级 tag 独立发版）
- 角色权限用托管平台原生的 **CODEOWNERS** 目录级 review 权限治理
- 唯一保留的外部 submodule 是 **tech-specs** 这类公司级规范仓库：跨团队共享、团队无写权限、需要锁版本——这正是 submodule + registry 的适用场景

## registry.yaml：唯一事实源

`.agile/registry.yaml` 登记全部外部仓库，sync 把磁盘状态收敛到声明状态（期望 ← 记录 ← 实际三方比对）：

```yaml
version: 1
repositories:
  tech-specs:
    url: git@gitlab.corp:specs/tech-specs.git
    branch: main
    pin: a1b2c3d...        # 可选：固定 commit，sync 精确 checkout
```

- key = submodule 路径（相对 workspace 根）
- `branch`：跟踪分支（PR/发布基线）
- `pin`：锁版本；存在时 sync 精确 checkout 到该 commit

**冲突解决纪律**：registry 是声明式配置，git 冲突时**不要手工解 .gitmodules**——合并 registry 后跑 `agile sync`，其余全部自动收敛。

## workspace.yaml

```yaml
version: 1
name: my-workspace
created: 2026-09-01
defaultBranch: main
paths:                       # 五个抽屉的路径（可自定义）
  techSpecs: tech-specs
  bizTechDocs: biz-tech-docs
  bizProductDocs: biz-product-docs
  projects: projects
  processDocs: process-docs
plugin:
  marketplace: https://github.com/pig0224/agile-plugins.git   # 插件市场
templates:
  registry: https://github.com/pig0224/agile-templates.git    # 模板源
hooks:                        # 项目钩子，match 匹配 projects/<name>
  - match: "projects/frontend-*"
    run: npm install
```

两个 git 源地址（插件市场/模板源）都可换成团队私有仓库——**换配置即换源，CLI 无需发版**。

## 过程产物（STO-xxx 五文档）

`process-docs/<需求编号>/` 是一个需求的完整档案：

| 文档 | 内容 | 由谁填充 |
|---|---|---|
| `requirement.md` | 需求说明与验收标准（AC） | 产品（/agile:prd + /agile:sync-req） |
| `design.md` | 技术设计 | 架构（/agile:architect） |
| `gen-test.md` | 测试案例（Stage 1） | 测试（/agile:gen-test） |
| `implementation.md` | 任务清单与 TDD 循环记录 | 开发（/agile:backend / frontend） |
| `run-test.md` | 测试验收报告（Stage 2） | 测试（/agile:run-test） |
| `review.md` / `release.md` | 评审与发布记录 | 全员 |

目录由 MCP 工具 `agile_task_create` 生成（无 CLI 命令——流程能力归插件）。

## 自动同步

| 时机 | 行为 |
|---|---|
| `agile worktree create <branch>` | 创建开发环境前自动 sync 外部仓库（失败仅警告不阻塞） |
| 手动 `agile sync` | 幂等收敛，随时可跑 |
| `agile doctor` | 检测漂移并报告（不自动改） |

## 模板缓存

CLI 把模板注册中心仓库克隆到 `~/.agile/templates/<url哈希>`（用户级、跨 workspace 共享的只读副本）：

- `template list` / `init project` 默认**读本地缓存**（不联网）；`--refresh` 或 `agile template update` 时才 `fetch + reset --hard` 刷新
- 刷新时失联则降级使用本地缓存（提示 stale）
- `--registry` 传本地目录时直接读取（开发模板时用）

## 生态三仓

| 仓库 | 分发 | 职责 |
|---|---|---|
| [agile-cli](https://github.com/pig0224/agile-cli) | npm（`fcc-agile-cli`） | CLI 本体 + MCP Server |
| [agile-plugins](https://github.com/pig0224/agile-plugins) | git | Claude Code 插件市场 |
| [agile-templates](https://github.com/pig0224/agile-templates) | git | 项目模板注册中心 |

三者解耦：新增插件/模板只改对应 git 仓库，CLI 永不发版。
