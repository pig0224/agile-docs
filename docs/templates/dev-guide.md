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

以上由 CLI（`init project` 加载注册中心时校验，不一致即拒绝生成）与仓库 CI（`scripts/check.mjs`）**双重强制**，违反即拒绝。

**命名建议**：`<技术栈/框架>-<变体>`，如 `vue3-vite`、`go-service`、`java-springboot`；扩展示例 `vue3-nuxt`、`go-grpc`、`node-cli`。

## 模板内容约定

- **构建特征文件**：模板根必须有 `package.json` / `go.mod` / `pom.xml` / `tsconfig.json` 之一——CLI 与插件按此识别项目类型
- **占位符**：`{{name}}`（项目名）、`{{safeName}}`（小写安全段，Java 包目录如 `src/main/java/com/example/{{safeName}}/` 用目录名占位也会替换）
- **README**：写清运行/测试命令（CLI 与插件按约定执行测试）
- **至少一个可运行测试**（TDD 起点）
- 模板内不要提交 `.git/`、锁文件按团队策略

## 本地开发与调试

```bash
git clone git@github.com:pig0224/agile-templates.git && cd agile-templates
node scripts/check.mjs                          # 一致性校验（无外部依赖）
```

在 workspace 里用本地路径直读（不走缓存）：把 `.agile/settings.json` 的 `templates.registry` 临时指向本地目录即可。

```json
{
  "templates": {
    "registry": "/path/to/agile-templates"
  }
}
```

```bash
agile template list
agile init project demo --template <你的模板>
```

::: warning
`templates.registry` 指向**本地目录**时直接读取、不走缓存；调试完记得把该键改回原地址。
:::

## CI

仓库 Check workflow 自动执行 `scripts/check.mjs`，PR/push 时拦截不一致的 registry；CLI 侧 `init project` 加载注册中心时同样校验（issues 非空即拒绝生成）。
