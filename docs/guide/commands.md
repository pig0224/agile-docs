# 命令参考

`agile` CLI 的全部命令与参数。约定：`<>` 必填，`[]` 可选，`...` 可重复。

命令总览：

| 命令 | 一句话说明 |
|---|---|
| [init](#init) | 初始化 workspace 或项目 |
| [sync](#sync) | 同步外部 submodule 到 registry 声明状态 |
| [status](#status) | 外部仓库状态总览 |
| [repo](#repo) | registry 条目管理 |
| [config](#config) | workspace.yaml 增删改查 |
| [doctor](#doctor) | 工作区健康检查 |
| [worktree](#worktree) | 开发环境（git worktree）管理 |
| [template](#template) | 项目模板注册中心 |
| [hooks](#hooks) | 项目钩子（批量执行） |
| [foreach](#foreach) | 遍历 projects 执行命令 |
| [plugin](#plugin) | Claude Code 插件管理 |
| [update](#update) | CLI / 插件自更新 |
| [version](#version) | 查看版本 |
| [mcp](#mcp) | 启动 MCP Server |

> 任务目录（STO-xxx 五文档）**没有 CLI 命令**——它是流程能力，仅通过 MCP 工具 `agile_task_create` 暴露，由 Claude Code 插件命令（/agile:sync-req 等）调用。见 [MCP 工具](/guide/mcp)。

---

## init

初始化 workspace 工作区或 projects 下的项目。

### agile init workspace

初始化工作区：生成 `.agile` 三个配置文件、五个抽屉骨架（含 README）、git 仓库与 `.gitignore`。**幂等**——重复执行不会覆盖已有配置与文档。

```
agile init workspace [--name <名称>] [--default-branch <分支>]
                      [--marketplace <url>] [--template-registry <url>]
```

| 参数 | 默认 | 说明 |
|---|---|---|
| `--name` | 当前目录名 | workspace 名称，写入 workspace.yaml |
| `--default-branch` | `main` | workspace 仓库默认分支 |
| `--marketplace` | 官方插件市场地址 | 插件市场 git 地址，写入 `plugin.marketplace` |
| `--template-registry` | 官方模板源地址 | 模板注册中心 git 地址，写入 `templates.registry` |

```bash
mkdir my-workspace && cd my-workspace
agile init workspace --name my-workspace
```

初始化后的目录结构见 [核心概念](/guide/concepts#工作区结构)。

### agile init project

在 `projects/<name>` 初始化项目（workspace 单仓内**普通目录**，非 submodule），并 `git add` 纳入版本管理（不自动 commit）。两种方式：

- **`--template <模板名>`**：从模板注册中心脚手架（模板来自独立 git 仓库）
- **缺省 `--template`**：生成**空项目骨架**（仅一个 README.md）——不联网、不读模板缓存，适合尚无合适模板的场景

```
agile init project <name> [--template <模板名>] [--registry <url>] [--refresh]
```

| 参数 | 必填 | 说明 |
|---|---|---|
| `<name>` | ✅ | 项目名，将作为 `projects/` 下的目录名 |
| `--template` | ❌ | 模板名，`agile template list` 查看；**缺省创建空项目骨架** |
| `--registry` | ❌ | 模板源 git URL，缺省取 workspace.yaml `templates.registry`（仅 `--template` 时生效） |
| `--refresh` | ❌ | 联网刷新模板缓存（默认走本地缓存；仅 `--template` 时生效） |

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

把 registry.yaml 登记的**外部仓库**（如 tech-specs）的磁盘状态收敛到声明状态。幂等，可随时重跑。

```
agile sync [--repo <path>]... [--force] [--dry-run] [--quiet]
```

| 参数 | 说明 |
|---|---|
| `--repo <path>` | 只同步指定仓库（可重复给出） |
| `--force` | 忽略 dirty 仓库强制更新（默认跳过并列警告） |
| `--dry-run` | 只输出同步计划，不执行 |
| `--quiet` | 静默模式（自动场景使用，仅输出异常） |

同步计划三方比对 **registry（期望）↔ .gitmodules（记录）↔ 磁盘（实际）**：

- registry 有、gitmodules 无 → `git submodule add`（抽屉骨架目录自动让位）
- gitmodules 有、registry 无 → 移除 submodule 并清理 `.git/modules`
- 均有 → 拉取到 `pin`（精确 checkout）或跟踪分支（`--ff-only`，分叉时报错绝不静默重置）

```bash
agile sync --dry-run       # 先看计划
agile sync                 # 执行
agile sync --repo tech-specs --force
```

::: warning 安全设计
无 pin 且本地与远端分叉时 `merge --ff-only` 失败即报错，**不会自动 reset 丢失你的提交**。
:::

**自动同步**：`agile worktree create` 创建开发环境前会自动执行一次 sync（失败仅警告不阻塞）。

---

## status

查看 registry 中外部仓库的状态总览：分支、HEAD、dirty、pin 漂移。

```
agile status [--json]
```

| 参数 | 说明 |
|---|---|
| `--json` | 输出 JSON（供 AI / 脚本消费） |

```
仓库          分支    HEAD          状态
tech-specs  main  ca99ef521631  ✔ 干净
```

---

## repo

registry.yaml（外部仓库登记处）条目管理。

| 子命令 | 语法 | 说明 |
|---|---|---|
| `add` | `agile repo add <repoPath> <url> [--branch <分支>]` | 登记仓库（不拉取，sync 时生效） |
| `remove` | `agile repo remove <repoPath>` | 移除登记（本地目录由下次 sync 清理） |
| `list` | `agile repo list` | 列出全部仓库（URL/分支/pin） |
| `pin` | `agile repo pin <repoPath> [commit]` | 固定到当前 HEAD 或指定 commit |
| `unpin` | `agile repo unpin <repoPath>` | 解除固定，恢复跟随分支 |
| `set-url` | `agile repo set-url <repoPath> <url>` | 更新远端 URL（同步 registry/.gitmodules/本地 origin） |
| `set-branch` | `agile repo set-branch <repoPath> <branch>` | 更新跟踪分支 |

```bash
agile repo add tech-specs git@gitlab.corp:specs/tech-specs.git
agile repo pin tech-specs          # 锁定规范版本，sync 不再前进
```

`repoPath` 是相对 workspace 根的路径（如 `tech-specs`），也是 submodule 路径。合法字符：字母、数字、`_ . - /`；不允许绝对路径、`..`、位于 `.agile/` 内。

---

## config

workspace.yaml 的点路径增删改查。

| 子命令 | 语法 | 示例 |
|---|---|---|
| `get` | `agile config get <key>` | `agile config get paths.projects` |
| `set` | `agile config set <key> <value>` | `agile config set defaultBranch develop` |
| `list` | `agile config list` | 输出全部配置 |
| `unset` | `agile config unset <key>` | 删除配置项 |

常用点路径：`name`、`defaultBranch`、`paths.projects`、`plugin.marketplace`、`templates.registry`。

---

## doctor

工作区健康检查：配置 schema 校验、registry ↔ .gitmodules ↔ 磁盘三方漂移、远端可达性/权限、dirty 仓库、pin 漂移。

```
agile doctor [--fix] [--offline] [--json]
```

| 参数 | 说明 |
|---|---|
| `--fix` | 自动修复可修复项（从 registry 移除无权限/非法仓库，gitmodules 由下次 sync 收敛） |
| `--offline` | 跳过远端可达性检查（内网/离线场景） |
| `--json` | 输出 JSON（供 AI / MCP 消费） |

错误码见 [故障排查](/guide/troubleshooting)。

---

## worktree

为 workspace 根仓库创建隔离的 git worktree——**一个分支 = 一套完整开发环境**（含全部前后端代码与文档）。

| 子命令 | 语法 | 说明 |
|---|---|---|
| `create` | `agile worktree create <branch> [--base <ref>]` | 创建 `.worktrees/<branch>/`；**创建前自动 sync 外部仓库** |
| `list` | `agile worktree list` | 列出全部 worktree |
| `remove` | `agile worktree remove <branch> [--force]` | 移除并删除分支（未合并时分支保留并提示） |

```bash
agile worktree create feature/STO-001    # 自动 sync → 建环境
cd .worktrees/feature__STO-001           # 开发
agile worktree remove feature/STO-001    # 清理
```

::: warning 前置条件
workspace 仓库必须有首次提交（unborn HEAD 时 create 会给出明确指引）。
:::

---

## template

项目模板注册中心管理。模板来自 `templates.registry` 指向的 git 仓库（默认官方源，可指向团队私有仓库）。

| 子命令 | 语法 | 说明 |
|---|---|---|
| `list` | `agile template list [--registry <url>] [--refresh] [--json]` | 列出全部模板（默认读本地缓存，`--refresh` 联网刷新） |
| `update` | `agile template update [--registry <url>]` | 强制刷新模板缓存 |
| `check` | `agile template check [--registry <url>]` | 注册中心一致性校验（CI 用） |

模板缓存位于 `~/.agile/templates/<url哈希>`（用户级，跨 workspace 共享）；失联时降级使用本地缓存。本地路径也可以直接作为 `--registry`（开发模板时用）。

---

## hooks

按 workspace.yaml 声明的 hooks 批量作用于 projects 下的项目（如依赖安装、codegen）。hook 的 `match` 用 glob 匹配 `projects/<name>`。

| 子命令 | 语法 | 说明 |
|---|---|---|
| `run` | `agile hooks run [--only <glob>] [--project <name>]...` | 执行匹配的 hooks |
| `list` | `agile hooks list` | 列出 hooks 与匹配的项目数 |

workspace.yaml 配置示例：

```yaml
hooks:
  - match: "projects/frontend-*"
    run: npm install
  - match: "projects/*"
    run: echo ready
```

---

## foreach

在每个项目目录执行 shell 命令（遍历 `projects/`，按构建特征文件识别项目）。

```
agile foreach '<cmd>' [--group <glob>] [--parallel]
```

| 参数 | 说明 |
|---|---|
| `--group <glob>` | 项目过滤（匹配 `projects/<name>`） |
| `--parallel` | 并行执行（默认串行） |

```bash
agile foreach 'npm test'
agile foreach 'go build ./...' --group 'projects/*-service'
```

---

## plugin

Claude Code 插件管理。插件市场是独立 git 仓库（新增插件无需升级 CLI）。

| 子命令 | 语法 | 说明 |
|---|---|---|
| `install` | `agile plugin install [name] [--marketplace <url>] [--marketplace-name <名称>]` | 从市场安装（默认 `agile`） |
| `enable` | `agile plugin enable [name]` | 启用（缺省 `agile`） |
| `disable` | `agile plugin disable [name]` | 禁用（缺省 `agile`） |
| `list` | `agile plugin list` | 列出已登记插件与市场地址 |

```bash
agile plugin install agile                                  # 官方市场
agile plugin install agile --marketplace git@corp:team/plugins.git   # 私有市场
```

安装 = `claude plugin marketplace add <市场地址>` + `claude plugin install <name>@<市场名>`，重启 Claude Code 会话后 `/agile:xxx` 命令可用。

---

## update

自更新。

```
agile update              # 默认：更新 CLI
agile update --plugin     # 只更新插件
agile update --all        # 全部更新
```

| 参数 | 说明 |
|---|---|
| `--plugin` | 只更新插件（重新安装拉取插件市场最新版本） |
| `--all` | 同时更新 CLI 与插件 |

缺省两者都执行。

---

## version

```
agile version        # 等价 agile --version / agile -v
```

---

## mcp

启动 stdio MCP Server，暴露 8 个工具供 AI 客户端调用。通常不直接运行——由 `.mcp.json` 或插件自动拉起。详见 [MCP 工具](/guide/mcp)。

```
agile mcp
```
