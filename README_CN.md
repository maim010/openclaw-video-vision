# openclaw-video-vision

> **不用看视频，也能理解视频。让 AI 来。**

给它一个链接 — YouTube、Bilibili 或任何有视频的网页 — 返回结构化摘要，包含关键时刻、时间戳和主题标签。由视觉 AI 驱动。

<p align="center">
  <a href="https://github.com/maim010/openclaw-video-vision/stargazers"><img src="https://img.shields.io/github/stars/maim010/openclaw-video-vision?style=social" alt="GitHub Stars"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://clawhub.com"><img src="https://img.shields.io/badge/OpenClaw-Skill-orange" alt="OpenClaw Skill"></a>
  <a href="https://maim010.github.io/openclaw-video-vision/zh/"><img src="https://img.shields.io/badge/文档-VitePress-646CFF" alt="文档"></a>
</p>

<p align="center">
  <a href="https://maim010.github.io/openclaw-video-vision/zh/">中文文档</a> · <a href="https://maim010.github.io/openclaw-video-vision/">English Docs</a> · <a href="./README.md">English README</a>
</p>

---

## 为什么做这个？

你发现了一个 40 分钟的技术演讲、一个 2 小时的课程合集、或一个看不懂语言的 B 站教程。你没时间全看完，但又需要知道里面讲了什么。

**openclaw-video-vision** 解决的就是这个问题：粘贴链接，拿到摘要 — 关键时刻精确到时间戳，直接跳到你关心的部分。

它是一个 **OpenClaw 技能**，你只需要用自然语言告诉 AI 智能体：*「帮我总结一下这个视频」* — 剩下的它搞定。

---

## 效果演示

```
> 总结一下这个视频: https://youtube.com/watch?v=...
```

```
视频摘要: Transformer 架构入门
平台: YouTube | 时长: 18:42
分析帧数: 20（每 ~56 秒一帧）

摘要:
该视频详细讲解了 Transformer 神经网络架构，涵盖自注意力机制、
位置编码和编码器-解码器结构。讲者使用了动画示意图和代码示例。

关键时刻:
- 0:00  标题页 — 引用 "Attention Is All You Need" 论文
- 4:30  多头注意力机制示意图
- 9:20  缩放点积注意力的 Python 代码
- 14:10 RNN 与 Transformer 训练速度对比

主题标签: 深度学习, Transformer, 注意力机制, NLP
```

---

## 快速开始

### 1. 安装

```bash
git clone https://github.com/maim010/openclaw-video-vision.git ~/.openclaw/workspace/skills/video-vision
cd ~/.openclaw/workspace/skills/video-vision
npm install
```

依赖：**Node.js >= 18**、**FFmpeg**（`brew install ffmpeg` / `apt install ffmpeg`）、视觉 API 密钥。

推荐安装：**yt-dlp**（`brew install yt-dlp` / `pip install yt-dlp`），效果最佳。

### 2. 启用技能

在 `~/.openclaw/openclaw.json` 中添加：

```json
{
  "skills": {
    "entries": {
      "video-vision": {
        "enabled": true,
        "env": {
          "VIDEO_VISION_API_KEY": "sk-..."
        }
      }
    }
  }
}
```

### 3. 使用

对 OpenClaw 智能体说：

```
> 总结一下这个 YouTube 视频: https://youtube.com/watch?v=dQw4w9WgXcQ
> 这个 B 站视频讲了什么？ https://bilibili.com/video/BV1xx411c7mD
```

或直接运行：

```bash
export VIDEO_VISION_API_KEY="sk-..."
node src/index.js https://youtube.com/watch?v=dQw4w9WgXcQ
```

---

## 工作原理

```
URL + Cookies + 代理（可选）
        │
        ▼
┌─────────────────────────┐     ┌──────────────────────────┐
│ 阶段 1: yt-dlp          │────▶│ 阶段 2: 浏览器            │
│ 提取 URL + 元数据        │失败 │ Playwright（本地/云）      │
│ FFmpeg 抽帧              │     │ 爬取 → FFmpeg 或          │
└────────────┬────────────┘     │ 截图回退                   │
             │                  └─────────────┬────────────┘
             └──────────┬─────────────────────┘
                        ▼
              ┌───────────────────┐
              │ 视觉 AI 模型       │
              │ (GPT-4o, Claude,  │
              │  Gemini 等)       │
              └────────┬──────────┘
                       ▼
                结构化摘要
              + 关键时刻 + 时间戳
              + 主题标签
```

**两条提取路径**，自动回退：
- **yt-dlp + FFmpeg**（首选）— 速度快，不需要浏览器
- **Playwright 浏览器** — 用于 yt-dlp 搞不定的站点，支持云浏览器（Browserless / Browserbase / Steel）

---

## 功能特性

| | |
|---|---|
| **支持平台** | YouTube、Bilibili、任何包含 `<video>` 元素的网页 |
| **视觉 AI** | 兼容任何 OpenAI 格式端点 — GPT-4o、Claude、Gemini、本地模型 |
| **代理** | HTTP / HTTPS / SOCKS5，支持单次请求或全局配置 |
| **Cookie** | Netscape 和 JSON 格式，访问需登录 / 年龄限制的内容 |
| **云浏览器** | Browserless、Browserbase、Steel — 无需本地 Chromium |
| **可配置** | 抽帧间隔、最大帧数、提取模式（`auto`/`ytdlp`/`browser`） |
| **跨平台** | macOS、Linux、Windows、Android/Termux（yt-dlp 模式）、CI/无服务器 |

---

## 配置

所有设置通过环境变量或 `~/.openclaw/openclaw.json`：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `VIDEO_VISION_API_KEY` | *必填* | 视觉模型 API 密钥 |
| `VIDEO_VISION_API_URL` | OpenAI 端点 | 任意 OpenAI 兼容的视觉端点 |
| `VIDEO_VISION_MODEL` | `gpt-4o` | 使用的视觉模型 |
| `VIDEO_VISION_MODE` | `auto` | `auto` / `ytdlp` / `browser` |
| `VIDEO_VISION_PROXY` | — | 默认代理地址 |
| `VIDEO_VISION_FRAME_INTERVAL` | `5` | 抽帧间隔（秒） |
| `VIDEO_VISION_MAX_FRAMES` | `20` | 每个视频最大帧数 |
| `VIDEO_VISION_BROWSER` | `local` | `local` / `browserless` / `browserbase` / `steel` |

完整配置参考：[中文文档](https://maim010.github.io/openclaw-video-vision/zh/configuration)

---

## 参与贡献

欢迎贡献！特别期待以下方向：

- **更多平台** — TikTok、Twitter/X、Vimeo、Dailymotion
- **更智能的提取** — 场景切换检测、音频转录
- **模型适配器** — 本地模型（LLaVA、CogVLM）、更多服务商
- **输出格式** — JSON 导出、SRT 字幕、Markdown 报告

详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

---

## 许可证

MIT © [maim010](https://github.com/maim010)

## 赞助

本项目由 [zmto](https://zmto.com) 赞助，感谢对开源的支持！
