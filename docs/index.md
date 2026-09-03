---
layout: home

hero:
  name: FCC-Agile
  text: 一个根、五个抽屉
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
    title: 一个根、五个抽屉
    details: 单仓工作区：公司规范（submodule）+ 技术知识库 + 产品知识库 + 项目代码 + 过程产物，目录即治理。
    link: /guide/concepts
    linkText: 核心概念
  - icon: 🔄
    title: registry 驱动同步
    details: registry.yaml 是唯一事实源，sync 把外部仓库收敛到声明状态；worktree 创建时自动同步。
    link: /guide/commands#sync
    linkText: sync 命令
  - icon: 🤖
    title: MCP 双通道
    details: 人类用命令行，AI 用 MCP——8 个工具共享同一实现，agile_sync 默认 dry-run 防误操作。
    link: /guide/mcp
    linkText: MCP 工具
  - icon: 🧩
    title: SDD / TDD 插件
    details: 12 个斜杠命令 + 7 个角色 subagent：PRD → 设计 → 测试先行 → TDD 开发 → 验收闭环。
    link: /plugin/overview
    linkText: 插件概览
  - icon: 📦
    title: 模板注册中心
    details: 项目模板 git 仓库分发，命名防冲突四防线，新增模板零改 CLI。
    link: /templates/overview
    linkText: 模板概览
  - icon: 🚀
    title: 三仓解耦
    details: CLI 发 npm；插件与模板推送即发版。扩展生态永远不需要等 CLI 发版。
    link: /guide/concepts#生态三仓
    linkText: 生态三仓
---
