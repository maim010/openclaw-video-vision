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
> 总结一下这个视频: https://youtube.com/watch?v=xxxxx
```

```
🎬 视频摘要: OpenAI 放大招！深夜发布GPT-5.4，真正实现原生操控电脑，
   OpenClaw 天选模型来了，附配置教程！ | 零度解说

📺 平台: YouTube | 时长: 9:46
👁️  分析帧数: 117（每 ~5 秒一帧）
🔗 URL: https://youtube.com/watch?v=2WbwRwmDHlA

摘要:
该视频是对最新发布的 GPT-5.4 模型的技术教程和测评，重点介绍了其通过
OpenClaw 智能体框架实现的突破性「原生电脑操控」能力。讲者展示了 GPT-5.4
与 GPT-5.2、GPT-5.3 等模型的性能对比基准，在推理、文档生成和浏览器自动化
方面有显著提升。视频核心内容是 Windows 用户的手把手教程：安装 OpenClaw、
配置 OpenAI API 密钥、在 Codex 应用中切换到 GPT-5.4 以实现完整系统访问。

关键时刻:
- 第 ~2 帧:  基准测试图表，GPT-5.4 以 97% 准确率位居榜首
- 第 ~14 帧: 柱状图对比 GPT-5.4、GPT-5.2 等模型（83% 胜率）
- 第 ~48 帧: Windows 安装教程开始 — PowerShell 终端
- 第 ~50 帧: "OpenClaw installed successfully (2026.3.2)!"
- 第 ~56 帧: 引导终端 — 选择 "OpenAI Codex" API 服务商
- 第 ~82 帧: 从 Microsoft Store 下载官方 Codex 应用
- 第 ~91 帧: 在 Codex 中从模型列表选择 "GPT-5.4"
- 第 ~94 帧: 启用「完全访问权限」实现电脑操控

主题标签: GPT-5.4, OpenClaw, AI Agent, 电脑操控, OpenAI, Codex,
          模型基准测试, Windows 教程, API 密钥, AI 自动化
```

---

## 快速开始

### 1. 安装

```bash
# 方式 A：npm（推荐）
npm install @maim010/openclaw-video-vision@latest

# 方式 B：git clone
git clone https://github.com/maim010/openclaw-video-vision.git ~/.openclaw/workspace/skills/video-vision
cd ~/.openclaw/workspace/skills/video-vision
npm install
```

依赖：**Node.js >= 18**、**FFmpeg**（`brew install ffmpeg` / `apt install ffmpeg`）、视觉 API 密钥。

推荐安装：**yt-dlp**（`brew install yt-dlp` / `pip install yt-dlp`），效果最佳。

音频转录（16 核/16GB+ 机器默认开启）：**[whisper.cpp](https://github.com/ggml-org/whisper.cpp)**，安装步骤见下方。

> **低资源模式：** 如果机器 CPU 少于 12 核或 RAM 少于 14GB，设置 `VIDEO_VISION_LOW_RESOURCE=true` 可跳过转录和资源检查。

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
> 总结一下这个 YouTube 视频: https://youtube.com/watch?v=xxxxx
> 这个 B 站视频讲了什么？ https://bilibili.com/video/xxxxx
```

或直接运行：

```bash
export VIDEO_VISION_API_KEY="sk-..."
node src/index.js https://youtube.com/watch?v=xxxxx
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
                   ┌────┴────┐
                   │ FFmpeg  │（并行）
                   ├─────────┤
                   │ 视频帧  │  →  JPG 文件
                   │ 音频    │  →  16kHz 单声道 WAV
                   └────┬────┘
                        │
                   ┌────┴──────────┐
                   │ whisper-cli   │  →  带时间戳的转录文本
                   │ (ggml-medium) │
                   └────┬──────────┘
                        ▼
              ┌───────────────────┐
              │ 视觉 AI 模型       │
              │（视频帧 + 转录文本）│
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
| **音频转录** | 本地 whisper.cpp — 语音转文字注入视觉提示词 |
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
| `VIDEO_VISION_LOW_RESOURCE` | `false` | 跳过资源检查，禁用转录 |
| `VIDEO_VISION_TRANSCRIPTION` | `auto` | `auto` / `on` / `off` |
| `VIDEO_VISION_WHISPER_PATH` | `whisper-cli` | whisper-cli 二进制文件路径 |
| `VIDEO_VISION_WHISPER_MODEL` | `medium` | 模型：tiny/base/small/medium/large-v3 |
| `VIDEO_VISION_BROWSER` | `local` | `local` / `browserless` / `browserbase` / `steel` |

完整配置参考：[中文文档](https://maim010.github.io/openclaw-video-vision/zh/configuration)

---

## 参与贡献

欢迎贡献！特别期待以下方向：

- **更多平台** — TikTok、Twitter/X、Vimeo、Dailymotion
- **更智能的提取** — 场景切换检测、~~音频转录~~（已实现！）、关键帧检测
- **模型适配器** — 本地模型（LLaVA、CogVLM）、更多服务商
- **输出格式** — JSON 导出、SRT 字幕、Markdown 报告

详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

---

## 许可证

MIT © [maim010](https://github.com/maim010)

## 赞助

本项目由 [zmto](https://zmto.com) 赞助，感谢对开源的支持！
