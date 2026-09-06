# 团队协作 SOP · 一次性初始化

## 架构师交付（一次性）

```bash
agile init workspace --tech-specs <公司规范仓库 URL>   # 五抽屉骨架 + settings.json + git 仓库；一并登记公司级规范
agile config set biz-tech-docs <团队知识库仓库 URL>    # 可选：多 workspace 团队共享知识库（也可 init 时 --biz-tech-docs）
agile sync                                            # 拉取外部资源 + 模板缓存 + 插件
agile plugin install agile                            # Claude Code 插件
```

架构师一次性交付：

| 交付物 | 落点 |
|---|---|
| 公司级技术规范 | tech-specs（外部 git 仓库，目录不入库，`agile sync` 拉取） |
| 团队技术知识库（多 workspace 时） | biz-tech-docs（登记为外部仓库，单一事实源；单 workspace 无需登记——普通目录随 workspace 仓库入库）；沉淀入口 `/agile:knowledge` |
| 产品文档模板（PRD/AC/功能树/菜单树） | `biz-product-docs/templates/`（init 已内置 PRD 模板） |
| UI / 交互规范 | `biz-product-docs/` |
| 项目模板 | [agile-templates](/templates/overview) 注册中心 |
| **CI/CD**：分支 push 自动 CI + stage 环境自动部署、main 分支保护 | 各项目仓库 / workspace 仓库 |

骨架首次 commit 并 push（worktree 依赖首次提交存在）。**空间纪律**：主工作区（main）只做「收 PR + 发版」，日常开发一律在需求分支的 worktree 进行。

## 📌 实战示例：从零初始化工作区（虚构）

终端实录（输出为示意，实际输出以所用 CLI 版本为准）：

```bash
$ agile init workspace --tech-specs git@corp:com/specs.git
✔ 五抽屉骨架已创建：tech-specs/ biz-tech-docs/ biz-product-docs/ projects/ process-docs/
✔ .agile/settings.json 已写入（techSpecs → git@corp:com/specs.git）
✔ .gitignore 已配置：tech-specs/、.worktrees/ 不入库（biz-tech-docs 登记后由 sync 自动补写）
✔ .gitattributes 已写入（换行符统一 LF）

$ agile config set biz-tech-docs git@corp:team/kb.git
✔ repos.bizTechDocs.url 已设置

$ agile sync
[repos] tech-specs    … done（clone）
[repos] biz-tech-docs … done（clone）
[templates] 模板缓存已刷新（5 个模板）
[plugins] agile … done（按声明安装）

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
| 模板可用 | `agile template list` 列出 5 个模板 |
| 插件可用 | 重启 Claude Code 会话后 `/agile:help` 列出全部命令 |
| main 分支保护 | 仓库设置确认 PR 必需 + CI 必需 |

> 首个需求开工前确认骨架已 push——`worktree create` 依赖首次提交存在（异常处理见[验收、发布与纪律](/guide/sop/release)的常见异常表）。
