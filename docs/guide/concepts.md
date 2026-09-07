# 核心概念

## 一个根、五个抽屉

fcc-agile 的工作区（workspace）是一个**单一 git 仓库**，内部按「抽屉」组织知识：

```
workspace/                     # 单一 git 仓库（团队）
├── .agile/
│   ├── settings.json          # 唯一配置（抽屉路径 / 外部仓库 / 插件 / 模板源）
│   ├── manifests/             # 生成清单（init project 断点续建防护；随仓库入库）
│   └── solutions/             # 组合模板耦合资产快照（init project 带出；/agile:knowledge sync-template 按类型同步进抽屉二/三）
├── .gitignore                 # 忽略 .worktrees/、tech-specs/；biz-tech-docs 登记后由 sync 自动补写
├── .gitattributes             # 换行符统一（init workspace 生成）
├── tech-specs/                # 抽屉一：公司级技术规范（独立 git 仓库，不入库，sync 拉取）
├── biz-tech-docs/             # 抽屉二：团队技术设计知识库（workspace 内普通目录，随仓库提交；多 workspace 团队登记为外部仓库后由 agile sync 管理、不入库）
├── biz-product-docs/          # 抽屉三：产品设计知识库（普通目录）
├── projects/                  # 抽屉四：项目代码（普通目录；单例与组合模板成员项目全部平铺）
└── process-docs/              # 抽屉五：过程产物（STO-xxx 需求档案）
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
- **外部资源不入库**：由团队之外维护或需跨 workspace 共享的仓库不进 workspace 版本管理——目录写入 `.gitignore`，各自是独立 git 仓库，由 `agile sync` clone / 快进拉取。当前登记两类：
  - **tech-specs**：公司级规范仓库——跨团队共享、团队无写权限
  - **biz-tech-docs**（可选登记）：团队技术知识库——单 workspace 团队无需登记，它是 workspace 内普通目录，随仓库提交、版本管理天然具备；团队有**多个 workspace** 时登记为外部仓库共享，保持单一事实源（`agile config set biz-tech-docs <url>` + `agile sync`，骨架目录自动让位，忽略行由 sync 自动补写），此后沉淀产物的提交在库仓内人工完成

::: warning 可写工作区
已登记的 tech-specs / biz-tech-docs 目录是**可写工作区**（如 `/agile:knowledge` 直接落盘）。因此 sync 一律**本地优先**：有未提交改动（dirty）就跳过绝不覆盖、只 pull 不 reset、与远端分叉报人工处理。
:::

## settings.json：唯一配置

`.agile/settings.json` 是工作区的唯一配置文件——抽屉路径、外部仓库、插件依赖、模板源全部在此声明：

```json
{
  "version": 2,
  "name": "my-workspace",
  "created": "2026-09-01",
  "paths": {
    "techSpecs": "tech-specs",
    "bizTechDocs": "biz-tech-docs",
    "bizProductDocs": "biz-product-docs",
    "projects": "projects",
    "processDocs": "process-docs"
  },
  "repos": {
    "techSpecs": { "url": "git@gitlab.corp:specs/tech-specs.git" },
    "bizTechDocs": { "url": "git@gitlab.corp:kb/tech-docs.git" }
  },
  "plugins": {
    "marketplace": "https://github.com/pig0224/agile-plugins.git",
    "dependencies": { "agile": { "marketplace": "fcc" } }
  },
  "templates": {
    "registry": "https://github.com/pig0224/agile-templates.git"
  }
}
```

- `version` 为 settings 结构版本：当前为 2；1 为 2.0.x 存量，读取时自动兼容（内存归一为 2，下次写盘自然升级）
- `repos` 两键均可缺省（不登记的资源由 sync 提示 `agile config set <key> <git-url>`）；`ref` 为版本锁定预留——出现即警告「锁定暂未实现，按最新拉取」，不阻断
- `repos.*.url`、`plugins.marketplace`、`templates.registry` 用 `agile config set/get/unset` 管理（快捷键 `tech-specs` / `biz-tech-docs` / `plugin-repo` / `template-repo`，类 npm 换源体验；分发源两键 unset 恢复内置官方源）——**换配置即换源**
- 旧版三 yaml（`workspace.yaml` / `registry.yaml` / `plugin.yaml`）由 `agile init workspace` 自动迁移合并进 settings.json（旧文件保留，提示人工 `git rm`）

## 过程产物（STO-xxx 需求档案）

`process-docs/<需求编号>/` 是一个需求的完整档案（9 个 .md：附录 A 模板创建 7 个 + gen-test / run-test 两份阶段产物）：

| 文档 | 内容 | 由谁填充 |
|---|---|---|
| `requirement.md` | 需求说明与验收标准（AC） | 负责人（/agile:prd + /agile:sync-req） |
| `design.md` | 技术设计（方案、接口设计） | 负责人（/agile:architect） |
| `implementation.md` | 实施主文件：任务分配表（design 冻结时填写，之后只读）+ 联调约定 | 负责人建骨架 |
| `implementation-be.md` | 后端任务清单、TDD 循环记录、变更清单（**后端专属**） | 后端（/agile:backend） |
| `implementation-fe.md` | 前端任务清单、测试记录、变更清单（**前端专属**） | 前端（/agile:frontend） |
| `gen-test.md` | 测试案例（Stage 1，分「后端用例/前端用例」两节） | 开发兼任/测试（/agile:gen-test） |
| `run-test.md` | 测试验收报告（Stage 2） | 开发兼任/测试（/agile:run-test） |
| `review.md` / `release.md` | 评审与发布记录 | 负责人汇总 |

> **文件级隔离**：前后端并行开发（同一需求分支）时各写各的角色文件，git 合并零冲突。团队协作详见[团队协作 SOP · 协作与文档规则](/guide/sop/collab)。

目录无 CLI 命令——由创建它的插件命令（/agile:sync-req、/agile:fix-bug 等）按 sdd-tdd-method SKILL 附录 A 模板直接创建（幂等：已存在的文件不覆盖）。

## 自动同步

| 时机 | 行为 |
|---|---|
| `agile worktree create <branch>` | 创建开发环境前、后各自动 sync 一次（主仓拉外部资源；worktree 内独立 clone 外部仓库；失败仅警告不阻塞） |
| 手动 `agile sync` | 幂等收敛，随时可跑；`--dry-run` 先看计划 |
| `agile sync --dry-run` | 只输出将执行的动作，不落盘 |

## 模板缓存

CLI 把模板注册中心仓库克隆到 `~/.agile/templates/<url哈希>`（用户级、跨 workspace 共享的只读副本）：

- `template list` / `init project` 默认**读本地缓存**（不联网）；`agile template update` 或 `agile sync` 时才 `fetch + reset` 刷新
- 刷新时失联则降级使用本地缓存（提示 stale）
- `templates.registry` 指向本地目录时直接读取（开发模板时用，不走缓存）

## 生态三仓

| 仓库 | 分发 | 职责 |
|---|---|---|
| [agile-cli](https://github.com/pig0224/agile-cli) | npm（`fcc-agile-cli`） | CLI 本体 |
| [agile-plugins](https://github.com/pig0224/agile-plugins) | git | Claude Code 插件市场 |
| [agile-templates](https://github.com/pig0224/agile-templates) | git | 项目模板注册中心 |

三者解耦：新增插件/模板只改对应 git 仓库。
