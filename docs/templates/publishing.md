# 模板发布

与插件一样：**git 仓库分发，推送即发版**——无版本号、无 npm、无构建。

## 发布流程

```bash
# 1. 本地校验
node scripts/check.mjs
# 有 CLI 时更强校验：
agile template check --registry .

# 2. 提交推送
git add -A && git commit -m "feat: add go-grpc template"
git push origin main
```

CI（Check workflow）在推送时自动跑一致性校验，registry 与目录不一致的变更会红。

## 用户侧生效路径

| 用户场景 | 生效方式 |
|---|---|
| `agile template list --refresh` / `agile template update` | 联网刷新缓存 → 新模板立即可见 |
| `agile init project --template <新模板>` | 同上，直接可用 |
| 离线/失联 | 下次联网后 `agile template update` 强制刷新 |
| 本地调试者 | `--registry <本地路径>` 直读，改完即生效 |

## 修改既有模板

直接改目录内容并推送。注意：

- 已用该模板生成的项目**不受影响**（脚手架是一次性拷贝，非持续同步）
- 破坏性变化（删占位符、改构建脚本结构）建议在模板 README 里注明变更说明
- 模板的版本演进靠 git 历史，需要时 `git log <模板目录>` 追溯

## 删除/下架模板

从 `registry.yaml` 移除条目 + 删除目录。用户侧下次 `template list` 刷新后不再展示；已生成项目不受影响。

## 私有模板源

fork 或自建仓库，满足两点即可作为模板源：

1. 根目录有合法的 `registry.yaml`（通过四防线校验）
2. 模板目录与登记一致

用户侧改 workspace.yaml `templates.registry` 或 `--registry` 参数指向它。官方模板可定期 `git merge` 上游同步。
