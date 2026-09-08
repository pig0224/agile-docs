# 模板开发指南

如何为 agile-templates 仓库开发项目模板。**新增模板无需改动 agile-cli**。

## 仓库结构

```
agile-templates/
├── registry.json               # 注册中心 v2：singles / solutions 全数组（条目 = name + description + language?/framework?）
├── registry.schema.json        # JSON Schema（字段中文说明，编辑器补全校验）
├── singles/                    # 单例模板（一个模板一个完整项目骨架，目录名 = 模板名）
│   └── <模板名>/
├── solutions/                  # 组合模板（可选）：一组合一目录，成员 = 组合专属完整模板骨架
│   └── <组合名>/
│       ├── CLAUDE.md           # 组合根导航（组合定位 / 成员清单 / 耦合资产导航）
│       ├── docs/               # 跨成员耦合的约定/规范归总处（frontmatter「类型: tech|product」）
│       └── <成员名>/
└── scripts/check.mjs           # 自含一致性校验（CI 同款，零依赖；含 JSON 重复键扫描 + 组合根耦合资产）
```

`registry.json`（无 path 字段——目录由名字约定派生：单例 `singles/<name>/`、成员 `solutions/<组合>/<name>/`）：

```json
{
  "$schema": "./registry.schema.json",
  "version": 2,
  "singles": [
    {
      "name": "vue3-vite",
      "description": "Vue 3 + Vite + TypeScript 前端项目",
      "language": ["TypeScript"],
      "framework": ["Vue"]
    }
  ],
  "solutions": [
    {
      "name": "admin-base",
      "description": "通用后台基础系统",
      "projects": [
        { "name": "backend", "description": "后端服务（Go）" },
        { "name": "frontend", "description": "前端应用（Vue 3）" }
      ]
    }
  ]
}
```

条目形状：`name` + 一句话 `description` 必填；`language` / `framework` 为字符串数组（可省略）；**数组顺序 = 展示与生成顺序**；组合 `projects` 成员条目与 singles 同形状。

## 开发流程：四种（按起点选择）

| 流程 | 场景 | 骨架生成方式 |
|---|---|---|
| **A 从零手写单例** | 新技术栈、无相近基座 | 手写 `singles/<模板名>/` 全部内容 |
| **B 派生改造单例** | 有最接近的现有单例（如 `vue3-nuxt` ← `vue3-vite`） | 复制基座 → 清理基座名残留（目录名 / CLAUDE.md 技术栈段 / package name / go.mod module 等身份字段）→ 按新栈定制 |
| **C 上游脚手架引入** | 官方 create-xxx 脚手架产物模板化 | 引入产物 → 精简（删业务示例与个人信息）→ 占位符化（`name` → <span v-pre>`{{name}}`</span>、Java 包名 → <span v-pre>`{{safeName}}`</span>）→ 中立化（去上游品牌）→ 补规范骨架三文件 |
| **D 组合模板** | 一次平铺生成多个成员项目的系统底座（如「营销站 + 控制台 + Mock」） | 成员骨架 = 复制最接近的单例模板作起点（可用 A/B/C 刚建的），做最小组合级定制；仓库无对应技术栈单例的成员按 A 从零手写（依赖版本实查、工程配置对齐上游脚手架形态） |

四流程共用统一收口：**登记 registry.json → `node scripts/check.mjs` → 冒烟验证 → 汇报变更清单**。

**TDD 基线**：无论哪种流程，每个新骨架自带至少一个可运行测试，且骨架阶段即全部通过。**测试通过后、登记前，清理成员/模板目录内的安装与构建产物**（`node_modules` / `.next` / `dist` / `build` / `coverage` / 锁文件等，按栈取实际产生的）——产物不提交，CLI 直读模板仓复制时也不应受产物干扰；清理命令示例见[插件命令详解](/plugin/commands)。

### 新增一个单例模板（流程 A/B/C）：两步收口

1. 按 A/B/C 之一生成骨架：`singles/<模板名>/`，含项目骨架（README + 可运行测试，约定见「模板内容约定」）+ **项目级规范骨架三文件**，测试全部通过
2. 在 `registry.json` 的 `singles` 数组登记（无 path 字段，目录由名字派生）

提交推送后，用户侧 `agile init project --template <模板名> [--name <目录名>]` 即可用（`--name` 命名接口需 CLI ≥ 2.4.0）。AI 协助建设用插件命令 `/agile:add-template`（见下节）。

### 新增一个组合模板（流程 D）

1. 为每个成员新建 `solutions/<组合名>/<成员名>/`——**组合专属完整模板骨架**（复制最接近的单例模板作起点，按组合需求定制；仓库无对应技术栈单例的成员按流程 A 从零手写；成员与 singles 互不引用），同样要求规范骨架三文件
2. 建组合根耦合资产两件套——**跨成员共享的约定/规范/知识归总到这里，不写进成员项目**：`solutions/<组合名>/CLAUDE.md`（组合定位 / 成员清单 / 耦合资产导航）+ `solutions/<组合名>/docs/`（≥1 篇，每篇 frontmatter 标 `类型: tech|product`——`/agile:knowledge sync-template` 按此同步进 biz-tech-docs / biz-product-docs）。归总判据：≥2 成员共享或跨成员协作协议；单成员内部约定留成员项目。组合根资产不做 <span v-pre>`{{name}}`</span> 占位替换
3. 在 `registry.json` 的 `solutions` 数组登记组合（`description` + `projects` 成员数组，**数组顺序 = 生成顺序**）

生成产物为成员**平铺**落盘 `projects/<成员目录名>/`（见[模板概览 · 组合模板](./overview#组合模板)）——因此成员名与模板名/组合名同命名空间，三段必须全局唯一。全部成员生成成功后，CLI 自动把组合根两件套快照到 workspace `.agile/solutions/<组合名>/`（与生成清单一同入库；快照已存在则跳过不覆盖），供 `/agile:knowledge sync-template` 按类型同步进知识库。

AI 协助建设组合模板用插件命令 `/agile:add-template`（流程 D，见下节）——设计问答改问成员构成（含**耦合资产盘点**），成员骨架复制最接近的单例模板作起点。

## AI 辅助建设：/agile:add-template

在 **agile-templates 仓库根目录**（检测 `registry.json` + `scripts/check.mjs` + `singles/` 同时存在）让 Claude Code 执行插件命令；**其他位置（如 workspace 内）拒绝执行**，先 `cd` 到仓库根目录：

```bash
/agile:add-template vue3-nuxt        # 单例模板：指定模板名或技术栈描述（进入 A/B/C 判定）
/agile:add-template admin-base       # 组合模板：进入成员构成问答（流程 D）
/agile:add-template                  # 无参数进入交互式设计问答
```

命令按 SDD/TDD 方法论组织，三道门依次执行：**设计定稿门**（设计问答全部决策经确认后才写盘）→ **测试基线**（骨架阶段测试全部通过）→ **冒烟验收门**（验收清单先行，逐条实际执行）。骨架生成按 A/B/C/D 分支（见上表）→ **registry.json 登记 + `node scripts/check.mjs` 校验** → **冒烟验证**（临时 workspace + 本地模板源执行 `agile init project`，验证占位符替换正确且项目测试可跑——必须实际执行）→ 汇报变更清单。

**流程 D（组合）**：设计问答改问**成员构成**（组合名 + `projects` 成员问答 + 派生起点 + 耦合资产盘点：跨成员共享的约定/规范逐项标注 tech/product）→ 成员骨架复制最接近的单例模板作起点（仓库无对应技术栈单例的成员按**流程 A 从零手写**：依赖版本经 `npm dist-tags` 实查、工程配置对齐上游脚手架形态；`solutions/<组合名>/<成员名>/`，组合专属深度定制按实际需求另行开发）→ 组合根两件套（CLAUDE.md 导航 + docs/ 归总跨成员耦合资产，逐篇标 `类型: tech|product`）→ `solutions` 数组登记 + `node scripts/check.mjs` 校验（双向一致 / 成员名全局唯一 / 组合根耦合资产）→ 冒烟前核实模板目录无安装产物残留 → 冒烟验证成员**平铺**落盘、<span v-pre>`{{name}}`</span> 替换、重跑补缺与组合根两件套快照带出（布局自 2.1.0 引入；生成清单断点续建语义需 ≥ 2.2.0；组合根资产快照带出需 ≥ 2.3.0；`--name` 命名接口需 ≥ 2.4.0）。

要点（详见[插件命令详解](/plugin/commands)）：

- **占位符与 init 语义相反**——模板源码里 <span v-pre>`{{name}}`</span> / <span v-pre>`{{safeName}}`</span> **原样保留**（init 生成项目时才替换）
- **模板中立**：预填默认值只来自模板自身选型与社区惯例，不引入团队知识库条款
- 变更留在本地，推送即发版，由人工完成

## 从 workspace 项目打包模板

方向相反的配套命令：add-template 在模板仓里把想法建成模板（正向建设），`/agile:share-template` 在 workspace 里把**既有项目**（含沉淀的规范与知识）反向打包为模板——解决现有项目共享为模板时需人工搬运的问题。在 agile workspace 内执行（与 add-template 相反，源项目在 `projects/` 下）：

```bash
/agile:share-template order-service            # 单例：指定 projects/ 下目录名
/agile:share-template admin-web order-center   # 组合：多个项目打包成一个组合模板
/agile:share-template                          # 无参扫 projects/ 盘点列候选
```

六步流程：**盘点与目标仓定位**（读 `.agile/manifests/` 标注项目出身；目标仓 = 本地检出的模板仓，`registry.json` + `scripts/check.mjs` + `singles/` 三件识别）→ **方案问答**（打包形态 / 命名（三段全局唯一）/ description / 目标仓形态）→ **清理审计**（三维处置清单：敏感与业务数据剔除脱敏、团队定制公共仓默认中立化·私有仓默认保留、工程卫生一律剔除）→ **打包落盘 + registry.json 登记**（只追加不重排；组合根两件套优先回带 `.agile/solutions/` 快照）→ **校验 + 冒烟**（check.mjs 全绿 + 临时 workspace `init project` 冒烟 + round-trip 对照）→ **汇报移交**。

要点（详见[插件命令详解](/plugin/commands)）：

- **源项目不受影响**：脱敏/中立化/占位符还原等修改全部发生在目标仓副本
- **占位符逆向还原**：init 把占位符替换为真实目录名，本命令做逆向——真实落地目录名改回 <span v-pre>`{{name}}`</span>、安全段改回 <span v-pre>`{{safeName}}`</span>（package.json `name` 严格为 <span v-pre>`{{name}}`</span>；包名/目录名等身份性出现必换，URL/文案等语义性出现逐处判断）
- **沉淀知识去向**：项目内沉淀（conventions / architecture / ui.md / README）随项目打包；跨成员共享规范归总组合根 docs/（使用方经 `/agile:knowledge sync-template` 进知识库）；workspace 知识库内容不直接入模板（模板中立 + 防泄露）

## 导出后如何发布

`/agile:share-template` 产出的只是**本地检出的模板仓变更**（新模板目录 + registry.json 追加条目），发布要靠人工推送。流程与语义同[模板发布](./publishing)：**git 仓库分发，推送即发版**——审阅 AI 汇报的变更清单与处置清单（敏感数据剔除、团队定制中立化是否符合预期）→ `node scripts/check.mjs` 复核全绿 → commit（推荐走 PR）→ push 到 main 即全量上线，使用方刷新缓存即生效。

使用方验证：

```bash
agile template update                          # 刷新缓存（或 agile sync）
agile template list                            # 新模板/组合可见
agile init project --template <模板名或组合名>
```

团队私有分发：把模板仓 fork 或自建后作为私有源（`agile config set template-repo <git-url>`，见[模板概览 · 私有模板源](./overview#私有模板源)），打包进私有仓的模板只对团队可见。注意**目标仓形态决定打包处置默认建议**（公共仓默认中立化团队定制，私有仓默认保留）——打包前先确认目标仓是哪个。

## 命名规范（防冲突五防线）

**模板如何被找到**：条目 `name` = 模板目录名（组合成员 = `solutions/<组合>/<name>/`）——registry 无 path 字段，不存在别名指向。

1. **命名规范**：`^[a-z][a-z0-9-]*$`（小写字母开头，仅小写字母/数字/连字符）
2. **重复即报错**：JSON 重复键由 check.mjs 显式扫描（JSON.parse 对重复键静默取后者）；singles / solutions / 同组合 projects 数组内 name 重复登记均拒绝
3. **目录名 === name**：一个目录一个身份，目录由名字约定派生且必须实际存在
4. **登记与目录双向一致**：登记的模板/成员目录必须实际存在（幽灵登记报错）；组合目录下的子目录必须全部登记进 projects（幽灵成员目录报错，CLI 与 check.mjs 双重；组合根 `docs/` 豁免——耦合资产目录不是成员）；singles/ 与 solutions/ 整体反向——未登记的目录必须全部登记（幽灵单例/幽灵组合报错，仅 check.mjs 强制）
5. **三段全局唯一**：模板名 / 组合名 / 成员名互不重名（init 后全部平铺落盘 `projects/`，同一命名空间）

以上防线由 CLI（`init project` 加载注册中心时校验，不一致即拒绝生成）与仓库 CI（`scripts/check.mjs`）**双重强制**；仅 check.mjs 强制的是：JSON 重复键、未知字段（顶层与条目）、`singles/`/`solutions/` 整体反向完整性与根一级目录白名单。防冲突设计的完整细则见 agile-templates 仓的 [docs/registry.md](https://github.com/pig0224/agile-templates/blob/main/docs/registry.md)。

**命名建议**：模板 `<技术栈/框架>-<变体>`，如 `vue3-vite`、`go-service`、`java-springboot`；扩展示例 `vue3-nuxt`、`go-grpc`、`node-cli`；组合 `<系统域>-<定位>`（如 `admin-base`、`crm-base`）；成员名取职责域（`backend`、`frontend`），避开既有模板名。

## 模板内容约定

- **构建特征文件**（建议，非强制——check.mjs 不校验）：如 `package.json`（Node）、`go.mod`（Go）、`pom.xml`（Maven）、`Makefile`——插件按其发现测试/构建命令（如 test-engineer 读 `package.json` scripts / `Makefile` / `pom.xml` 确定标准测试命令）；非主流栈用等价特征文件即可
- **占位符**：<span v-pre>`{{name}}`</span>（实际落地目录名：单例 = 项目名，组合成员 = 平铺后的成员目录名）、<span v-pre>`{{safeName}}`</span>（小写安全段，Java 包目录如 <span v-pre>`src/main/java/com/example/{{safeName}}/`</span> 用目录名占位也会替换）
- **README**：写清运行/测试命令（CLI 与插件按约定执行测试）
- **至少一个可运行测试**（TDD 起点）
- **项目级规范骨架三文件**（缺一不可，`scripts/check.mjs` 强制校验）：
  - `CLAUDE.md`：项目级入口索引（技术栈 / 命令速查 / 硬规则 / 规范索引）；团队规范段指向 `../../biz-tech-docs/` 并带**「⛔ 栈领域待人工确认」**标记——插件 AI 首次在项目工作时列出 `frameworks/` 实际目录，经人工确认后改写为具体领域
  - `docs/conventions.md`：目录 / 命名 / 测试默认值（如实描述模板初始骨架 + 增长建议）+ 团队补充约定节
  - `docs/architecture.md`：ADR 骨架（背景 / 决策 / 后果三段式）+ ADR-001 初始条目
  - `init project` 生成项目时三文件随模板带出，作为项目级规范入口
- **前端模板附赠 `docs/ui.md`**（vue3-vite / react-vite；**非强制**，check.mjs 不校验——非 UI 需求的项目可无此文件）：项目级 UI 设计约定骨架——token 清单空表（名称/值/用途）、Token 管理方式（CSS 变量 / JS token 文件 / 组件库主题配置）、使用规则、上层规范引用；经 `/agile:init` 约定问答「UI 约定」维度填充（未问到处保留「待定」）。页面原型与实现引用其 token 名；新增/修改 token 必须回写该表（以此为准）
- 模板中立原则：预填默认值只来自模板自身选型与社区惯例，不引入 `frameworks/<栈>/` 条款
- 模板内不要提交 `.git/`、锁文件按团队策略

## 本地开发与调试

```bash
git clone git@github.com:pig0224/agile-templates.git && cd agile-templates
node scripts/check.mjs                          # 一致性校验（无外部依赖）
```

在 workspace 里用本地路径直读（不走缓存）：把 `.agile/settings.json` 的 `templates.registry` 临时指向本地目录即可。

```json
{
  "templates": {
    "registry": "/path/to/agile-templates"
  }
}
```

```bash
agile template list
agile init project --template <你的模板> --name demo
```

本地模板目录含 `node_modules` 等安装/构建产物、符号链接（junction）或锁文件（`pnpm-lock.yaml` 等）亦无影响——CLI ≥ 2.2.0 init 复制时自动忽略并逐项提示，不会进入生成项目（≤ 2.1.0 复制 junction 会直接失败，请先升级）；但模板仓提交入库前仍应清理产物（CI 的 check.mjs 产物黑名单会拦截）。

::: warning
`templates.registry` 指向**本地目录**时直接读取、不走缓存；调试完成后应将该键改回原地址。
:::

## CI

仓库 Check workflow 为 **PR-only 门禁**：仅在 Pull Request 上自动执行 `scripts/check.mjs`，拦截不一致的 registry 与缺失的项目级规范骨架文件（直接 push main 不触发 CI，推送前请先本地跑一遍 `node scripts/check.mjs`）；CLI 侧 `init project` 加载注册中心时同样校验（issues 非空即拒绝生成）。
