# 模板开发指南

如何为 agile-templates 仓库开发项目模板。**新增模板不需要动 agile-cli**。

## 仓库结构

```
agile-templates/
├── registry.yaml               # 注册中心：templates（name → { description, language, framework, path }）
│                               #            + solutions（组合模板，可选：members = 纯成员名清单）
├── singles/                    # 单例模板（一个模板一个完整项目骨架，目录名 = 模板名）
│   ├── vue3-vite/
│   ├── react-vite/
│   ├── go-service/
│   ├── java-springboot/
│   └── node-lib/
├── solutions/                  # 组合模板（可选）：一组合一目录，成员 = 组合专属完整模板骨架
│   └── <组合名>/<成员名>/
└── scripts/check.mjs           # 自含一致性校验（CI 同款，零依赖）
```

`registry.yaml`：

```yaml
version: 1
templates:
  vue3-vite:
    description: Vue 3 + Vite + TypeScript 前端项目
    language: TypeScript
    framework: Vue
    path: ./singles/vue3-vite   # 与 name 同名的一级目录（旧布局根一级 ./<name> 亦兼容）
solutions:                      # 组合模板（可选）
  admin-base:
    description: 通用后台基础系统
    members: backend,frontend   # 纯成员名清单，逗号分隔，顺序 = 生成顺序
```

## 新增一个单例模板：两步

1. 新建目录 `singles/<模板名>/`，放入项目骨架（含 README 与可运行测试，约定见「模板内容约定」）+ **项目级规范骨架三文件**
2. 在 `registry.yaml` 的 `templates:` 下登记（`path` 用 `./singles/<name>`）

提交推送后，用户侧 `agile init project <name> --template <模板名>` 即可用。AI 陪同建设用插件命令 `/agile:add-template`（见下节）。

## 新增一个组合模板

1. 为每个成员新建 `solutions/<组合名>/<成员名>/`——**组合专属完整模板骨架**（可复制最接近的单例模板作起点，按组合需求定制；成员与 singles 互不引用），同样要求规范骨架三文件
2. 在 `registry.yaml` 的 `solutions:` 段登记 `members`（纯成员名清单，顺序 = 生成顺序）

生成产物为成员**平铺**落盘 `projects/<成员目录名>/`（见[模板概览 · 组合模板](./overview#组合模板)）——因此成员名与模板名/组合名同命名空间，三段必须全局唯一。

## AI 辅助建设：/agile:add-template

不想从零手工搭骨架，可在本仓库（或 workspace 内定位到它）让 Claude Code 执行插件命令：

```bash
/agile:add-template vue3-nuxt        # 指定模板名或技术栈描述
/agile:add-template                  # 无参数进入交互式设计问答
```

命令流程：**设计问答**（技术栈 / 变体 / 测试框架等）→ **骨架生成**（项目骨架 + 规范骨架三文件，前端栈另加 `docs/ui.md`）→ **registry.yaml 登记 + `node scripts/check.mjs` 校验** → **冒烟验证**（临时 workspace + 本地模板源执行 `agile init project`，验证占位符替换正确且项目测试可跑——必须实际执行）→ 汇报变更清单。

要点（详见[插件命令详解](/plugin/commands)）：

- **占位符与 init 语义相反**——模板源码里 <span v-pre>`{{name}}`</span> / <span v-pre>`{{safeName}}`</span> **原样保留**（init 生成项目时才替换）
- **模板中立**：预填默认值只来自模板自身选型与社区惯例，不引入团队知识库条款
- 命令**不执行 git add / commit / push**——推送即发版，由人工处理

## 命名规范（防冲突五防线）

**模板如何被找到**：模板名 = registry.yaml 的 key = 模板目录名，三位一体一条链定位，无歧义。

1. **命名规范**：`^[a-z][a-z0-9-]*$`（小写字母开头，仅小写字母/数字/连字符）
2. **key 唯一**：YAML 重复键解析器直接报错
3. **目录名 === name**：一个目录一个身份，禁止别名指向同一模板
4. **path 合法**：禁止绝对路径与 `..` 越界；必须指向仓库内已存在目录，且为与 name 同名的一级目录（`./<name>` 或 `./singles/<name>`）
5. **三段全局唯一**：模板名 / 组合名 / 成员名互不重名（init 后全部平铺落盘 `projects/`，同一命名空间）；组合登记与成员目录双向一致（缺成员目录 / 幽灵成员目录均报错）

以上由 CLI（`init project` 加载注册中心时校验，不一致即拒绝生成）与仓库 CI（`scripts/check.mjs`）**双重强制**，违反即拒绝。

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

::: warning
`templates.registry` 指向**本地目录**时直接读取、不走缓存；调试完记得把该键改回原地址。
:::

## CI

仓库 Check workflow 自动执行 `scripts/check.mjs`，PR/push 时拦截不一致的 registry 与缺失的项目级规范骨架文件；CLI 侧 `init project` 加载注册中心时同样校验（issues 非空即拒绝生成）。
