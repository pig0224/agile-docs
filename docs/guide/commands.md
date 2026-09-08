# 命令参考

`agile` CLI 的全部命令与参数。约定：`<>` 必填，`[]` 可选，`...` 可重复。

命令总览（8 个）：

| 命令 | 一句话说明 |
|---|---|
| [init](#init) | 初始化 workspace 或项目 |
| [sync](#sync) | 同步外部资源：拉取规范与知识库 + 刷新模板缓存 + 安装声明的插件 |
| [config](#config) | 外部资源与源地址快捷配置（tech-specs / biz-tech-docs / plugin-repo / template-repo） |
| [worktree](#worktree) | 隔离开发环境管理 |
| [template](#template) | 项目模板缓存管理 |
| [plugin](#plugin) | Claude Code 插件管理 |
| [update](#update) | CLI 自更新 |
| [version](#version) | 显示版本号（等价 `--version` / `-v`） |

> AI（Claude Code 等）直接执行上述命令即可。任务目录（STO-xxx，初始 8 个 .md；run-test.md 由验收阶段产出，完整档案 9 个）由插件命令（/agile:sync-req、/agile:fix-bug 等）按统一模板自动创建。

---

## init

初始化 workspace 工作区或 projects 下的项目。

### agile init workspace

初始化工作区：生成统一配置 `.agile/settings.json`、五个目录骨架（各含 README）与版本管理基础配置。**幂等**——重复执行不会覆盖已有配置与文档。

```
agile init workspace [--name <名称>]
                     [--marketplace <url>] [--template-registry <url>]
                     [--tech-specs <url>] [--biz-tech-docs <url>]
```

| 参数 | 默认 | 说明 |
|---|---|---|
| `--name` | 当前目录名 | workspace 名称，写入 settings.json |
| `--marketplace` | 官方插件市场地址 | 插件市场地址，写入 `plugins.marketplace` |
| `--template-registry` | 官方模板源地址 | 模板注册中心地址，写入 `templates.registry` |
| `--tech-specs` | 不登记 | 公司级规范资源地址（也可之后 `agile config set tech-specs <url>`） |
| `--biz-tech-docs` | 不登记 | 团队知识库资源地址，可选（也可之后 `agile config set biz-tech-docs <url>`） |

具体动作：

1. 写入 `.agile/settings.json`（结构见[核心概念](/guide/concepts)）
2. 生成五个目录骨架（各含一份 README）与 `biz-product-docs/templates/PRD模板.md`
3. 初始化版本管理（幂等，已存在则跳过）
4. 忽略规则：`.worktrees/`、`tech-specs/` 自动写入 `.gitignore`（tech-specs 由 sync 维护，不随工作区提交）；`biz-tech-docs/` 仅在登记为外部资源时写入
5. 换行符统一为 LF（Windows 的 `.bat`/`.cmd` 保持 CRLF）

```bash
mkdir my-workspace && cd my-workspace
agile init workspace --name my-workspace --tech-specs git@gitlab.corp:specs/tech-specs.git
```

初始化后的目录结构见 [核心概念](/guide/concepts)。

::: warning 旧版配置自动迁移
检测到旧版三 yaml（`workspace.yaml` / `registry.yaml` / `plugin.yaml`）时，内容自动合并进 `.agile/settings.json`。旧文件保留在磁盘，确认无误后请人工执行 `git rm .agile/workspace.yaml .agile/registry.yaml .agile/plugin.yaml`。若此前把外部仓库登记为 submodule，请先人工执行 `git submodule deinit --all` 再 `agile sync`（外部目录现由 `.gitignore` 忽略、`agile sync` 拉取）。
:::

### agile init project

在 `projects/` 下初始化项目。三种场景：

- **`--template <单例模板名>`**：从单例模板脚手架生成一个项目（模板源读 settings.json `templates.registry`，默认用本地缓存）
- **`--template <组合模板名>`**：组合模板一次平铺生成全部成员项目（见下「组合模板」）
- **缺省 `--template`**：生成**空项目骨架**（仅一个 README.md）——不联网、不读模板缓存，适合尚无合适模板的场景

```
agile init project [--template <模板名|组合名>] [--name <目录名 | 组合项目名称=目录名>]...
```

| 参数 | 必填 | 说明 |
|---|---|---|
| `--template` | ❌ | 单例模板名或组合模板名，`agile template list` 查看；**缺省创建空项目骨架** |
| `--name` | 场景而定 | 项目目录命名（可重复），三模式对照见下表 |

**`--name` 三模式**（值统一满足 `^[a-z][a-z0-9-]*$`——同时用作 `projects/` 目录名与 <span v-pre>`{{name}}`</span> 占位）：

| 场景 | `--name` 形态 | 缺省（不带 `--name`） |
|---|---|---|
| 空项目骨架（缺省 `--template`） | 裸值**必填**，恰好 1 个：`--name <目录名>` | —（缺失即报错） |
| 单例模板 | 裸值可选，至多 1 个：`--name <目录名>` | 单例项目名称（= 模板名） |
| 组合模板 | 键值可重复：`--name <组合项目名称>=<目录名>` | 各成员用组合项目名称（= 登记成员名） |

交叉形态报错：单例 / 空骨架收到键值、组合收到裸值，均报错并说明该场景的正确形态。

```bash
agile template list                                         # 先看可用单例模板与组合模板
agile init project --name my-lib                            # 空项目骨架（不联网）
agile init project --template go-service                    # 单例：目录名 = go-service
agile init project --template go-service --name order       # 单例：目录名 = order
agile init project --template admin-base --name backend=be  # 组合：平铺生成 be/ + frontend/
```

> 示例中的模板名（go-service 等）为示意——实际可用模板以 `agile template list` 输出为准（官方注册中心可能尚未登记模板）。

::: warning 2.4.0 破坏性变更（迁移对照）
`init project` 不再接受位置参数 `<name>`，`--member` / `--force` 废除，目录命名统一为 `--name`：

| 2.3.x 及以前 | 2.4.0 起 |
|---|---|
| `agile init project <name> --template <模板名>` | `agile init project --template <模板名> --name <目录名>`（`--name` 缺省 = 模板名） |
| `agile init project <系统标签> --template <组合名> --member 成员名=目录名` | `agile init project --template <组合名> --name 成员名=目录名`（输出汇报用组合名；`--name` 缺省 = 各成员名） |
| `--force` 强制重建已存在目录 | **已删除**——重跑防护四态见下表，清单不符唯一出路 = 删除该目录后重跑 |

旧写法执行时给出废弃指引并退出码非 0，不会静默变更行为。
:::

**重跑防护四态**：每次成功生成后，CLI 在 workspace 级写**生成清单** `.agile/manifests/<落地目录名>.json`（来源模板/组合名、成员原名、文件相对路径、生成时间、模板版本），并随项目一同入库。重跑 `init project` 遇到已存在目录时：

| 目录状态 | 单例模板 | 组合模板 |
|---|---|---|
| 有清单且一致 | 报「目录已存在」 | 跳过 + warn（补缺语义，可后补组合演进的新成员） |
| 有清单但不符（缺文件 / 多文件，疑似上次 init 中途失败残留） | **硬错误**退出码非 0：`✘ projects/xxx 与生成清单不符（缺 N 文件 / 多 M 项），疑似上次生成残留；请删除该目录后重跑` | 同左 |
| 无清单（陌生目录：手写项目、旧版 CLI 生成） | 报「目录已存在」 | 跳过 + warn 人工核对（AI 层 `/agile:init` 生成前会先做撞名核对） |
| 空目录 | 放行生成（无内容损失） | 放行生成（计入本次 created） |

生成过程有**事务保护**：任一成员失败即整体回滚本次新建的成员目录（之前已存在被跳过的不动），不留残缺目录。补缺按本次调用的有效成员目录名判定——覆盖过的成员重跑须带相同 `--name` 键值。

**组合模板**：一个组合一次生成全部成员项目，**平铺**落盘 `projects/<成员目录名>/`（无系统目录层级），输出汇报以组合名为标签。成员是**组合专属的完整模板骨架**（`solutions/<组合名>/<成员名>/`，不引用 singles），规范骨架三文件照常带出。**命名硬约束**：模板名 / 组合名 / 成员名三段全局唯一（成员平铺落盘后直接占用 `projects/` 顶层目录名），组合登记与成员目录双向一致。

**组合根耦合资产带出**：全部成员生成成功后，CLI 把组合根的 `CLAUDE.md`（组合导航）与 `docs/`（跨成员共享的约定/规范）快照到 workspace `.agile/solutions/<组合名>/`（≥ 2.3.0，快照已存在则跳过不覆盖）。随后执行 `/agile:knowledge sync-template <组合名>`，把资产按类型同步进知识库（tech → biz-tech-docs，product → biz-product-docs）。

模板中的占位符会被替换：<span v-pre>`{{name}}`</span> → **实际落地目录名**（单例 = `--name` 裸值或单例项目名称；组合 = 平铺后的成员目录名），<span v-pre>`{{safeName}}`</span> → 小写字母数字段（Java 包名等场景）。

::: tip
项目与 workspace 其余变更纳入**同一个 PR**，一并提交评审。
:::

---

## sync

把 `.agile/settings.json` 声明的**外部资源**同步到本地，幂等，可随时重复执行。

```
agile sync [--dry-run]
```

| 参数 | 说明 |
|---|---|
| `--dry-run` | 只显示将执行的动作（计划条目带 `[dry-run] 将…` 前缀），不落盘 |

依次处理四步（每步一条结果，状态 `done` / `skipped` / `warn` / `failed`）：

1. **tech-specs 拉取**（公司级规范）：拉取最新内容
2. **biz-tech-docs 拉取**（团队知识库，可选）：同上
3. **模板缓存刷新**：更新到模板源最新；失联时沿用本地缓存
4. **plugins 按声明安装**：对照 `plugins.dependencies` 补装缺失插件，**不会卸载**已安装插件

外部资源拉取规则（**本地改动优先**）：

- 未配置资源地址 → `skipped`，提示 `agile config set <key> <git-url>`
- 目录只有初始化时的骨架 README.md → **自动让位**后拉取
- 目录非空且无法识别 → `failed`，请手动处理后重试
- 目录有未提交改动 → `warn` 跳过更新，**不覆盖本地改动**
- 目录干净 → 拉取最新；与远端分叉 → `failed` 交人工处理
- 声明了 `ref`（版本锁定）→ 追加一条 `warn`（锁定暂未实现，按最新拉取），不阻断

任一步 `failed` 退出码为 1，**其余步骤继续执行**。

```bash
agile sync --dry-run       # 先看计划
agile sync                 # 执行
```

::: warning 本地改动优先
本地未提交改动优先——sync 仅做快进拉取，**不覆盖本地改动、不回退本地历史**；与远端分叉时停下交人工处理。
:::

**自动同步**：`agile worktree create` 创建前、后各自动执行一次 sync（失败仅警告不阻塞，见 [worktree](#worktree)）。

---

## config

外部资源与分发源地址的快捷配置，操作方式与 npm 换源一致。键为白名单四键，其余配置直接编辑 `.agile/settings.json`：

| 键 | settings.json 落点 | unset 行为 |
|---|---|---|
| `tech-specs` | `repos.techSpecs.url` | 移除条目（sync 提示跳过） |
| `biz-tech-docs` | `repos.bizTechDocs.url` | 移除条目（sync 提示跳过） |
| `plugin-repo` | `plugins.marketplace` | 恢复内置官方源 |
| `template-repo` | `templates.registry` | 恢复内置官方源 |

| 子命令 | 语法 | 说明 |
|---|---|---|
| `get` | `agile config get <key>` | 查看配置值（未配置时给出 set 提示；workspace 外分发源两键返回内置官方默认） |
| `set` | `agile config set <key> <git-url>` | 写入 settings.json 对应键（`agile sync` 生效） |
| `unset` | `agile config unset <key>` | 移除配置（行为见上表） |
| `list` | `agile config list` | 输出 settings.json 全量配置（原样 JSON；workspace 外显示内置默认配置） |

```bash
agile config set tech-specs git@gitlab.corp:specs/tech-specs.git
agile config set biz-tech-docs git@gitlab.corp:kb/tech-docs.git   # 可选：多 workspace 团队共享知识库
agile config set plugin-repo git@gitlab.corp:team/agile-plugins.git    # 私有插件市场
agile config set template-repo git@gitlab.corp:team/agile-templates.git # 私有模板源
agile config get tech-specs
agile config list
```

::: tip 换源即生效
四键都支持本地路径（内网镜像可直接指向本地目录）。`plugin-repo` 换源后已安装插件不受影响（`agile sync` 不卸载）；私有市场须与官方同名（市场名 `fcc`）依赖声明才无缝衔接。
:::

---

## worktree

为 workspace 创建隔离的开发环境——**一个分支 = 一套完整开发环境**（全部前后端代码与文档，外部资源目录自动就绪）。

| 子命令 | 语法 | 说明 |
|---|---|---|
| `create` | `agile worktree create <branch> [--base <ref>]` | 创建 `.worktrees/<branch>/`；创建前、后各自动 sync 一次 |
| `list` | `agile worktree list` | 列出全部 worktree（分支 + 目录） |
| `remove` | `agile worktree remove <branch> [--force]` | 移除并删除分支（未合并时分支保留并警告）；`--force` 丢弃未提交改动 |

### create 的分支来源（三分支行为）

| 情况 | 行为 |
|---|---|
| 本地已有该分支 | 直接检出 |
| 远程 `origin/<branch>` 已有 | 创建跟踪分支检出——协作场景：负责人已推送需求分支，其他成员可直接跟踪检出 |
| 本地远程都没有 | 以 `--base`（默认当前 HEAD）新建分支 |

目录名转写：分支名中的 `/` 与 `\` 转写为 `__`（如 `feat/STO-001` → `.worktrees/feat__STO-001`）。

::: warning 前置条件
workspace 需至少一次提交（尚无提交时 create 会给出明确指引）。
:::

### 自动同步（autoSync）

- **创建前**：主仓自动 sync 一次外部资源（基于同步后的状态创建）
- **创建后**：在新环境内再 sync 一次——外部资源不随分支检出，需在新环境内重新拉取（未登记的 biz-tech-docs 是普通目录，随检出直接可用）
- 两次 sync 失败均**仅警告不阻塞**（可进入 worktree 手动执行 `agile sync`）

```bash
agile worktree create feat/STO-001    # 自动 sync → 建环境 → worktree 内再 sync
cd .worktrees/feat__STO-001           # 开发
agile worktree remove feat/STO-001    # 清理

# 协作场景：负责人已推送远程需求分支，前后端各自拉取
agile worktree create feat/STO-001    # 自动跟踪检出 origin/feat/STO-001
```

---

## template

项目模板管理。模板源地址在 settings.json `templates.registry`（默认官方源，`agile config set template-repo <git-url>` 可换团队私有仓库）。**workspace 外也可用**：`list` / `update` 自动落到内置官方源（模板缓存本机共用）——模板开发者在模板仓内、或尚未初始化 workspace 时都能直接查询。

| 子命令 | 语法 | 说明 |
|---|---|---|
| `list` | `agile template list [--json]` | 列出全部模板与组合模板（默认读本地缓存，`agile sync` / `agile template update` 刷新）；组合模板树形多行展开成员（成员行缩进、按成员名对齐，顺序 = registry `projects` 数组顺序）；注册中心存在一致性问题（issues）时逐条输出并退出码 1。`--json` 输出结构化 JSON（singles / solutions 数组，含组合成员 name+description，顺序 = registry 顺序）供脚本消费——纯 JSON 走 stdout，stale/issues 提示走 stderr |
| `update` | `agile template update` | 强制刷新模板缓存到注册中心远端最新 |
| `clean` | `agile template clean` | 清理全部模板缓存（下次使用自动重新拉取） |

模板缓存位于 `~/.agile/templates/<url哈希>`（本机所有 workspace 共用）；刷新失联时使用本地缓存（提示 stale）。

---

## plugin

Claude Code 插件管理（操作方式与 npm 一致）。新增插件无需升级 CLI；依赖声明登记在 `.agile/settings.json` 的 `plugins.dependencies`，`agile sync` 按声明补装。`ls` 在 workspace 外仅显示本机安装实况（无声明对照）。

| 子命令 | 语法 | 说明 |
|---|---|---|
| `install` | `agile plugin install [name]` | 从市场安装并登记依赖声明（默认 `agile`） |
| `uninstall` | `agile plugin uninstall [name]` | 卸载插件并移除依赖声明（缺省 `agile`） |
| `update` | `agile plugin update [name]` | 更新到市场最新：刷新市场缓存 → uninstall + install 强制重装 → 登记声明 |
| `ls` | `agile plugin ls` | 依赖声明 × 本机安装实况对照表 |

- 市场地址解析：settings.json `plugins.marketplace`（workspace 外使用官方默认）；市场名固定 `fcc`——换源（`agile config set plugin-repo`）目标市场（如镜像）需保持 marketplace.json 的 name=`fcc`
- workspace 外也可 install / update（仅跳过依赖声明登记）
- 注册市场失败 / 安装失败 → 退出码 1，并给出可手动执行的命令（`claude plugin marketplace add <市场地址>` + `claude plugin install <name>@<市场名>`）
- 异名第三方市场的插件：直接用 `claude plugin` 命令；要纳入 workspace 声明则手改 settings.json `plugins.dependencies`（`agile sync` 认声明照样补装）

```bash
agile plugin install agile                                  # 官方市场
agile plugin update agile                                   # 更新到市场最新版本
agile plugin ls                                             # 声明与实况对照
agile plugin uninstall agile                                # 卸载并删除声明
```

### 依赖声明（plugins.dependencies）

`.agile/settings.json` 的 `plugins.dependencies` 随工作区提交，只声明「用哪些插件、来自哪个市场」，不记录安装实况（安装/启用状态由 Claude Code 全局管理 `~/.claude/plugins`）：

```json
{
  "plugins": {
    "dependencies": {
      "agile": { "marketplace": "fcc" }
    }
  }
}
```

安装 = `claude plugin marketplace add <市场地址>` + `claude plugin install <name>@<市场名>`，重启 Claude Code 会话后 `/agile:xxx` 命令可用。`ref` 为版本锁定预留字段（锁定安装暂未实现，按市场最新安装）。

### plugin ls 对照表

| 标记 | 含义 |
|---|---|
| ✓ | 已安装，与声明一致 |
| ○ | 已声明未安装（`agile sync` 或 `claude plugin install <name>@<市场名>` 补装） |
| ✖ | 市场冲突：声明与本机安装来自不同市场——按提示 uninstall 后重新安装 |
| · | 本机已装但当前 workspace 未声明 |

更新（`plugin update`）= 刷新市场到最新 → 卸载后重装强制更新（不直接使用 `claude plugin update`——其可能误判「已是最新」而跳过重装）。更新后重启 Claude Code 会话生效。

---

## update

自更新 CLI（npm）。

```
agile update              # 更新 CLI
```

插件更新走 `agile plugin update`（见 plugin 节）。
模板更新走 `agile template update`（见 template 节）。

---

## version

```
agile version        # 等价 agile --version / agile -v
```
