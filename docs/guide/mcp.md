# MCP 工具

`agile mcp` 启动 stdio MCP Server，把 CLI 能力程序化暴露给 AI 客户端（Claude Code 等）。供人类用命令行、供 AI 用 MCP——两个入口共享同一实现，行为完全一致。

## 注册方式

**方式一：项目 `.mcp.json`**（工作区根）：

```json
{ "mcpServers": { "agile": { "command": "agile", "args": ["mcp"] } } }
```

**方式二：Agile 插件捆绑**：安装 Agile 插件后自动可用（工具名带插件命名空间前缀，形如 `mcp__plugin_agile_agile__agile_sync`）。

## 工具清单

| 工具 | 说明 | 参数 |
|---|---|---|
| `agile_workspace_info` | workspace 根目录 + `.agile/settings.json` 全量配置（五抽屉路径、外部仓库、插件、模板源） | 无 |
| `agile_sync` | 同步外部资源：外部仓库拉取（本地优先）+ 模板缓存刷新 + 插件按声明安装 | `dryRun`（**默认 true**） |
| `agile_template_list` | 列出模板注册中心全部模板 | 无 |
| `agile_task_create` | 创建 `process-docs/<编号>/` 标准任务目录（7 个 .md） | `taskId`（如 `STO-001`） |

## 安全设计

- **`agile_sync` 默认 `dryRun: true`**：AI 必须显式传 `dryRun: false` 才会执行写操作，避免模型误触发 git 变更
- 同步与拉取一律**本地优先**（dirty 跳过、只 pull 不 reset），工具侧不提供任何 force / reset 参数

## 错误约定

- workspace 不存在 → 返回 `{ "error": "未找到 workspace…" }`（JSON 文本，不是协议错误）
- 工具内部失败（如模板注册中心不可达）→ 返回 `{ "error": "<中文错误消息>" }`，整体不抛协议错误
- 配置非法 → 错误消息中文，带文件名与字段路径

## 返回结构（agile_sync）

`agile_sync` 返回 `steps` 数组——每步一条 `{ name, status, detail }`，与 CLI 的 `agile sync` 输出一致：

```json
{
  "dryRun": true,
  "steps": [
    { "name": "tech-specs（公司级规范）", "status": "skipped", "detail": "[dry-run] 将 clone git@…" },
    { "name": "biz-tech-docs（团队知识库）", "status": "skipped", "detail": "未配置仓库地址（agile config set biz-tech-docs <git-url>）" },
    { "name": "templates（模板缓存）", "status": "skipped", "detail": "[dry-run] 将刷新模板仓库缓存" },
    { "name": "plugins", "status": "skipped", "detail": "[dry-run] 将安装 agile@fcc" }
  ]
}
```

| status | 含义 |
|---|---|
| `done` | 本步执行成功 |
| `skipped` | 未配置 / dry-run 计划 / 无需动作 |
| `warn` | 警告但不阻断（如 dirty 跳过、ref 锁定未实现、模板源失联降级） |
| `failed` | 本步失败（任一步 failed 时 CLI 退出码 1；其余步骤仍会继续） |

## 典型调用场景

| 场景 | 工具 |
|---|---|
| AI 会话开始了解工作区 | `agile_workspace_info` |
| 插件命令 /agile:sync-req 创建任务目录 | `agile_task_create` |
| 插件命令准备开发环境前同步 | `agile_sync`（dryRun 评估 → 执行） |
| AI 查可用项目模板 | `agile_template_list` |
