# 核心概念

## 工作区里有什么

FCC-Agile 的工作区（workspace）是团队研发内容的存放处，`agile init workspace` 一次初始化即包含五类目录：

```
workspace/
├── .agile/
│   ├── settings.json          # 统一配置（目录路径 / 外部资源 / 插件 / 模板源）
│   ├── manifests/             # 项目生成清单（init project 自动维护）
│   └── solutions/             # 组合模板耦合资产快照（init project 自动带出）
├── tech-specs/                # 公司级技术规范
├── biz-tech-docs/             # 团队技术设计知识库
├── biz-product-docs/          # 产品设计知识库
├── projects/                  # 项目代码（全部平铺一层）
└── process-docs/              # 过程产物（STO-xxx 需求档案）
```

| 目录 | 放什么 | 谁在用 |
|---|---|---|
| `tech-specs/` | 公司级技术栈/SQL/安全硬规范 | 全员沉淀（重大变更走提案） |
| `biz-tech-docs/` | 架构/状态机/技术方案/工程规范 | 团队架构师 |
| `biz-product-docs/` | PRD 模板/产品规范/UI 规范 | 产品 |
| `projects/` | 前后端项目代码 | 开发 |
| `process-docs/` | 按需求编号归档的过程文档 | 全员 |

## 内容集中一处

全部内容同在一个工作区，直接好处有两个：

- 跨模块变更一次提交完成——前后端代码与过程文档一起提交、一起评审
- 目录级权限用托管平台原生的 **CODEOWNERS** 配置即可

## 外部资源

tech-specs 与 biz-tech-docs 可登记为外部资源：地址写进配置后由 `agile sync` 自动拉取更新；未登记时它们是 workspace 内普通目录，随仓库提交：

- **tech-specs**（可选）：公司级规范——日常条款经 `/agile:knowledge` 直接沉淀（重大变更走 `biz-tech-docs/proposals/` 提案）；多 workspace 团队登记一次（`agile config set tech-specs <url>` + `agile sync`），共享同一份
- **biz-tech-docs**（可选）：团队知识库——单 workspace 团队无需登记，作为普通目录随工作区维护；多个 workspace 共用时登记一次（`agile config set biz-tech-docs <url>` + `agile sync`），此后各 workspace 共享同一份

::: warning 本地改动优先
已登记为外部资源的目录，其未提交改动会被保留：sync 检测到即跳过、不覆盖；与远端分叉时暂停并提示人工处理。
:::

## settings.json：唯一配置

`.agile/settings.json` 是工作区的唯一配置文件——目录路径、外部资源、插件依赖、模板源全部在此声明：

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

- `version` 为 settings 结构版本：当前为 2；1 为 2.0.x 存量，读取时自动兼容（下次写盘自然升级）
- `repos` 两键均可缺省（不登记的资源由 sync 提示 `agile config set <key> <git-url>`）；`ref` 为版本锁定预留——出现即警告「锁定暂未实现，按最新拉取」，不阻断
- `repos.*.url`、`plugins.marketplace`、`templates.registry` 用 `agile config set/get/unset` 管理（快捷键 `tech-specs` / `biz-tech-docs` / `plugin-repo` / `template-repo`，操作方式与 npm 换源一致；分发源两键 unset 恢复内置官方源）——**换配置即换源**
- 旧版三 yaml（`workspace.yaml` / `registry.yaml` / `plugin.yaml`）由 `agile init workspace` 自动迁移合并进 settings.json，旧文件确认无误后可删除

## 过程产物（STO-xxx 需求档案）

`process-docs/<需求编号>/` 是一个需求的完整档案（9 个 .md：按统一模板创建 8 个——五文档 + 两份角色卫星文件 + gen-test.md 骨架；run-test.md 由验收阶段产出）：

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

> **文件级隔离**：前后端并行开发时各写各的角色文件，互不覆盖。团队协作详见[团队协作 SOP · 协作与文档规则](/guide/sop/collab)。

目录由创建它的插件命令（/agile:sync-req、/agile:fix-bug 等）按统一模板自动创建（已存在的文件不覆盖）。

## 自动同步

| 时机 | 行为 |
|---|---|
| `agile worktree create <branch>` | 创建开发环境前、后各自动 sync 一次（失败仅警告，不阻塞创建） |
| 手动 `agile sync` | 幂等收敛，可随时执行；`--dry-run` 先查看计划 |
| `agile sync --dry-run` | 只输出将执行的动作，不落盘 |

## 模板缓存

模板的本地缓存位于 `~/.agile/templates/<url哈希>`（本机所有 workspace 共用）：

- `template list` / `init project` 默认读本地缓存（不联网）；`agile template update` 或 `agile sync` 时才刷新
- 刷新时失联则继续使用本地缓存（提示 stale）
- `templates.registry` 指向本地目录时直接读取（开发模板时用，不走缓存）

## 生态三仓

| 组件 | 更新方式 | 职责 |
|---|---|---|
| [agile-cli](https://github.com/pig0224/agile-cli) | npm（`agile update`） | CLI 本体 |
| [agile-plugins](https://github.com/pig0224/agile-plugins) | `agile plugin update` | Claude Code 插件市场 |
| [agile-templates](https://github.com/pig0224/agile-templates) | `agile template update` | 项目模板注册中心 |

三者独立更新：新增插件或模板不需要升级 CLI。
