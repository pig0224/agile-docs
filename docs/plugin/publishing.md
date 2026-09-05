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

CI（Validate workflow）在推送时自动校验清单；校验失败即红，不合格的变更不会静默生效。

## 版本模型（无版本号 + commit SHA）

插件**不设** `version` 字段（plugin.json 与 marketplace 条目均不设）。按 Claude Code 官方 Version management 规则，git 托管市场中的相对路径源会落到 **git commit SHA** 作为更新的版本缓存键：push 即变更，`claude plugin update agile@fcc` 与 `agile plugin update` 都能直接检测到更新——这是官方对「内部 / 团队活跃开发插件」的推荐模式，与本仓「推送即发版」天然对齐。

> 若未来走向对外稳定发布（需要语义化版本与回滚锚点），再切换 Explicit version 模式：plugin.json 与 marketplace 条目**两处同步**写 semver，并用 `claude plugin tag` 打 `{name}--v{version}` tag——设了 version 后不 bump 就不会推送更新，需配套发版纪律。

## 变更如何触达用户

| 用户场景 | 拿到新版本的方式 |
|---|---|
| 新安装 | `agile plugin install <name>`（安装时拉取市场最新） |
| 已安装 | `claude plugin marketplace update fcc` + `claude plugin update agile@fcc`（按 commit SHA 判定）；或 `agile plugin update` 一条龙（刷新市场 → 强制重装） |
| 本地市场调试者 | 重启会话（本地目录直读，热加载） |

::: tip
命令/agent/skill 都是纯 Markdown，无兼容性负担；但**修改既有命令的参数语义**时，注意用户可能带着旧习惯调用——在插件命令开头或 changelog 中说明破坏性变化。
:::

## 私有市场（团队自建）

不想用官方市场？把 agile-plugins 仓库 fork/复制到团队私有 git，用户侧指向它即可——CLI 不绑定市场地址：

```bash
agile config set plugin-repo git@gitlab.corp:team/agile-plugins.git
agile config unset plugin-repo   # 恢复内置官方源
```

```bash
# 或安装时一次性指定（不写入配置）
agile plugin install agile --marketplace git@gitlab.corp:team/agile-plugins.git
```

私有市场与官方市场可以并存：官方插件继续用默认地址，团队插件用 `--marketplace` 指定（`--marketplace-name` 区分安装标识）。

## 版本管理建议

市场本身无版本号，但每个插件自己的 `plugin.json` 有 `version` 字段：

- 遵循 semver，破坏性变更（命令参数语义变化、agent 职责调整）升 minor（0.x 阶段）或 major
- 在插件目录维护 `CHANGELOG.md`（可选，ui-designer agent 已按此约定维护组件库）

## 撤销与回滚

- 撤销发布：revert 对应提交并推送
- 用户侧回滚：`git -C ~/.claude/plugins/… checkout <旧 commit>`（极少需要；一般直接修复前进）
