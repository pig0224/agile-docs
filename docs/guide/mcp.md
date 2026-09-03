# MCP 工具

`agile mcp` 启动 stdio MCP Server，把 CLI 能力程序化暴露给 AI 客户端（Claude Code 等）。供人类用命令行、供 AI 用 MCP——两个入口共享同一实现，行为完全一致。

## 注册方式

**方式一：项目 `.mcp.json`**（工作区根）：

```json
{ "mcpServers": { "agile": { "command": "agile", "args": ["mcp"] } } }
```

**方式二：Agile 插件捆绑**：安装 Agile 插件后自动可用（工具名带插件命名空间前缀，形如 `mcp__plugins_agile_agile__agile_status`）。

## 工具清单

| 工具 | 说明 | 参数 |
|---|---|---|
| `agile_workspace_info` | workspace 配置、五抽屉路径、仓库注册表 | 无 |
| `agile_status` | 各外部仓库 branch/commit/dirty/pin 状态 | 无 |
| `agile_sync` | 收敛外部 submodule 到 registry 声明状态 | `dryRun`（**默认 true**）、`force`、`repo[]` |
| `agile_doctor` | 健康检查（配置/权限/漂移） | `offline`、`fix` |
| `agile_template_list` | 列出模板注册中心全部模板 | `refresh`（默认 false 只读缓存） |
| `agile_task_create` | 创建 `process-docs/<编号>/` 五文档目录 | `taskId`（如 `STO-001`） |
| `agile_config_list` | workspace.yaml 全量配置 | 无 |
| `agile_repo_list` | registry 全部仓库（url/branch/pin） | 无 |

## 安全设计

- **`agile_sync` 默认 `dryRun: true`**：AI 必须显式传 `dryRun: false` 才会执行写操作，避免模型误触发 git 变更
- 有写操作的工具（sync 的执行模式、doctor 的 fix）都需要显式参数确认

## 错误约定

- workspace 不存在 → 返回 `{ "error": "未找到 workspace…" }`（JSON 文本，不是协议错误）
- 执行失败 → `report.failed[]` 内含 `{ repoPath, error }`，整体不抛协议错误
- 配置非法 → 错误消息中文，带文件名与字段路径

## 返回示例（agile_sync dry-run）

```json
{
  "dryRun": true,
  "plan": {
    "adds": [{ "repoPath": "tech-specs", "url": "git@…", "branch": "main", "reason": "骨架目录让位" }],
    "updates": [],
    "removes": [],
    "upToDate": [],
    "warnings": []
  }
}
```

## 典型调用场景

| 场景 | 工具 |
|---|---|
| AI 会话开始了解工作区 | `agile_workspace_info` + `agile_status` |
| 插件命令 /agile:sync-req 创建任务目录 | `agile_task_create` |
| 插件命令准备开发环境前同步 | `agile_sync`（dryRun 评估 → 执行） |
| 发版/PR 前健康检查 | `agile_doctor` |
| AI 查可用项目模板 | `agile_template_list` |
