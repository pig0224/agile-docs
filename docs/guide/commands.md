# 命令参考

`agile` CLI 的全部命令与参数。约定：`<>` 必填，`[]` 可选，`...` 可重复。

命令总览（8 个）：

| 命令 | 一句话说明 |
|---|---|
| [init](#init) | 初始化 workspace 或项目 |
| [sync](#sync) | 同步外部资源：外部仓库拉取 + 模板缓存刷新 + 插件按声明安装 |
| [config](#config) | 外部仓库与分发源地址快捷配置（tech-specs / biz-tech-docs / plugin-repo / template-repo） |
| [worktree](#worktree) | 开发环境（git worktree）管理 |
| [template](#template) | 项目模板缓存管理 |
| [plugin](#plugin) | Claude Code 插件管理 |
| [update](#update) | CLI 自更新 |
| [mcp](#mcp) | 启动 MCP Server |

> 另有辅助命令 `agile version`（等价 `agile --version` / `agile -v`）。

> 任务目录（STO-xxx，7 个 .md）**没有 CLI 命令**——它是流程能力，仅通过 MCP 工具 `agile_task_create` 暴露，由 Claude Code 插件命令（/agile:sync-req 等）调用。见 [MCP 工具](/guide/mcp)。

---

## init

初始化 workspace 工作区或 projects 下的项目。

### agile init workspace

初始化工作区：生成唯一配置 `.agile/settings.json`、五个抽屉骨架（含 README）、git 仓库、`.gitignore` 与 `.gitattributes`。**幂等**——重复执行不会覆盖已有配置与文档。

```
agile init workspace [--name <名称>] [--default-branch <分支>]
                     [--marketplace <url>] [--template-registry <url>]
                     [--tech-specs <url>] [--biz-tech-docs <url>]
```

| 参数 | 默认 | 说明 |
|---|---|---|
| `--name` | 当前目录名 | workspace 名称，写入 settings.json |
| `--default-branch` | `main` | workspace 仓库默认分支 |
| `--marketplace` | 官方插件市场地址 | 插件市场 git 地址，写入 `plugins.marketplace` |
| `--template-registry` | 官方模板源地址 | 模板注册中心 git 地址，写入 `templates.registry` |
| `--tech-specs` | 不登记 | 公司级规范外部仓库 git 地址（也可之后 `agile config set tech-specs <url>`） |
| `--biz-tech-docs` | 不登记 | 团队知识库外部仓库 git 地址，可选（也可之后 `agile config set biz-tech-docs <url>`） |

具体动作：

1. 写入 `.agile/settings.json`（唯一配置文件，结构见[核心概念](/guide/concepts)）
2. 生成五抽屉骨架（各抽屉一份 README）与 `biz-product-docs/templates/PRD模板.md`
3. `git init`（幂等，已存在则跳过）
4. `.gitignore` **幂等追加三行**：`.worktrees/`、`tech-specs/`、`biz-tech-docs/`（外部资源不入库）
5. 生成 `.gitattributes`（换行符统一 LF，`.bat`/`.cmd` 保持 CRLF）

```bash
mkdir my-workspace && cd my-workspace
agile init workspace --name my-workspace --tech-specs git@gitlab.corp:specs/tech-specs.git
```

初始化后的目录结构见 [核心概念](/guide/concepts)。

::: warning 旧版配置自动迁移
检测到旧版三 yaml（`workspace.yaml` / `registry.yaml` / `plugin.yaml`）时，内容自动合并进 `.agile/settings.json`。旧文件保留在磁盘，确认无误后请人工执行 `git rm .agile/workspace.yaml .agile/registry.yaml .agile/plugin.yaml`。若此前把外部仓库登记为 submodule，请先人工执行 `git submodule deinit --all` 再 `agile sync`（外部目录现由 `.gitignore` 忽略、`agile sync` 拉取）。
:::

### agile init project

在 `projects/<name>` 初始化项目（workspace 单仓内**普通目录**），并 `git add` 纳入版本管理（不自动 commit）。两种方式：

- **`--template <模板名>`**：从模板注册中心脚手架（模板源固定读 settings.json `templates.registry`，默认走本地缓存）
- **缺省 `--template`**：生成**空项目骨架**（仅一个 README.md）——不联网、不读模板缓存，适合尚无合适模板的场景

```
agile init project <name> [--template <模板名>]
```

| 参数 | 必填 | 说明 |
|---|---|---|
| `<name>` | ✅ | 项目名，将作为 `projects/` 下的目录名 |
| `--template` | ❌ | 模板名，`agile template list` 查看；**缺省创建空项目骨架** |

```bash
agile template list                          # 先看可用模板
agile init project order-service --template go-service
agile init project my-lib                    # 空项目骨架（不访问模板注册中心）
```

模板中的占位符会被替换：`{{name}}` → 项目名，`{{safeName}}` → 小写字母数字段（Java 包名等场景）。

::: tip
项目与 workspace 其余变更走**同一个 PR**——这是单仓模式的天然优势。
:::

---

## sync

把 `.agile/settings.json` 声明的**外部资源**同步到本地，幂等，可随时重跑。

```
agile sync [--dry-run]
```

| 参数 | 说明 |
|---|---|
| `--dry-run` | 只显示将执行的动作（计划条目带 `[dry-run] 将…` 前缀），不落盘 |

依次处理四步（每步一条结果，状态 `done` / `skipped` / `warn` / `failed`）：

1. **tech-specs 拉取**（公司级规范外部仓库）：目录缺失 → clone；已有 → fetch + `--ff-only` 快进
2. **biz-tech-docs 拉取**（团队知识库外部仓库，可选）：同上
3. **templates 缓存刷新**：拉取模板注册中心远端最新；失联降级沿用本地缓存
4. **plugins 按声明安装**：对照 `plugins.dependencies` 补装缺失插件，**绝不卸载**已安装插件

外部仓库拉取语义（**本地优先**——这两个目录是可写工作区，知识库命令直接落盘）：

- 未配置仓库地址 → `skipped`，提示 `agile config set <key> <git-url>`
- 目录只有 init 生成的骨架 README.md → **自动让位**后 clone
- 目录非空且不是 git 仓库 → `failed`，请手动处理后重试
- 目录是 git 仓库但有未提交改动（dirty）→ `warn` 跳过更新，**绝不覆盖本地改动**
- 目录干净 → 拉取远端最新；与远端分叉 → `failed` 交人工（只 pull 不 reset）
- 声明了 `ref`（版本锁定）→ 追加一条 `warn`（锁定暂未实现，按远端最新拉取），不阻断

任一步 `failed` 退出码为 1，**其余步骤继续执行**。

```bash
agile sync --dry-run       # 先看计划
agile sync                 # 执行
```

::: warning 安全设计
本地未提交改动优先——sync 只做快进拉取，**绝不覆盖、绝不 reset 丢失你的提交**；分叉时停下交人工处理。
:::

**自动同步**：`agile worktree create` 创建前、后各自动执行一次 sync（失败仅警告不阻塞，见 [worktree](#worktree)）。

---

## config

外部仓库与分发源地址的快捷配置——类 npm 换源体验。键为白名单四键，其余配置直接编辑 `.agile/settings.json`：

| 键 | settings.json 落点 | unset 行为 |
|---|---|---|
| `tech-specs` | `repos.techSpecs.url` | 移除条目（sync 提示跳过） |
| `biz-tech-docs` | `repos.bizTechDocs.url` | 移除条目（sync 提示跳过） |
| `plugin-repo` | `plugins.marketplace` | 恢复内置官方源 |
| `template-repo` | `templates.registry` | 恢复内置官方源 |

| 子命令 | 语法 | 说明 |
|---|---|---|
| `get` | `agile config get <key>` | 查看配置值（未配置时给出 set 提示） |
| `set` | `agile config set <key> <git-url>` | 写入 settings.json 对应键（`agile sync` 生效） |
| `unset` | `agile config unset <key>` | 移除配置（行为见上表） |
| `list` | `agile config list` | 输出 settings.json 全量配置（原样 JSON） |

```bash
agile config set tech-specs git@gitlab.corp:specs/tech-specs.git
agile config set biz-tech-docs git@gitlab.corp:kb/tech-docs.git   # 可选：多 workspace 团队共享知识库
agile config set plugin-repo git@gitlab.corp:team/agile-plugins.git    # 私有插件市场
agile config set template-repo git@gitlab.corp:team/agile-templates.git # 私有模板源
agile config get tech-specs
agile config list
```

::: tip 换源即生效，CLI 无需发版
四键都支持本地路径（内网镜像直接 clone）。`plugin-repo` 换源后已安装插件不受影响（`agile sync` 绝不卸载）；私有市场须与官方同名（市场名 `fcc`）依赖声明才无缝衔接。
:::

---

## worktree

为 workspace 根仓库创建隔离的 git worktree——**一个分支 = 一套完整开发环境**（仓库内全部前后端代码与文档，外加在 worktree 内独立就位的外部资源目录）。

| 子命令 | 语法 | 说明 |
|---|---|---|
| `create` | `agile worktree create <branch> [--base <ref>]` | 创建 `.worktrees/<branch>/`；创建前、后各自动 sync 一次 |
| `list` | `agile worktree list` | 列出全部 worktree（分支 + 目录） |
| `remove` | `agile worktree remove <branch> [--force]` | 移除并删除分支（未合并时分支保留并警告）；`--force` 丢弃未提交改动 |

### create 的分支来源（三分支行为）

| 情况 | 行为 |
|---|---|
| 本地已有该分支 | 直接检出 |
| 远程 `origin/<branch>` 已有 | 创建跟踪分支检出——协作场景：负责人推了需求分支，另一端直接拉取 |
| 本地远程都没有 | 以 `--base`（默认当前 HEAD）新建分支 |

目录名转写：分支名中的 `/` 与 `\` 转写为 `__`（如 `feature/STO-001` → `.worktrees/feature__STO-001`）。

::: warning 前置条件
workspace 仓库必须有首次提交（unborn HEAD 时 create 会给出明确指引）。
:::

### 自动同步（autoSync）

- **创建前**：主仓自动 sync 一次外部资源（基于同步后的状态创建）
- **创建后**：在 worktree 内再 sync 一次——`git worktree` 只检出仓库内文件，tech-specs / biz-tech-docs 不入库，需在 worktree 内独立 clone/拉取
- 两次 sync 失败均**仅警告不阻塞**（可进入 worktree 手动执行 `agile sync`）

```bash
agile worktree create feature/STO-001    # 自动 sync → 建环境 → worktree 内再 sync
cd .worktrees/feature__STO-001           # 开发
agile worktree remove feature/STO-001    # 清理

# 协作场景：负责人已推送远程需求分支，前后端各自拉取
agile worktree create feature/STO-001    # 自动跟踪检出 origin/feature/STO-001
```

---

## template

项目模板管理。模板注册中心 = git 仓库，地址在 settings.json `templates.registry`（默认官方源，`agile config set template-repo <git-url>` 可换团队私有仓库）。

| 子命令 | 语法 | 说明 |
|---|---|---|
| `list` | `agile template list` | 列出全部模板（默认读本地缓存，`agile sync` / `agile template update` 刷新）；注册中心存在一致性问题（issues）时逐条输出并退出码 1 |
| `update` | `agile template update` | 强制刷新模板缓存到注册中心远端最新 |
| `clean` | `agile template clean` | 清理全部模板缓存（下次使用自动重新克隆） |

模板缓存位于 `~/.agile/templates/<url哈希>`（用户级，跨 workspace 共享）；刷新失联时降级使用本地缓存（提示 stale）。

---

## plugin

Claude Code 插件管理（类 npm 心智）。插件市场是独立 git 仓库（新增插件无需升级 CLI）；依赖声明登记在 `.agile/settings.json` 的 `plugins.dependencies`，`agile sync` 按声明补装。

| 子命令 | 语法 | 说明 |
|---|---|---|
| `install` | `agile plugin install [name] [--marketplace <url>] [--marketplace-name <名称>]` | 从市场安装并登记依赖声明（类 npm install --save；默认 `agile`） |
| `uninstall` | `agile plugin uninstall [name] [--marketplace-name <名称>]` | 卸载插件并移除依赖声明（缺省 `agile`） |
| `update` | `agile plugin update [name] [--marketplace <url>] [--marketplace-name <名称>]` | 更新到市场最新：刷新市场克隆 → uninstall + install 强制重装 → 登记声明 |
| `ls` | `agile plugin ls` | 依赖声明 × 本机安装实况对照表 |

- 市场地址解析：`--marketplace` 参数 > settings.json `plugins.marketplace` > 官方默认
- workspace 外也可 install / update（仅跳过依赖声明登记）
- 注册市场失败 / 安装失败 → 退出码 1，并给出可手动执行的命令（`claude plugin marketplace add <市场地址>` + `claude plugin install <name>@<市场名>`）

```bash
agile plugin install agile                                  # 官方市场
agile plugin install agile --marketplace git@corp:team/plugins.git   # 私有市场
agile plugin update agile                                   # 更新到市场最新版本
agile plugin ls                                             # 声明与实况对照
agile plugin uninstall agile                                # 卸载并删除声明
```

### 依赖声明（plugins.dependencies）

`.agile/settings.json` 的 `plugins.dependencies` 随 workspace 仓库提交，只声明「用哪些插件、来自哪个市场」，不记录安装实况（安装/启用状态由 Claude Code 全局管理 `~/.claude/plugins`）：

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

更新（`plugin update`）= `marketplace add`（幂等注册）→ `marketplace update`（拉取市场仓库最新——`add` 对已注册市场不拉新，此步必须）→ uninstall + install 强制重装（`claude plugin update` 对 git 分发市场可能判「已是最新」而跳过）。更新后重启 Claude Code 会话生效。

---

## update

自更新 CLI（npm）。

```
agile update              # 更新 CLI
```

插件更新走 `agile plugin update`（见 plugin 节）。

---

## version

```
agile version        # 等价 agile --version / agile -v
```

---

## mcp

启动 stdio MCP Server，暴露 4 个工具供 AI 客户端调用。通常不直接运行——由 `.mcp.json` 或插件自动拉起。详见 [MCP 工具](/guide/mcp)。

```
agile mcp
```
