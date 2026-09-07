# 模板概览

项目模板以独立 git 仓库（[agile-templates](https://github.com/pig0224/agile-templates)）分发——`registry.json` 声明全部模板，**新增模板无需升级 CLI**。CLI clone 该仓库读取注册中心，模板源地址可换成团队私有仓库。

## 使用

```bash
agile template list                     # 列出全部模板与组合模板（默认读本地缓存）
agile template update                   # 强制刷新缓存（agile sync 也会刷新）
agile init project <name> --template <模板名>   # 不带 --template 则创建空项目骨架（不访问注册中心）
agile init project <系统标签> --template <组合名>  # 组合模板平铺生成全部成员项目（--member 成员名=目录名 改成员目录名）
```

模板源固定读 `.agile/settings.json` 的 `templates.registry`（默认官方源；`agile config set template-repo <git-url>` 可换团队私有仓库）。

AI 陪同建项目（撞名核对 + 成员目录命名问答 + 项目约定问答定制 + 团队库匹配确认）用插件命令 `/agile:init`，见[插件命令详解](/plugin/commands)。

## 仓库布局

```
agile-templates/
├── registry.json               # 注册中心 v2：singles / solutions 全数组（+ registry.schema.json 编辑器校验）
├── singles/                    # 单例模板（一个模板一个完整项目骨架，目录名 = 模板名）
│   ├── vue3-vite/  react-vite/  go-service/  java-springboot/  node-lib/
└── solutions/                  # 组合模板：一组合一目录，成员 = 组合专属完整模板骨架
    └── <组合名>/
        ├── CLAUDE.md           # 组合根导航：组合定位 / 成员清单 / 耦合资产导航
        ├── docs/               # 跨成员耦合的约定/规范/知识归总处（frontmatter「类型: tech|product」）
        └── <成员名>/
```

## 内置模板

| 模板名 | 说明 | 技术栈 |
|---|---|---|
| `vue3-vite` | Vue 3 + Vite + TypeScript 前端项目 | TypeScript / Vue |
| `react-vite` | React 19 + Vite + TypeScript 前端项目 | TypeScript / React |
| `go-service` | Go HTTP 服务（net/http 标准库） | Go |
| `java-springboot` | Spring Boot 3（Java 21, Maven）服务 | Java / Spring Boot |
| `node-lib` | Node.js（TypeScript）库项目 | TypeScript / Node |

每个模板自带可运行测试（TDD 起点）与写明运行/测试命令的 README——CLI 与插件依赖此约定执行测试。每模板还内置**项目级规范骨架三文件**（`CLAUDE.md` / `docs/conventions.md` / `docs/architecture.md`），`init project` 生成项目时随模板带出，作为项目级规范入口；开发新模板（单例或组合）可用插件命令 `/agile:add-template`，反向把 workspace 既有项目（含沉淀的规范与知识）一键打包为模板则用 `/agile:share-template`（见[模板开发指南](/templates/dev-guide#从-workspace-项目打包模板)）。前端模板（vue3-vite / react-vite）另附 `docs/ui.md`——项目级 UI 设计约定骨架（token 清单 / 管理方式 / 使用规则，非强制），经 `/agile:init` 约定问答填充。

## 组合模板

组合模板是单模板之上的**声明式组合层**（registry.json 可选 `solutions` 数组），一次 `init project` 平铺生成全部成员项目。与单模板的关键差异：**成员是组合专属的完整模板骨架**（`solutions/<组合名>/<成员名>/`，不引用 singles）——可为同一职责域在不同组合里做差异化定制：

```bash
agile init project 通用后台 --template admin-base --member backend=admin-backend
# → projects/admin-backend/ + projects/frontend/（成员平铺；<系统标签> 仅为输出汇报，不落目录）
```

- **成员平铺落盘** `projects/<成员目录名>/`（无系统目录、无系统级 README）；`<系统标签>` 仅用于输出汇报
- 成员模板 = `solutions/<组合>/<成员>/`（组合专属完整骨架：规范骨架三文件、`docs/ui.md`（前端）、占位符替换全部生效）
- `--member 成员名=目录名` 可重复，自定义成员落地目录名（缺省 = 组合定义的成员名）
- **组合根耦合资产**：跨成员共享的约定/规范/知识归总在组合根 `CLAUDE.md`（组合导航）+ `docs/`（每篇 frontmatter 标 `类型: tech|product`），**不写进成员项目**——成员平铺后知识散落 `projects/` 会违背 workspace「1 根 5 抽屉」范式。全部成员生成成功后，CLI 自动把两件套快照到 `.agile/solutions/<组合名>/`（与生成清单一同 git add 入库；快照已存在则跳过不覆盖）；随后用 `/agile:knowledge sync-template` 按类型同步进抽屉（tech → biz-tech-docs，product → biz-product-docs）
- **命名硬约束**：模板名 / 组合名 / 成员名三段全局唯一（成员平铺落盘 `projects/` 后直接占用顶层目录名）；组合登记与成员目录双向一致（CLI 与模板仓 check.mjs 双重校验）
- **补缺语义与生成清单**：每次成功生成成员后，CLI 在 workspace 写生成清单 `.agile/manifests/<成员目录名>.json`（随项目 git add 入库）。重跑时：清单一致 → 跳过 + warn（组合定义演进后可后补成员）；清单不符（缺文件/多文件，疑似上次 init 中途失败的残留）→ 硬错误，删除该目录重跑或 `--force` 重生成；无清单的陌生目录（同名普通项目、手写项目、旧版 CLI 生成）→ 维持跳过 + warn 人工核对（`/agile:init` 生成前会先做撞名核对）。`--force` 重建仅对有清单的目录生效（陌生目录拒绝以防误删）。补缺按本次的有效成员目录名判定，覆盖过的成员须带相同 `--member`

## 占位符

脚手架生成时对文本文件**与目录名**做替换：

| 占位符 | 替换为 | 示例 |
|---|---|---|
| <span v-pre>`{{name}}`</span> | **实际落地目录名**（保留大小写与连字符） | `Order-Service` |
| <span v-pre>`{{safeName}}`</span> | 小写字母数字折叠段 | Java 包名 `com.example.orderservice` |

组合成员项目的 <span v-pre>`{{name}}`</span> = 平铺后的实际目录名（`--member` 覆盖生效后的目录名）——平铺目录名全局唯一，包名天然唯一。

## 缓存机制

CLI 把模板仓库克隆到 `~/.agile/templates/<url哈希>`（用户级只读副本，跨 workspace 共享）：

- `template list` / `init project` 默认**读本地缓存**（不联网）；`agile template update` 或 `agile sync` 才联网 `fetch + reset` 刷新
- 失联降级：网络失败且有缓存 → 使用缓存并提示 stale
- 本地目录直读：`templates.registry` 指向本地目录时直接读取（开发模板时用，不走缓存）

## 私有模板源

```json
// .agile/settings.json
{
  "templates": {
    "registry": "git@gitlab.corp:team/agile-templates.git"
  }
}
```

团队可 fork 官方仓库或自建：只要根目录有 `registry.json` + `singles/`（单例模板）布局，即可作为模板源（组合模板可选）。
