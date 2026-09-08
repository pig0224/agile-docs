# 插件发布

agile-plugins 以 **git 仓库分发，推送即发版**——无版本号、无 npm、无构建产物。

## 发布流程

```bash
# 1. 开发完成，本地验证
claude plugin validate .

# 2. 提交并推送 main
git add -A && git commit -m "feat: xxx"
git push origin main

# 完成。用户侧立即拿到新版本。
```

CI（Validate workflow）为 **PR-only 门禁**：仅在 Pull Request 上自动校验清单，校验失败即红，不合格的 PR 被拦截；直接 push main 不触发 CI（推送即发版，推送前请先本地跑一遍 `claude plugin validate .`）。

## 版本模型（无版本号 + commit SHA）

插件**不设** `version` 字段（plugin.json 与 marketplace 条目均不设）。按 Claude Code 官方 Version management 规则，git 托管市场中的相对路径源会落到 **git commit SHA** 作为更新的版本缓存键：push 即变更——与本仓「推送即发版」一致。但注意：`claude plugin update` 对 git 分发市场可能判「已是最新」而跳过——用 `agile plugin update`（marketplace update + uninstall + install 强制重装）保证装到最新。

> 如需语义化版本与回滚锚点，可切换 Claude Code 的 Explicit version 模式：plugin.json 与 marketplace 条目**两处同步**写 semver，并用 `claude plugin tag` 打 `{name}--v{version}` tag。

## 变更如何触达用户

| 用户场景 | 拿到新版本的方式 |
|---|---|
| 新安装 | `agile plugin install <name>`（安装时拉取市场最新） |
| 已安装 | `agile plugin update` 一条龙（刷新市场 → 强制重装；`claude plugin update` 对 git 分发市场可能判「已是最新」而跳过） |
| 本地市场调试者 | 本地目录直读，改完重启 Claude Code 会话生效 |

::: tip
命令/agent/skill 都是纯 Markdown，无兼容性负担；但**修改既有命令的参数语义**时，注意用户可能带着旧习惯调用——在插件命令开头或 changelog 中说明破坏性变化。
:::

## 私有市场（团队自建）

团队可自建私有市场：把 agile-plugins 仓库 fork/复制到团队私有 git，用户侧指向它即可——CLI 不绑定市场地址：

```bash
agile config set plugin-repo git@gitlab.corp:team/agile-plugins.git
agile config unset plugin-repo   # 恢复内置官方源
```

换源目标市场（如镜像）需保持 marketplace.json 的 `name` 为 `fcc`（镜像场景即满足此条件）；**异名第三方市场**的插件不在 `agile plugin` 管理范围内——直接用 `claude plugin` 命令安装，需要纳入 workspace 声明时手改 settings.json 的 `plugins.dependencies`（`agile sync` 认声明照样补装）。

## 变更记录建议

插件不设版本号，变更语义依靠 commit message 与变更记录承载：

- commit message 遵循 Conventional Commits（`feat:` / `fix:` / 破坏性变更用 `feat!:`）
- 建议在插件目录维护 `CHANGELOG.md`（可选）；**修改既有命令的参数语义**时，务必在命令文件开头或 CHANGELOG 中说明破坏性变化

## 撤销与回滚

- 撤销发布：revert 对应提交并推送
- 用户侧回滚：`git -C ~/.claude/plugins/… checkout <旧 commit>`（极少需要；一般直接前向修复）
