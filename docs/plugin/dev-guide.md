# 插件开发指南

如何为 agile-plugins 市场仓库开发新插件（或修改 agile 主插件）。**开发插件不需要动 agile-cli**——CLI 对插件内容零知识。

## 市场仓库结构

```
agile-plugins/                        # 市场仓库（git 分发，无 npm）
├── .claude-plugin/marketplace.json   # 市场清单（name: fcc）
└── plugins/
    └── agile/                        # 每个插件一个目录
        ├── .claude-plugin/plugin.json   # 插件清单（必填 name）
        ├── commands/*.md              # 斜杠命令（安装后 /<插件名>:<命令名>）
        ├── agents/*.md                # 角色 subagent
        ├── skills/<name>/SKILL.md     # 方法论（按需加载）
        └── .mcp.json                  # 可选：捆绑 MCP server
```

**一致性铁律**：插件名（plugin.json `name`）= marketplace.json 条目名 = `plugins/` 下目录名，三者一致。

## 新增一个插件：三步

1. 新建 `plugins/<plugin-name>/`，写入 `.claude-plugin/plugin.json`：

```json
{
  "name": "my-plugin",
  "description": "一句话描述（模型判断何时使用的依据）",
  "version": "0.1.0",
  "author": { "name": "you" }
}
```

2. 添加内容（commands/agents/skills 至少其一，写法见下文）
3. 在 `.claude-plugin/marketplace.json` 的 `plugins[]` 追加：

```json
{ "name": "my-plugin", "description": "…", "source": "./plugins/my-plugin" }
```

## 命令（commands/*.md）

文件 `commands/prd.md` → 安装后 `/agile:prd`。frontmatter：

```markdown
---
description: PRD 生成。从需求产出 PRD、AC、功能树与菜单树      ← 模型自动触发依据，必须准确
argument-hint: <需求编号，如 STO-001>                          ← 参数提示（仅展示）
disable-model-invocation: true                                 ← 可选：仅人工触发
---
命令体（提示词）…
```

命令体规范（本市场约定）：

- **只做「前置校验 → Task 委派 agent → 复核汇报」**，不写实现细节
- 开头 `先阅读 skill sdd-tdd-method`（共享方法论按需加载）
- 文件系统/git 操作一律走 CLI/MCP（如任务目录用 MCP `agile_task_create`），不手搓命令
- 产物全中文、落盘位置写明（抽屉路径从 workspace.yaml 读取）

## 角色 Agent（agents/*.md）

frontmatter 的 `description` 用第三人称描述"何时使用"——模型 Task 委派的触发依据：

```markdown
---
name: backend-dev
description: 后端 TDD 开发工程师。按 design.md 在项目仓库中以 Red-Green-Refactor 循环实现接口与服务。当需要执行后端开发任务时使用。
tools: Read, Write, Edit, Glob, Grep, Bash
---
角色提示词：职责 / 输入 / 产出 / 硬规则 / 自检清单…
```

## Skill（`skills/<name>/SKILL.md`）

大块共享知识（方法论/规范约定）放 skill，命令开头引用——只有 name+description 常驻上下文，正文按需加载，不占每命令成本：

```markdown
---
name: sdd-tdd-method
description: agile 工作区的 SDD/TDD 研发方法论与文档规范。凡执行 agile 系列命令时必须先阅读本 skill。
---
方法论正文…
```

## 本地开发与调试

```bash
git clone git@github.com:pig0224/agile-plugins.git && cd agile-plugins
claude plugin validate .            # 清单校验（CI 同款）
claude plugin marketplace add .     # 注册本地市场
claude plugin install <name>@fcc    # 安装
# 修改 commands/agents 文件 → 重启 Claude Code 会话即生效（热加载）
```

直接用本地路径调试单个插件：`claude plugin marketplace add ./plugins/<name>`（需该目录自带 marketplace.json 或用根市场）。

## CI

仓库自带 Validate workflow：`claude plugin validate .` 校验市场与插件清单合法性，PR/push 自动执行。

## 设计原则回顾

1. 命令=入口、agent=执行、skill=知识，职责不混
2. 两条 SDD/TDD 红线不得削弱（无 design.md 不开发；无失败测试不写实现）
3. 不硬编码抽屉路径与 git 命令，全部经 workspace.yaml / CLI / MCP
4. 有写操作的 MCP 工具保持 dry-run 默认或显式确认参数
