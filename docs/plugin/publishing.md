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

## 变更如何触达用户

| 用户场景 | 拿到新版本的方式 |
|---|---|
| 新安装 | `agile plugin install <name>`（安装时拉取市场最新） |
| 已安装 | `agile plugin update`（刷新市场 → 强制重装）或 Claude Code 内更新插件 |
| 本地市场调试者 | 重启会话（本地目录直读，热加载） |

::: tip
命令/agent/skill 都是纯 Markdown，无兼容性负担；但**修改既有命令的参数语义**时，注意用户可能带着旧习惯调用——在插件命令开头或 changelog 中说明破坏性变化。
:::

## 私有市场（团队自建）

不想用官方市场？把 agile-plugins 仓库 fork/复制到团队私有 git，用户侧指向它即可——CLI 不绑定市场地址：

```bash
# workspace.yaml（一次性）
plugin:
  marketplace: git@gitlab.corp:team/agile-plugins.git

# 或安装时指定
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
