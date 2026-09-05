# 模板概览

项目模板以独立 git 仓库（[agile-templates](https://github.com/pig0224/agile-templates)）分发——`registry.yaml` 声明全部模板，**新增模板无需升级 CLI**。CLI clone 该仓库读取注册中心，模板源地址可换成团队私有仓库。

## 使用

```bash
agile template list                     # 列出全部模板（默认读本地缓存）
agile template update                   # 强制刷新缓存（agile sync 也会刷新）
agile init project <name> --template <模板名>   # 不带 --template 则创建空项目骨架（不访问注册中心）
```

模板源固定读 `.agile/settings.json` 的 `templates.registry`（默认官方源；`agile config set template-repo <git-url>` 可换团队私有仓库）。

## 内置模板

| 模板名 | 说明 | 技术栈 |
|---|---|---|
| `vue3-vite` | Vue 3 + Vite + TypeScript 前端项目 | TypeScript / Vue |
| `react-vite` | React 19 + Vite + TypeScript 前端项目 | TypeScript / React |
| `go-service` | Go HTTP 服务（net/http 标准库） | Go |
| `java-springboot` | Spring Boot 3（Java 21, Maven）服务 | Java / Spring Boot |
| `node-lib` | Node.js（TypeScript）库项目 | TypeScript / Node |

每个模板自带可运行测试（TDD 起点）与写明运行/测试命令的 README——CLI 与插件依赖此约定执行测试。

## 占位符

脚手架生成时对文本文件**与目录名**做替换：

| 占位符 | 替换为 | 示例 |
|---|---|---|
| `{{name}}` | 项目名（保留大小写与连字符） | `Order-Service` |
| `{{safeName}}` | 小写字母数字折叠段 | Java 包名 `com.example.orderservice` |

## 缓存机制

CLI 把模板仓库克隆到 `~/.agile/templates/<url哈希>`（用户级只读副本，跨 workspace 共享）：

- `template list` / `init project` 默认**读本地缓存**（不联网）；`agile template update` 或 `agile sync` 才联网 `fetch + reset` 刷新
- 失联降级：网络失败且有缓存 → 使用缓存并提示 stale
- 本地目录直读：`templates.registry` 指向本地目录时直接读取（开发模板时用，不走缓存）

## 私有模板源

```json
// .agile/settings.json
{
  "templates": {
    "registry": "git@gitlab.corp:team/agile-templates.git"
  }
}
```

团队可 fork 官方仓库或自建：只要根目录有 `registry.yaml` + 模板目录，即可作为模板源。
