import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'openclaw-video-vision',
  description: 'AI-powered video understanding — crawl any video platform, extract key frames, get structured summaries powered by vision AI.',
  base: '/openclaw-video-vision/',

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/' },
          { text: 'GitHub', link: 'https://github.com/maim010/openclaw-video-vision' }
        ],
        sidebar: [
          {
            text: 'Getting Started',
            items: [
              { text: 'Home', link: '/' },
              { text: 'Installation', link: '/installation' },
              { text: 'Configuration', link: '/configuration' }
            ]
          },
          {
            text: 'Guides',
            items: [
              { text: 'Extraction Modes', link: '/extraction-modes' },
              { text: 'Cloud Browsers', link: '/cloud-browsers' },
              { text: 'Cookies', link: '/cookies' }
            ]
          },
          {
            text: 'Reference',
            items: [
              { text: 'Architecture', link: '/architecture' },
              { text: 'Troubleshooting', link: '/troubleshooting' }
            ]
          }
        ]
      }
    },
    zh: {
      label: '中文',
      lang: 'zh-CN',
      title: 'openclaw-video-vision',
      description: 'AI 驱动的视频理解 — 抓取任意视频平台，提取关键帧，通过视觉 AI 生成结构化摘要。',
      themeConfig: {
        nav: [
          { text: '首页', link: '/zh/' },
          { text: 'GitHub', link: 'https://github.com/maim010/openclaw-video-vision' }
        ],
        sidebar: [
          {
            text: '快速开始',
            items: [
              { text: '首页', link: '/zh/' },
              { text: '安装', link: '/zh/installation' },
              { text: '配置', link: '/zh/configuration' }
            ]
          },
          {
            text: '使用指南',
            items: [
              { text: '提取模式', link: '/zh/extraction-modes' },
              { text: '云浏览器', link: '/zh/cloud-browsers' },
              { text: 'Cookie', link: '/zh/cookies' }
            ]
          },
          {
            text: '参考',
            items: [
              { text: '架构', link: '/zh/architecture' },
              { text: '故障排查', link: '/zh/troubleshooting' }
            ]
          }
        ]
      }
    }
  },

  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/maim010/openclaw-video-vision' }
    ]
  }
})
