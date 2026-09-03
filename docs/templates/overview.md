# 模板概览

项目模板以独立 git 仓库（[agile-templates](https://github.com/pig0224/agile-templates)）分发——`registry.yaml` 声明全部模板，**新增模板无需升级 CLI**。CLI clone 该仓库读取注册中心，模板源地址可换成团队私有仓库。

## 使用

```bash
agile template list                     # 列出全部模板（默认读本地缓存）
agile template list --refresh           # 联网刷新缓存后再列出
agile init project <name> --template <模板名>
agile template update                   # 强制刷新缓存
```

模板源解析优先级：`--registry` 参数 > workspace.yaml `templates.registry`（默认官方源）。

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

- `template list` / `init project` 默认**读本地缓存**（不联网）；`--refresh` 或 `agile template update` 才联网 `fetch + reset --hard`
- 失联降级：网络失败且有缓存 → 使用缓存并提示 stale
- 本地目录直读：`--registry <本地路径>` 直接读取（开发模板时用，不走缓存）

## 私有模板源

```yaml
# workspace.yaml
templates:
  registry: git@gitlab.corp:team/agile-templates.git
```

团队可 fork 官方仓库或自建：只要根目录有 `registry.yaml` + 模板目录，即可作为模板源。
