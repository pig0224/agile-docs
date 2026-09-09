# 团队协作 SOP · 一次性初始化

## 架构师交付（一次性）

```bash
agile init workspace --tech-specs <公司规范资源地址>   # 五类目录骨架 + 统一配置 settings.json；--tech-specs 可选：登记公司级规范为外部资源
agile config set biz-tech-docs <团队知识库资源地址>    # 可选：多 workspace 团队共享知识库（也可 init 时 --biz-tech-docs）
agile sync                                            # 拉取已登记外部资源 + 模板缓存 + 插件
agile plugin install agile                            # Claude Code 插件
```

架构师一次性交付：

| 交付物 | 落点 |
|---|---|
| 公司级技术规范 | tech-specs（未登记则普通目录随工作区提交；登记为外部资源后 `agile sync` 自动拉取维护，多 workspace 共享同一份） |
| 产品文档模板（PRD/AC/功能树/菜单树） | `biz-product-docs/templates/`（init 已内置 PRD 模板） |
| 需求输入提示词目录 | `biz-product-docs/prompts/`（预建 README，`/agile:prd` 的描述源，可选流程；见[需求输入提示词](/guide/sop/prompts)） |
| UI / 交互规范 | `biz-product-docs/` |
| 项目模板 | [agile-templates](/templates/overview) 注册中心 |
| **CI/CD**：分支 push 自动 CI + stage 环境自动部署、main 分支保护 | 各项目 / workspace |

骨架首次 commit 并 push（worktree 依赖首次提交存在）。**空间纪律**：主工作区（main）只做「合入 PR + 发版」，日常开发一律在需求分支的 worktree 进行。

## 📌 实战示例：从零初始化工作区（虚构）

终端实录（输出为示意，实际输出以所用 CLI 版本为准）：

```bash
$ agile init workspace --tech-specs git@corp:com/specs.git
✔ 五类目录骨架已创建：tech-specs/ biz-tech-docs/ biz-product-docs/ projects/ process-docs/
✔ .agile/settings.json 已写入（techSpecs → git@corp:com/specs.git）
✔ .gitignore 已配置：已登记的 tech-specs/ 与 .worktrees/ 不入库（biz-tech-docs 登记后由 sync 自动补写）
✔ .gitattributes 已写入（换行符统一 LF）

$ agile config set biz-tech-docs git@corp:team/kb.git
✔ repos.bizTechDocs.url 已设置

$ agile sync
[repos] tech-specs    … done（clone）
[repos] biz-tech-docs … done（clone）
[templates] 模板缓存已刷新
[plugins] agile … done（按声明安装并保持更新）

$ agile plugin install agile
✔ 已写入 plugins.dependencies 并安装

$ git add -A && git commit -m "chore: 初始化工作区" && git push -u origin main
```

> 实录为示意：`agile sync` 输出含 [plugins] agile 安装动作、却排在 `agile plugin install agile` 之前，属时序简化——实际顺序是先 `agile plugin install agile`（写入 `plugins.dependencies` 声明），此后 `agile sync` 才会按声明安装插件。

交付核对清单：

| 核对项 | 方式 |
|---|---|
| 公司规范可见 | 打开 `tech-specs/` 确认目录与 README 导航 |
| 团队知识库可见 | 打开 `biz-tech-docs/`，确认 `frameworks/` 领域目录 |
| PRD 模板在位 | `biz-product-docs/templates/PRD模板.md` |
| 模板可用 | `agile template list` 列出单例模板与组合模板 |
| 插件可用 | 重启 Claude Code 会话后 `/agile:help` 列出全部命令 |
| main 分支保护 | 仓库设置确认 PR 必需 + CI 必需 |

> 首个需求开工前确认骨架已 push——`worktree create` 依赖首次提交存在（异常处理见[验收、发布与纪律](/guide/sop/release)的常见异常表）。
