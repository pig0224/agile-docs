import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'zh-CN',
  title: 'FCC-Agile — 一个根，五个抽屉的研发工作区',
  description:
    'FCC-Agile 生态官方文档：agile 工作区 CLI（git submodule 同步、worktree 开发环境、项目模板脚手架、健康检查）、Claude Code SDD/TDD 插件（15 个斜杠命令与 7 个角色 subagent）、项目模板注册中心，以及内置 MCP Server 的完整中文使用指南与开发指南。',
  base: '/agile-docs/',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/agile-docs/logo.svg' }],
    ['meta', { name: 'keywords', content: 'FCC-Agile, agile CLI, 工作区管理, git submodule, git worktree, 项目模板, Claude Code 插件, SDD, TDD, MCP, Model Context Protocol, 研发流程' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'FCC-Agile 生态文档' }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
  ],

  sitemap: {
    hostname: 'https://pig0224.github.io',
  },

  themeConfig: {
    siteTitle: 'FCC-Agile',
    nav: [
      { text: 'CLI 指南', link: '/guide/getting-started', activeMatch: '/guide/' },
      { text: '插件', link: '/plugin/overview', activeMatch: '/plugin/' },
      { text: '模板', link: '/templates/overview', activeMatch: '/templates/' },
      {
        text: 'GitHub',
        items: [
          { text: 'agile-cli', link: 'https://github.com/pig0224/agile-cli' },
          { text: 'agile-plugins', link: 'https://github.com/pig0224/agile-plugins' },
          { text: 'agile-templates', link: 'https://github.com/pig0224/agile-templates' },
          { text: 'agile-docs', link: 'https://github.com/pig0224/agile-docs' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '快速上手', link: '/guide/getting-started' },
            { text: '核心概念', link: '/guide/concepts' },
            { text: '团队协作 SOP', link: '/guide/sop' },
          ],
        },
        {
          text: '参考',
          items: [
            { text: '命令参考', link: '/guide/commands' },
            { text: 'MCP 工具', link: '/guide/mcp' },
            { text: '更新日志', link: 'https://github.com/pig0224/agile-cli/blob/main/CHANGELOG.md' },
            { text: '故障排查', link: '/guide/troubleshooting' },
          ],
        },
      ],
      '/plugin/': [
        {
          text: '使用',
          items: [
            { text: '概览与流程', link: '/plugin/overview' },
            { text: '命令详解', link: '/plugin/commands' },
            { text: '角色 Subagent', link: '/plugin/roles' },
          ],
        },
        {
          text: '开发',
          items: [
            { text: '插件开发指南', link: '/plugin/dev-guide' },
            { text: '插件发布', link: '/plugin/publishing' },
          ],
        },
      ],
      '/templates/': [
        {
          text: '使用',
          items: [{ text: '概览', link: '/templates/overview' }],
        },
        {
          text: '开发',
          items: [
            { text: '模板开发指南', link: '/templates/dev-guide' },
            { text: '模板发布', link: '/templates/publishing' },
          ],
        },
      ],
    },

    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一页', next: '下一页' },
    lastUpdated: { text: '最后更新', formatOptions: { dateStyle: 'short', timeStyle: 'short' } },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',

    socialLinks: [{ icon: 'github', link: 'https://github.com/pig0224/agile-docs' }],
    footer: {
      message: '基于 MIT 协议发布',
      copyright: 'FCC-Agile 生态文档 · <a href="https://github.com/pig0224/agile-docs" target="_blank">GitHub</a>',
    },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            noResultsText: '没有找到结果',
            resetButtonTitle: '清除查询',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
          },
        },
      },
    },
  },
});
