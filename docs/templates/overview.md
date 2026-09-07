# 模板概览

项目模板以独立 git 仓库（[agile-templates](https://github.com/pig0224/agile-templates)）分发——`registry.json` 声明全部模板，**新增模板无需升级 CLI**。CLI clone 该仓库读取注册中心，模板源地址可换成团队私有仓库。

## 使用

```bash
agile template list                                          # 列出单例模板与组合模板（默认读本地缓存）
agile template update                                        # 强制刷新缓存（agile sync 也会刷新）
agile init project --name my-lib                             # 空项目骨架（--name 必填；不访问注册中心）
agile init project --template go-service                     # 单例模板（缺省 --name 用单例项目名称）
agile init project --template admin-base --name backend=be   # 组合模板（--name 组合项目名称=目录名，可重复）
```

命令参数与重跑防护的权威说明见 [init project（命令参考）](/guide/commands#agile-init-project)。

模板源固定读 `.agile/settings.json` 的 `templates.registry`（默认官方源；`agile config set template-repo <git-url>` 可换团队私有仓库）。

AI 陪同建项目（撞名核对 + 成员目录命名问答 + 项目约定问答定制 + 团队库匹配确认）用插件命令 `/agile:init`，见[插件命令详解](/plugin/commands)。

## 仓库布局

```
agile-templates/
├── registry.json               # 注册中心 v2：singles / solutions 全数组（+ registry.schema.json 编辑器校验）
├── singles/                    # 单例模板：一个模板一个完整项目骨架
│   └── <模板名>/               # 目录名 = 模板名（= 单例项目名称）
└── solutions/                  # 组合模板：一组合一目录，成员 = 组合专属完整模板骨架
    └── <组合名>/
        ├── CLAUDE.md           # 组合根导航：组合定位 / 成员清单 / 耦合资产导航
        ├── docs/               # 跨成员耦合的约定/规范/知识归总处（frontmatter「类型: tech|product」）
        └── <成员名>/           # 成员名 = 组合项目名称
```

## 模板类别

两类模板**同等公民**，生成后均**平铺落盘** `projects/<目录名>/`（无系统目录层级）：

| | 单例模板 | 组合模板 |
|---|---|---|
| registry 登记 | `singles` 数组 | `solutions` 数组（条目内含 `projects` 成员数组） |
| 构成 | 一个完整项目骨架 | 组合根两件套（`CLAUDE.md` + `docs/`）+ N 个组合专属完整成员骨架 |
| 规范名称 | 单例项目名称（= 模板名） | 组合名 + 各成员的组合项目名称 |
| init 产物 | `projects/<目录名>/` 一个项目 | `projects/<成员目录名>/` 平铺多个项目 + `.agile/solutions/<组合名>/` 快照 |
| 适用场景 | 单个服务 / 库 / 应用 | 前后端一体的系统（成员间有耦合约定） |

### 单例模板

一个模板 = 一个完整项目骨架：自带可运行测试（TDD 起点）、写明运行/测试命令的 README（CLI 与插件依赖此约定执行测试），并内置**项目级规范骨架三文件**（`CLAUDE.md` / `docs/conventions.md` / `docs/architecture.md`），`init project` 生成项目时随模板带出，作为项目级规范入口。前端模板另附 `docs/ui.md`——项目级 UI 设计约定骨架（token 清单 / 管理方式 / 使用规则，非强制），经 `/agile:init` 约定问答填充。

```bash
agile init project --template go-service              # 缺省 --name：目录名 = 单例项目名称 go-service
agile init project --template go-service --name order # --name 裸值：目录名 = order
```

### 组合模板

组合模板是单例模板之上的**声明式组合层**（registry.json 可选 `solutions` 数组），一次 `init project` 平铺生成全部成员项目。**成员是组合专属的完整模板骨架**（`solutions/<组合名>/<成员名>/`，不引用 singles）——可为同一职责域在不同组合里做差异化定制（规范骨架三文件、前端 `docs/ui.md` 照常带出）：

```bash
agile init project --template admin-base --name backend=admin-backend
# → projects/admin-backend/ + projects/frontend/（成员平铺）
agile init project --template admin-base   # 缺省 --name：各成员用组合项目名称（backend / frontend）
```

- **`--name <组合项目名称>=<目录名>`** 可重复，自定义成员落地目录名（缺省 = 组合登记的成员名）
- **组合根耦合资产**：跨成员共享的约定/规范/知识归总在组合根 `CLAUDE.md`（组合导航）+ `docs/`（每篇 frontmatter 标 `类型: tech|product`），**不写进成员项目**——成员平铺后知识散落 `projects/` 会违背 workspace「1 根 5 抽屉」范式。全部成员生成成功后，CLI 自动把两件套快照到 `.agile/solutions/<组合名>/`（与生成清单一同 git add 入库；快照已存在则跳过不覆盖）；随后用 `/agile:knowledge sync-template` 按类型同步进抽屉（tech → biz-tech-docs，product → biz-product-docs）
- **命名硬约束**：模板名 / 组合名 / 成员名三段全局唯一（成员平铺落盘 `projects/` 后直接占用顶层目录名）；组合登记与成员目录双向一致（CLI 与模板仓 check.mjs 双重校验）

重跑防护（清单一致 → 跳过补缺 / 不符 → 硬错误 / 空目录放行）与事务生成语义见 [init project（命令参考）](/guide/commands#agile-init-project)。

## 占位符

脚手架生成时对文本文件**与目录名**做替换：

| 占位符 | 替换为 | 示例 |
|---|---|---|
| <span v-pre>`{{name}}`</span> | **实际落地目录名**（单例 = `--name` 裸值或单例项目名称；组合成员 = 平铺后的成员目录名） | `order-service` |
| <span v-pre>`{{safeName}}`</span> | 小写字母数字折叠段 | Java 包名 `com.example.orderservice` |

<span v-pre>`{{name}}`</span> 恒等于实际落地目录名——平铺目录名全局唯一，包名天然唯一。

## 缓存机制

CLI 把模板仓库克隆到 `~/.agile/templates/<url哈希>`（用户级只读副本，跨 workspace 共享）：

- `template list` / `init project` 默认**读本地缓存**（不联网）；`agile template update` 或 `agile sync` 才联网 `fetch + reset` 刷新
- 失联降级：网络失败且有缓存 → 使用缓存并提示 stale
- 本地目录直读：`templates.registry` 指向本地目录时直接读取（开发模板时用，不走缓存）

## 私有模板源

团队可 fork 官方仓库或自建模板源（根目录有 `registry.json` + `singles/` 布局即可），换源用 `agile config set template-repo <git-url>`。搭建与发布流程见 [模板发布](/templates/publishing)。
