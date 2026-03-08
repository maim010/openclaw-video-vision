import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'openclaw-video-vision',
  description: 'AI-powered video understanding — crawl any video platform, extract key frames, get structured summaries powered by vision AI.',
  base: '/openclaw-video-vision/',

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
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/maim010/openclaw-video-vision' }
    ]
  }
})
