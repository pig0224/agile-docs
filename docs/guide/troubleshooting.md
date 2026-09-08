# 故障排查

## 常见问题

### tech-specs / biz-tech-docs 目录如何维护？

两个目录同一规则，按是否登记分两种用法：

- **未登记（默认）**：作为普通目录随工作区一起提交，获得版本管理
- **登记为外部资源**（`agile config set tech-specs <url>` / `agile config set biz-tech-docs <url>` + `agile sync`）：由 sync 自动拉取维护，不随工作区提交；在目录内沉淀的产物在该知识库中提交（人工操作）

两个目录都可在内直接沉淀（`/agile:knowledge`）：**biz-tech-docs**（团队知识库）随时落盘；**tech-specs**（公司级规范）日常条款直接落盘，重大变更（选型切换、跨团队影响）落 `biz-tech-docs/proposals/` 提案、由人工走公司评审流程。

适合登记为外部资源的情形：

- 多个 workspace 共用同一份内容——登记后共享同一份，一处维护、处处一致（如 `/agile:knowledge` 会直接往 biz-tech-docs 目录里写文件）

若未登记但目录仍被忽略（旧版本初始化的 workspace 可能残留忽略行），sync 会提示——需随工作区提交时，按提示删除该忽略行。

### sync 为何提示「存在未提交改动，跳过更新」？

（已登记为外部资源的目录）目录里的改动以本地为准，**本地改动优先**：sync 检测到目录 dirty 即跳过该目录（状态 `warn`），**不会覆盖未提交内容**。需要拉取远端最新时，先提交或 stash 本地改动：

```bash
cd tech-specs                       # 已登记为外部资源时适用
git status                          # 确认本地改动
git add -A && git commit            # 提交（是否推送自行决定）
cd ..
agile sync                          # 重新快进拉取
```

### sync 报「无法快进到远端，需人工处理」

（已登记为外部资源的目录）本地与远端分叉——sync 仅做快进拉取，分叉时暂停并交人工处理。进入目录核对分叉内容后自行决定处置方式：

```bash
cd tech-specs                       # 已登记为外部资源时适用
git fetch origin
git merge --ff-only origin/main     # 或 rebase / merge 后推送，自行判断
```

处理完成后再次执行 `agile sync`，确认状态恢复 `done`。**禁止 force push**。

### 如何切换 / 移除外部资源地址？

`config set` 覆盖 url 即可（写入 `.agile/settings.json` 对应键），下次 `agile sync` 生效：

```bash
agile config set tech-specs git@gitlab.corp:new-path/tech-specs.git   # 换地址
agile config unset biz-tech-docs                                      # 移除登记（sync 将提示跳过）
agile config list                                                     # 查看全量配置
```

若目录已存在旧资源内容且要更换源，删除该目录（或恢复为仅含 README 骨架）后，`agile sync` 将按新地址重新拉取。插件市场与模板源同理：`config set plugin-repo / template-repo` 切换私有源，`config unset` 恢复内置官方源。

### sync 报「目录已存在且非空且不是 git 仓库」

目标目录包含非骨架内容时，sync 不会改动它。`init workspace` 生成的目录骨架（仅 README.md）会自动让位；其余内容需经确认后手工清理，再执行 sync。

### worktree create 报「workspace 仓库还没有首次提交」

worktree 基于已有 commit 创建。先完成初始提交：

```bash
git add -A && git commit -m "chore: init workspace"
```

### init project 报「目录已存在」或模板/组合不存在

- 目录已存在：空项目骨架对已存在目录（含空目录）一律报「目录已存在」；单例 / 组合模板遇空目录则放行生成——换 `--name` 目录名，或确认旧目录可删除后手工删除重跑（空目录放行时无内容损失）
- 报「与生成清单不符（缺 N 文件 / 多 M 项），疑似上次生成残留；请删除该目录后重跑」：目标目录有本 CLI 的生成清单（`.agile/manifests/<目录名>.json`）但实际文件对不上——通常是上次 init 中途失败留下的残缺残留，或生成后目录被改动。确认后删除该目录重跑（2.4.0 起 `--force` 已删除，删除目录重跑是唯一出路；生成物可再生，目录内的手工改动请先迁移）
- 组合模板输出「已存在，跳过 + warn」：该成员的有效目录名（含 `--name` 覆盖）在 `projects/` 下已被占用——有生成清单且一致 = 本组合已生成的成员（补缺语义，只补缺失成员，见 [init project](/guide/commands#agile-init-project)）；无清单 = 陌生目录（同名普通项目、手写项目或旧版 CLI 生成），CLI 不动它，请人工核对（换 `--name` 覆盖名重跑，或确认旧目录可删除）
- 模板或组合模板不存在：`agile template list` 查可用单例模板与组合模板；模板源不对就改 `.agile/settings.json` 的 `templates.registry`
- 注册中心一致性问题（含「成员名与模板/组合名冲突」「成员目录不存在/未登记」）：`agile template list` 会逐条输出 issues 并以退出码 1 结束，按提示修复模板仓库（模板名/组合名/成员名须三段全局唯一，组合登记与成员目录双向一致）

### 项目内的 `.mcp.json` / `.claude/` 不生效

Claude Code 只读取**启动目录**的会话层配置——从 workspace 根（或 worktree 根）启动的会话不会读取 `projects/<项目>/` 下的 `.mcp.json` 与 `.claude/`（写了不生效也不报错）。正确落点：

- MCP 服务器：**workspace 根** `.mcp.json`（`/agile:init` 的辅助能力配置默认写这里；同名 server 已存在则跳过）
- 权限白名单 / hooks：workspace 根 `.claude/settings.json`（`/agile:init` 只出建议清单，配置由人工完成）

项目工程配置（lint / build / test / 依赖）不受影响——放项目内自包含，不提升到根。

### template list 提示「使用本地缓存」（stale）

模板源失联时降级使用缓存。网络恢复后 `agile template update` 强制刷新。

### 插件安装失败 / /agile:xxx 命令不可用

1. `agile plugin ls` 看依赖声明 × 本机实况对照（✓ 已装 / ○ 未装 / ✖ 市场冲突 / · 未声明）
2. 安装输出里的失败原因（市场地址不可达/权限）；失败时 CLI 会给出手动命令
3. 手动安装定位：`claude plugin marketplace add <市场地址>` + `claude plugin install agile@fcc`
4. 命令文件修改后需**重启 Claude Code 会话**才生效

### Windows 下删除目录报「Access is denied」

通常是进程占用（编辑器索引、esbuild 常驻进程、vitest watcher）。关闭占用进程后重试；`.worktrees/`、`node_modules` 是高发区。

---

以上处置仍未解决问题时，运行 `agile sync --dry-run` 与 `agile config list`，将输出附至 [issue](https://github.com/pig0224/agile-cli/issues)。
