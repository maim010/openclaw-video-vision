# 🎬 openclaw-video-vision

> **AI 驱动的视频理解工具** — 爬取任意视频平台，提取关键帧，通过视觉 AI 生成结构化摘要。

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://clawhub.com"><img src="https://img.shields.io/badge/OpenClaw-Skill-orange" alt="OpenClaw Skill"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-%3E%3D18-green" alt="Node.js"></a>
  <a href="https://playwright.dev"><img src="https://img.shields.io/badge/Playwright-Chromium-2EAD33" alt="Playwright"></a>
  <a href="https://ffmpeg.org"><img src="https://img.shields.io/badge/FFmpeg-required-blue" alt="FFmpeg"></a>
</p>

<p align="center">
  <b>YouTube</b> · <b>Bilibili</b> · <b>任意视频网页</b>
</p>

<p align="center">
  <a href="./README.md">📖 English</a>
</p>

---

## 工作原理

```
                    ┌─────────────────────────────────────────────┐
                    │             openclaw-video-vision            │
                    └─────────────────────────────────────────────┘
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              ▼                         ▼                         ▼
     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
     │  🔗 输入视频 URL  │     │  🍪 Cookies      │     │  🌐 代理         │
     │  YouTube / B站   │     │  （可选）          │     │  （可选）         │
     └────────┬────────┘     └────────┬────────┘     └────────┬────────┘
              │                       │                       │
              └───────────────────────┼───────────────────────┘
                                      ▼
                          ┌───────────────────────┐
                          │  🕷️ Playwright 浏览器   │
                          │   无头 Chromium         │
                          └───────────┬───────────┘
                                      │
                      ┌───────────────┴───────────────┐
                      ▼                               ▼
            ┌──────────────────┐            ┌──────────────────┐
            │  📹 直接下载视频  │            │  📸 截图回退方案   │
            └────────┬─────────┘            └────────┬─────────┘
                     │                               │
                     └───────────────┬───────────────┘
                                     ▼
                          ┌───────────────────────┐
                          │  🖼️ FFmpeg 抽帧         │
                          │   按间隔提取关键帧      │
                          └───────────┬───────────┘
                                      ▼
                          ┌───────────────────────┐
                          │  🤖 视觉 AI 模型        │
                          │  GPT-4o / Claude /     │
                          │  Gemini / LLaVA ...    │
                          └───────────┬───────────┘
                                      ▼
                          ┌───────────────────────┐
                          │  📋 结构化输出           │
                          │  摘要 + 关键时刻 +      │
                          │  主题标签 + 时间戳       │
                          └───────────────────────┘
```

---

## ✨ 功能特性

| 功能 | 说明 |
|------|------|
| 🕷️ **智能爬取** | 基于 Playwright 无头浏览器，针对不同平台定制爬虫 |
| 🖼️ **关键帧提取** | FFmpeg 按可配置间隔抽帧，支持截图回退 |
| 🤖 **视觉 AI 分析** | 兼容任何 OpenAI 格式的视觉模型接口（GPT-4o、Claude、Gemini 等） |
| 🌐 **代理支持** | HTTP / HTTPS / SOCKS5 — 支持单次请求或全局配置 |
| 🍪 **Cookie 注入** | 支持 Netscape 和 JSON 格式，可访问需登录/年龄限制的内容 |
| 📋 **结构化输出** | 返回标题、时长、关键时刻及时间戳、主题标签 |

---

## 🚀 快速开始

### 安装

```bash
git clone https://github.com/maim010/openclaw-video-vision.git ~/.openclaw/skills/video-vision
cd ~/.openclaw/skills/video-vision
npm install
npx playwright install chromium
```

### 前置依赖

| 依赖 | 安装方式 |
|------|----------|
| Node.js ≥ 18 | [nodejs.org](https://nodejs.org) |
| FFmpeg | `brew install ffmpeg` / `apt install ffmpeg` |
| 视觉 AI API Key | [OpenAI](https://platform.openai.com) / [Anthropic](https://console.anthropic.com) 等 |

### 运行

```bash
# 设置 API Key
export VIDEO_VISION_API_KEY="sk-..."

# 总结一个视频
node src/index.js https://youtube.com/watch?v=dQw4w9WgXcQ

# 使用代理
node src/index.js https://www.bilibili.com/video/BV1xx411c7mD --proxy=http://127.0.0.1:7890

# 使用 Cookies
node src/index.js https://youtube.com/watch?v=XXXXX --cookies=~/youtube_cookies.json
```

---

## 💬 在 OpenClaw 中使用

安装后，直接对 OpenClaw 智能体说：

```
> 总结一下这个 YouTube 视频: https://youtube.com/watch?v=dQw4w9WgXcQ
```

```
> 这个 B 站视频讲了什么？https://www.bilibili.com/video/BV1xx411c7mD
  使用代理 127.0.0.1:7890，cookies 文件在 ~/bilibili_cookies.json
```

```
> 总结这个播放列表里的所有视频: https://youtube.com/playlist?list=PLxxxxxx
```

### 输出示例

```
🎬 视频摘要: Transformer 架构入门
📺 平台: YouTube | 时长: 18:42
👁️  分析帧数: 20（每 ~56 秒一帧）
🔗 URL: https://youtube.com/watch?v=...

摘要:
该视频详细讲解了 Transformer 神经网络架构，涵盖自注意力机制、位置编码和
编码器-解码器结构。讲者使用了动画示意图和代码示例。

关键时刻:
- 第 ~1 帧: 标题页，引用 "Attention Is All You Need" 论文
- 第 ~5 帧: 多头注意力机制示意图
- 第 ~10 帧: 缩放点积注意力的 Python 代码
- 第 ~15 帧: RNN 与 Transformer 训练速度对比

主题标签: 深度学习, Transformer, 注意力机制, NLP, 神经网络
```

---

## ⚙️ 配置

通过环境变量或 `~/.openclaw/openclaw.json` 配置：

```json
{
  "skills": {
    "entries": [
      {
        "name": "video-vision",
        "env": {
          "VIDEO_VISION_API_KEY": "sk-...",
          "VIDEO_VISION_MODEL": "gpt-4o",
          "VIDEO_VISION_PROXY": "http://127.0.0.1:7890",
          "VIDEO_VISION_FRAME_INTERVAL": "5",
          "VIDEO_VISION_MAX_FRAMES": "20",
          "VIDEO_VISION_COOKIES_DIR": "~/.openclaw/cookies"
        }
      }
    ]
  }
}
```

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `VIDEO_VISION_API_KEY` | *必填* | 视觉模型 API Key |
| `VIDEO_VISION_API_URL` | `https://api.openai.com/v1/chat/completions` | 自定义 API 端点 |
| `VIDEO_VISION_MODEL` | `gpt-4o` | 使用的视觉模型 |
| `VIDEO_VISION_PROXY` | — | 默认代理地址 |
| `VIDEO_VISION_FRAME_INTERVAL` | `5` | 抽帧间隔（秒） |
| `VIDEO_VISION_MAX_FRAMES` | `20` | 每个视频最大帧数 |
| `VIDEO_VISION_COOKIES_DIR` | — | Cookie 文件目录 |

---

## 🍪 Cookie 配置

访问需要登录或有年龄限制的内容时，需要提供 Cookie 文件。详见完整的 [Cookie 配置指南](docs/cookie-setup.md)。

**JSON 格式** — `youtube_cookies.json`：
```json
[
  { "name": "SID", "value": "xxx", "domain": ".youtube.com", "path": "/" }
]
```

**Netscape 格式** — `bilibili_cookies.txt`：
```
.bilibili.com	TRUE	/	FALSE	1893456000	SESSDATA	your_value
```

---

## 🗂️ 项目结构

```
openclaw-video-vision/
├── src/
│   └── index.js              # 核心模块：爬虫、抽帧、视觉 AI 客户端
├── skills/
│   └── video-vision/
│       └── SKILL.md          # OpenClaw 技能清单
├── examples/
│   ├── youtube_example.js    # YouTube 使用示例
│   └── bilibili_example.js   # Bilibili 使用示例
├── docs/
│   └── cookie-setup.md       # Cookie 导出与配置指南
├── package.json
├── CONTRIBUTING.md
├── LICENSE
├── README.md                 # 英文文档
└── README_CN.md              # 中文文档（本文件）
```

---

## 🤝 参与贡献

欢迎贡献代码！我们特别期待以下方向的帮助：

- 🎯 **更多平台** — TikTok、Twitter/X、Vimeo、Dailymotion
- 🧠 **更智能的提取** — 场景切换检测、音频转录
- 🔌 **模型适配器** — 本地模型（LLaVA、CogVLM）、更多 API 服务商
- 📦 **输出格式** — JSON 导出、SRT 字幕、Markdown 报告

详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

---

## 📄 许可证

MIT © [maim010](https://github.com/maim010)

## 🙏 赞助

本项目由 [zmto](https://zmto.com) 赞助，感谢对开源的支持！
