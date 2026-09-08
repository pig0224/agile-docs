---
layout: home

hero:
  name: FCC-Agile
  text: AI 驱动的敏捷工作流
  tagline: Agile 工作区 CLI · Claude Code SDD/TDD 插件 · 项目模板生态
  image:
    src: /logo.svg
    alt: FCC-Agile
  actions:
    - theme: brand
      text: 快速上手
      link: /guide/getting-started
    - theme: alt
      text: 命令参考
      link: /guide/commands
    - theme: alt
      text: 插件流程
      link: /plugin/overview

features:
  - icon: 🗂️
    title: 五类抽屉，一个工作区
    details: 一次初始化，得到包含公司规范、技术知识库、产品知识库、项目代码、过程产物的完整工作区——研发内容集中一处，统一管理。
    link: /guide/concepts
    linkText: 核心概念
  - icon: 🔄
    title: 一处配置，自动同步
    details: 外部资源地址写进 .agile/settings.json，执行 agile sync 即拉取最新规范与知识库、安装声明的插件；本地未提交改动始终优先，不会被覆盖。
    link: /guide/commands#sync
    linkText: sync 命令
  - icon: 🤖
    title: AI 即装即用
    details: Claude Code 等工具直接执行 agile 命令即可完成全部操作；配套插件提供 18 个 /agile:xxx 命令，无需额外接入。
    link: /guide/commands
    linkText: 命令参考
  - icon: 🧩
    title: 需求到发布全流程
    details: /agile:prd 生成 PRD → /agile:architect 技术设计 → 测试先行 → TDD 开发 → /agile:review 验收门禁 → /agile:release 发布留档，各步骤产物自动归档。
    link: /plugin/overview
    linkText: 插件概览
  - icon: 📦
    title: 项目模板
    details: agile init project --template <模板名> 一条命令生成规范齐全的项目骨架；模板统一登记与命名，团队可自建私有模板源。
    link: /templates/overview
    linkText: 模板概览
  - icon: 🚀
    title: 各组件独立更新
    details: CLI 经 npm 升级，插件与模板更新后即时生效——三者互不牵连，按各自节奏演进。
    link: /guide/concepts#生态三仓
    linkText: 生态三仓
---
