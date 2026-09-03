# 模板开发指南

如何为 agile-templates 仓库开发项目模板。**新增模板不需要动 agile-cli**。

## 仓库结构

```
agile-templates/
├── registry.yaml          # 注册中心：name → { description, language, framework, path }
├── vue3-vite/             # 每个模板一个目录（目录名 = 模板名）
├── react-vite/
├── go-service/
├── java-springboot/
├── node-lib/
└── scripts/check.mjs      # 自含一致性校验（CI 同款，零依赖）
```

`registry.yaml`：

```yaml
version: 1
templates:
  vue3-vite:
    description: Vue 3 + Vite + TypeScript 前端项目
    language: TypeScript
    framework: Vue
    path: ./vue3-vite      # 缺省 ./<name>
```

## 新增一个模板：两步

1. 新建目录 `<模板名>/`，放入项目骨架（含构建特征文件，见下）
2. 在 `registry.yaml` 的 `templates:` 下登记

提交推送后，用户侧 `agile init project <name> --template <模板名>` 即可用。

## 命名规范（防冲突四防线）

**模板如何被找到**：模板名 = registry.yaml 的 key = 模板目录名，三位一体一条链定位，无歧义。

1. **命名规范**：`^[a-z][a-z0-9-]*$`（小写字母开头，仅小写字母/数字/连字符）
2. **key 唯一**：YAML 重复键解析器直接报错
3. **目录名 === name**：一个目录一个身份，禁止别名指向同一模板
4. **path 合法**：禁止绝对路径与 `..` 越界；必须指向仓库内已存在目录

以上由 CLI（`template check` / `init project`）与仓库 CI（`scripts/check.mjs`）**双重强制**，违反即拒绝。

**命名建议**：`<技术栈/框架>-<变体>`，如 `vue3-vite`、`go-service`、`java-springboot`；扩展示例 `vue3-nuxt`、`go-grpc`、`node-cli`。

## 模板内容约定

- **构建特征文件**：模板根必须有 `package.json` / `go.mod` / `pom.xml` / `tsconfig.json` 之一——`agile foreach` / `hooks` 按此识别项目
- **占位符**：`{{name}}`（项目名）、`{{safeName}}`（小写安全段，Java 包目录如 `src/main/java/com/example/{{safeName}}/` 用目录名占位也会替换）
- **README**：写清运行/测试命令（CLI 与插件按约定执行测试）
- **至少一个可运行测试**（TDD 起点）
- 模板内不要提交 `.git/`、锁文件按团队策略

## 本地开发与调试

```bash
git clone git@github.com:pig0224/agile-templates.git && cd agile-templates
node scripts/check.mjs                          # 一致性校验（无外部依赖）
# 在 workspace 里用本地路径直读（不走缓存）：
agile template list --registry /path/to/agile-templates
agile init project demo --template <你的模板> --registry /path/to/agile-templates
```

::: warning
`--registry` 传**绝对路径**（或相对于运行目录的路径）；相对路径会按 CLI 工作目录解析。
:::

## CI

仓库 Check workflow 自动执行 `scripts/check.mjs` 与 `agile template check`（CLI 发版后启用）双重校验，PR/push 时拦截不一致的 registry。
