# 故障排查

## doctor 错误码速查

`agile doctor` 输出的问题码与处置：

| 错误码 | 级别 | 含义 | 处置 |
|---|---|---|---|
| `invalid-path` | error | registry key 非法（绝对路径/`..`/非法字符） | `agile doctor --fix` 自动移除；或手工改 registry |
| `git-broken` | error | 仓库 git 状态异常 | 进目录 `git status` 排查，必要时重新 clone |
| `remote-unreachable` | error | 远端不可达或无权限 | 检查网络/SSH key/仓库权限；确认放弃可 `--fix` 移除 |
| `not-registered-in-gitmodules` | warn | registry 有但 .gitmodules 没有 | `agile sync` 收敛 |
| `orphan-submodule` | warn | .gitmodules 有但 registry 没有 | `agile sync` 移除，或 `repo add` 重新登记 |
| `not-checked-out` | warn | submodule 未检出 | `agile sync` |
| `pin-drift` | warn | 当前 commit 与 pin 不一致 | `agile sync`（回到 pin）或 `repo unpin` |
| `dirty` | warn | 仓库有未提交改动 | 提交或 stash 后再 sync |

## 常见问题

### sync 报「本地与 origin/xxx 分叉，需人工处理」

无 pin 时 sync 只做 `--ff-only` 前进，分叉会报错（安全设计，不会丢提交）。处理：

```bash
cd tech-specs
git merge --ff-only origin/main   # 看清分叉内容后自行决定
# 或 git reset --hard origin/main（确认丢弃本地提交）
```

### worktree create 报「workspace 仓库还没有首次提交」

worktree 基于已有 commit 创建。先完成初始提交：

```bash
git add -A && git commit -m "chore: init workspace"
```

### init project 报「目录已存在」或模板不存在

- 目录已存在：换项目名，或确认旧目录可删除
- 模板不存在：`agile template list` 查可用模板；模板源错了就 `--registry` 指定或改 workspace.yaml
- 注册中心一致性问题：`agile template check --registry <url>` 查看详情

### template list 提示「使用本地缓存」（stale）

模板源失联时降级使用缓存。网络恢复后 `agile template update` 强制刷新。

### 插件安装失败 / /agile:xxx 命令不可用

1. `claude plugin list` 确认插件状态为 enabled
2. 安装输出里的失败原因（市场地址不可达/权限）
3. 手动安装定位：`claude plugin marketplace add <市场地址>` + `claude plugin install agile@fcc`
4. 命令文件修改后需**重启 Claude Code 会话**才生效

### Windows 下「Access is denied」删不掉目录

通常是进程占用（编辑器索引、esbuild 常驻进程、vitest watcher）。关闭占用进程后重试；`.worktrees/`、`node_modules` 是高发区。

### sync 报「目录已存在且非空，无法作为新 submodule 添加」

目标目录有非骨架内容。`init workspace` 生成的抽屉骨架（仅 README.md）会自动让位；其他内容需你确认后手工清理再 sync。

---

仍未解决？运行 `agile doctor --json` 把输出附到 [issue](https://github.com/pig0224/agile-cli/issues)。
