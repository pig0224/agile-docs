# 模板开发指南

如何为 agile-templates 仓库开发项目模板。**新增模板不需要动 agile-cli**。

## 仓库结构

```
agile-templates/
├── registry.json               # 注册中心 v2：singles / solutions 全数组（条目 = name + description + language?/framework?）
├── registry.schema.json        # JSON Schema（字段中文说明，编辑器补全校验）
├── singles/                    # 单例模板（一个模板一个完整项目骨架，目录名 = 模板名）
│   ├── vue3-vite/
│   ├── react-vite/
│   ├── go-service/
│   ├── java-springboot/
│   └── node-lib/
├── solutions/                  # 组合模板（可选）：一组合一目录，成员 = 组合专属完整模板骨架
│   └── <组合名>/<成员名>/
└── scripts/check.mjs           # 自含一致性校验（CI 同款，零依赖；含 JSON 重复键扫描）
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
| **D 组合模板** | 一次平铺生成多个成员项目的系统底座（如「营销站 + 控制台 + Mock」） | 成员骨架 = 复制最接近的单例模板作起点（可用 A/B/C 刚建的），做最小组合级定制 |

四流程共用统一收口：**登记 registry.json → `node scripts/check.mjs` → 冒烟验证 → 汇报变更清单**。

**TDD 基线**：无论哪种流程，每个新骨架自带至少一个可运行测试，且骨架阶段就该跑绿——模板是起点不是半成品。

### 新增一个单例模板（流程 A/B/C）：两步收口

1. 按 A/B/C 之一生成骨架：`singles/<模板名>/`，含项目骨架（README + 可运行测试，约定见「模板内容约定」）+ **项目级规范骨架三文件**，测试跑绿
2. 在 `registry.json` 的 `singles` 数组登记（无 path 字段，目录由名字派生）

提交推送后，用户侧 `agile init project <name> --template <模板名>` 即可用。AI 陪同建设用插件命令 `/agile:add-template`（见下节）。

### 新增一个组合模板（流程 D）

1. 为每个成员新建 `solutions/<组合名>/<成员名>/`——**组合专属完整模板骨架**（复制最接近的单例模板作起点，按组合需求定制；成员与 singles 互不引用），同样要求规范骨架三文件
2. 在 `registry.json` 的 `solutions` 数组登记组合（`description` + `projects` 成员数组，**数组顺序 = 生成顺序**）

生成产物为成员**平铺**落盘 `projects/<成员目录名>/`（见[模板概览 · 组合模板](./overview#组合模板)）——因此成员名与模板名/组合名同命名空间，三段必须全局唯一。

AI 陪同建设组合模板用插件命令 `/agile:add-template`（流程 D，见下节）——设计问答改问成员构成，成员骨架复制最接近的单例模板作起点。

## AI 辅助建设：/agile:add-template

在 **agile-templates 仓库根目录**（检测 `registry.json` + `scripts/check.mjs` + `singles/` 同时存在）让 Claude Code 执行插件命令；**其他位置（如 workspace 内）拒绝执行**，先 `cd` 到仓库根目录：

```bash
/agile:add-template vue3-nuxt        # 单模板：指定模板名或技术栈描述（进入 A/B/C 判定）
/agile:add-template admin-base       # 组合模板：进入成员构成问答（流程 D）
/agile:add-template                  # 无参数进入交互式设计问答
```

命令按 SDD/TDD 方法论组织，三道门不得跳过：**设计定稿门**（设计问答全部决策经确认后才写盘）→ **测试基线**（骨架阶段测试跑绿）→ **冒烟验收门**（验收清单先行，逐条实际执行）。骨架生成按 A/B/C/D 分支（见上表）→ **registry.json 登记 + `node scripts/check.mjs` 校验** → **冒烟验证**（临时 workspace + 本地模板源执行 `agile init project`，验证占位符替换正确且项目测试可跑——必须实际执行）→ 汇报变更清单。

**流程 D（组合）**：设计问答改问**成员构成**（组合名 + `projects` 成员问答 + 派生起点）→ 成员骨架复制最接近的单例模板作起点（`solutions/<组合名>/<成员名>/`，组合专属深度定制按实际需求另行开发）→ `solutions` 数组登记 + `node scripts/check.mjs` 校验（双向一致 / 成员名全局唯一）→ 冒烟验证成员**平铺**落盘、<span v-pre>`{{name}}`</span> 替换与重跑补缺（需支持 singles/solutions 布局的 CLI，当前 ≥ 2.1.0）。

要点（详见[插件命令详解](/plugin/commands)）：

- **占位符与 init 语义相反**——模板源码里 <span v-pre>`{{name}}`</span> / <span v-pre>`{{safeName}}`</span> **原样保留**（init 生成项目时才替换）
- **模板中立**：预填默认值只来自模板自身选型与社区惯例，不引入团队知识库条款
- 命令**不执行 git add / commit / push**——推送即发版，由人工处理

## 命名规范（防冲突五防线）

**模板如何被找到**：条目 `name` = 模板目录名（组合成员 = `solutions/<组合>/<name>/`），一条链定位无歧义——registry 无 path 字段，杜绝别名指向。

1. **命名规范**：`^[a-z][a-z0-9-]*$`（小写字母开头，仅小写字母/数字/连字符）
2. **重复即报错**：JSON 重复键由 check.mjs 显式扫描（JSON.parse 对重复键静默取后者）；singles / solutions / 同组合 projects 数组内 name 重复登记均拒绝
3. **目录名 === name**：一个目录一个身份，目录由名字约定派生且必须实际存在
4. **登记与目录双向一致**：登记的模板/成员目录必须实际存在（幽灵登记报错）；组合目录下的子目录必须全部登记进 projects（幽灵成员目录报错，CLI 与 check.mjs 双重）；singles/ 与 solutions/ 整体反向——未登记的目录必须全部登记（幽灵单例/幽灵组合报错，仅 check.mjs 强制）
5. **三段全局唯一**：模板名 / 组合名 / 成员名互不重名（init 后全部平铺落盘 `projects/`，同一命名空间）

以上防线由 CLI（`init project` 加载注册中心时校验，不一致即拒绝生成）与仓库 CI（`scripts/check.mjs`）**双重强制**；仅 check.mjs 强制的是：JSON 重复键、未知字段（顶层与条目）、`singles/`/`solutions/` 整体反向完整性与根一级目录白名单。

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
- **前端模板附赠 `docs/ui.md`**（vue3-vite / react-vite；**非强制**，check.mjs 不校验——非 UI 需求的项目可无此文件）：项目级 UI 设计约定骨架——token 清单空表（名称/值/用途）、Token 管理方式（CSS 变量 / JS token 文件 / 组件库主题配置）、使用规则、上层规范引用；经 `/agile:init` 约定问答「UI 约定」维度填充（未问到处保留「待定」）。页面原型与实现引用其 token 名；新增/修改 token 必须回写该表（单一事实源）
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
agile init project demo --template <你的模板>
```

本地模板目录含 `node_modules` 等安装/构建产物、符号链接（junction）或锁文件（`pnpm-lock.yaml` 等）也没关系——init 复制时自动忽略并逐项 warn 提示，不会进入生成项目。

::: warning
`templates.registry` 指向**本地目录**时直接读取、不走缓存；调试完记得把该键改回原地址。
:::

## CI

仓库 Check workflow 自动执行 `scripts/check.mjs`，PR/push 时拦截不一致的 registry 与缺失的项目级规范骨架文件；CLI 侧 `init project` 加载注册中心时同样校验（issues 非空即拒绝生成）。
