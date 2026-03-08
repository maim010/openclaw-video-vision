<a href="./README_CN.md">📖 简体中文</a>
# 🎬 openclaw-video-vision

> **AI-powered video understanding** — Crawl any video platform, extract key frames, get structured summaries powered by vision AI.

<p align="center">
  <a href="https://github.com/maim010/openclaw-video-vision/stargazers"><img src="https://img.shields.io/github/stars/maim010/openclaw-video-vision?style=social" alt="GitHub Stars"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://clawhub.com"><img src="https://img.shields.io/badge/OpenClaw-Skill-orange" alt="OpenClaw Skill"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-%3E%3D18-green" alt="Node.js"></a>
  <a href="https://playwright.dev"><img src="https://img.shields.io/badge/Playwright--Core-Chromium-2EAD33" alt="Playwright"></a>
  <a href="https://ffmpeg.org"><img src="https://img.shields.io/badge/FFmpeg-required-blue" alt="FFmpeg"></a>
  <a href="https://maim010.github.io/openclaw-video-vision/"><img src="https://img.shields.io/badge/Docs-VitePress-646CFF" alt="Documentation"></a>
</p>

<p align="center">
  <b>YouTube</b> · <b>Bilibili</b> · <b>Any Video Page</b>
</p>

<p align="center">
  <a href="https://maim010.github.io/openclaw-video-vision/">📖 Documentation</a> · <a href="https://maim010.github.io/openclaw-video-vision/zh/">📖 中文文档</a>
</p>

---

## How It Works

```
                    ┌─────────────────────────────────────────────┐
                    │             openclaw-video-vision            │
                    └─────────────────────────────────────────────┘
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              ▼                         ▼                         ▼
     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
     │   🔗 Input URL   │     │   🍪 Cookies     │     │   🌐 Proxy      │
     │  YouTube / B站   │     │  (optional)      │     │  (optional)     │
     └────────┬────────┘     └────────┬────────┘     └────────┬────────┘
              │                       │                       │
              └───────────────────────┼───────────────────────┘
                                      ▼
                    ┌─────────────────────────────────┐
                    │  Phase 1: yt-dlp (if available)  │
                    │  Extract URL + metadata directly │
                    └───────────────┬─────────────────┘
                                    │
                          ┌─────────┴─────────┐
                          │ success?          │ fail / not installed
                          ▼                   ▼
                ┌──────────────────┐  ┌───────────────────────┐
                │ 🖼️ FFmpeg Extract │  │ Phase 2: Browser      │
                │   Key Frames     │  │ Playwright (local or  │
                │   (with headers) │  │ cloud) → scrape meta  │
                └────────┬─────────┘  └───────────┬───────────┘
                         │                        │
                         │           ┌────────────┴────────────┐
                         │           ▼                         ▼
                         │  ┌──────────────────┐   ┌──────────────────┐
                         │  │ 📹 FFmpeg Extract │   │ 📸 Screenshot    │
                         │  │   (if video URL) │   │ Fallback (click  │
                         │  └────────┬─────────┘   │ play + seek)     │
                         │           │             └────────┬─────────┘
                         └───────────┼─────────────────────┘
                                     ▼
                          ┌───────────────────────┐
                          │  🤖 Vision AI Model    │
                          │  Any OpenAI-compatible │
                          │  endpoint              │
                          └───────────┬───────────┘
                                      ▼
                          ┌───────────────────────┐
                          │  📋 Structured Output  │
                          │  Summary + Moments +  │
                          │  Topics + Timestamps  │
                          └───────────────────────┘
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🕷️ **Smart Crawling** | Playwright headless browser with platform-specific scrapers |
| 🖼️ **Frame Extraction** | FFmpeg samples frames at configurable intervals, with screenshot fallback |
| 🤖 **Vision AI** | Works with any OpenAI-compatible vision endpoint (GPT-4o, Claude, Gemini, etc.) |
| 🌐 **Proxy Support** | HTTP / HTTPS / SOCKS5 — per-request or global |
| 🍪 **Cookie Injection** | Netscape & JSON formats for authenticated / age-restricted content |
| 📋 **Structured Output** | Title, duration, key moments with timestamps, topic tags |
| 📥 **yt-dlp Integration** | Preferred path for video URL extraction — no browser needed (optional) |
| ☁️ **Cloud Browsers** | Browserless, Browserbase, Steel — run without local Chromium |

---

## 🚀 Quick Start

### Prerequisites

| Dependency | Required | Install |
|------------|----------|---------|
| Node.js >= 18 | Yes | [nodejs.org](https://nodejs.org) |
| FFmpeg | Yes | `brew install ffmpeg` / `apt install ffmpeg` |
| Vision API Key | Yes | [OpenAI](https://platform.openai.com) / [Anthropic](https://console.anthropic.com) / etc. |
| yt-dlp | Recommended | `brew install yt-dlp` / `pip install yt-dlp` |
| Chromium | Optional (browser fallback only) | `npm install playwright-core && npx playwright-core install chromium` |

### Install

```bash
git clone https://github.com/maim010/openclaw-video-vision.git ~/.openclaw/workspace/skills/video-vision
cd ~/.openclaw/workspace/skills/video-vision
npm install

# Only needed for local browser mode (not needed for cloud browsers)
npx playwright-core install chromium

# Recommended: install yt-dlp for best video URL extraction
# macOS: brew install yt-dlp
# pip:   pip install yt-dlp
```

Then enable the skill in `~/.openclaw/openclaw.json`:

```json
{
  "skills": {
    "entries": {
      "video-vision": {
        "enabled": true
      }
    }
  }
}
```

### Run

```bash
# Set your API key
export VIDEO_VISION_API_KEY="sk-..."

# Summarize a video
node src/index.js https://youtube.com/watch?v=dQw4w9WgXcQ

# With proxy
node src/index.js https://www.bilibili.com/video/BV1xx411c7mD --proxy=http://127.0.0.1:7890

# With cookies
node src/index.js https://youtube.com/watch?v=XXXXX --cookies=~/youtube_cookies.json
```

---

## 💬 Usage with OpenClaw

Once installed, just talk to your OpenClaw agent:

```
> Summarize this YouTube video: https://youtube.com/watch?v=dQw4w9WgXcQ
```

```
> What is this Bilibili video about? https://www.bilibili.com/video/BV1xx411c7mD
  Use proxy 127.0.0.1:7890 and my cookies at ~/bilibili_cookies.json
```

```
> Summarize all videos in this playlist: https://youtube.com/playlist?list=PLxxxxxx
```

### Example Output

```
🎬 Video Summary: Introduction to Transformer Architecture
📺 Platform: YouTube | Duration: 18:42
👁️  Frames analyzed: 20 (every ~56s)
🔗 URL: https://youtube.com/watch?v=...

SUMMARY:
This video provides a detailed walkthrough of the Transformer neural network
architecture, covering self-attention mechanisms, positional encoding, and
encoder-decoder structures. The presenter uses animated diagrams and code examples.

KEY MOMENTS:
- Frame ~1: Title slide with "Attention Is All You Need" paper reference
- Frame ~5: Diagram showing multi-head attention mechanism
- Frame ~10: Python code for scaled dot-product attention
- Frame ~15: Comparison of RNN vs Transformer training speed

TOPICS: deep learning, transformers, attention mechanism, NLP, neural networks
```

---

## ⚙️ Configuration

Set environment variables or add to `~/.openclaw/openclaw.json`:

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
          "VIDEO_VISION_COOKIES_DIR": "~/.openclaw/cookies",
          "VIDEO_VISION_BROWSER": "local"
        }
      }
    ]
  }
}
```

| Variable | Default | Description |
|----------|---------|-------------|
| `VIDEO_VISION_API_KEY` | *required* | Vision model API key |
| `VIDEO_VISION_API_URL` | `https://api.openai.com/v1/chat/completions` | Any OpenAI-compatible vision endpoint |
| `VIDEO_VISION_MODEL` | `gpt-4o` | Vision model to use |
| `VIDEO_VISION_MODE` | `auto` | Extraction mode: `auto` (try yt-dlp first, fall back to browser) / `ytdlp` (yt-dlp + FFmpeg only, no browser) / `browser` (browser only, skip yt-dlp) |
| `VIDEO_VISION_PROXY` | — | Default proxy URL |
| `VIDEO_VISION_FRAME_INTERVAL` | `5` | Seconds between frames |
| `VIDEO_VISION_MAX_FRAMES` | `20` | Max frames per video |
| `VIDEO_VISION_COOKIES_DIR` | — | Cookie files directory |
| `VIDEO_VISION_BROWSER` | `local` | Browser mode: `local` / `browserless` / `browserbase` / `steel` |
| `VIDEO_VISION_BROWSERLESS_TOKEN` | — | [Browserless](https://www.browserless.io/) API token |
| `VIDEO_VISION_BROWSERBASE_API_KEY` | — | [Browserbase](https://www.browserbase.com/) API key |
| `VIDEO_VISION_BROWSERBASE_PROJECT_ID` | — | Browserbase project ID |
| `VIDEO_VISION_STEEL_API_KEY` | — | [Steel](https://steel.dev/) API key |

---

## ☁️ Cloud Browsers

If you don't want to install Chromium locally (e.g. in a serverless or CI environment), you can connect to a cloud browser instead. Set `VIDEO_VISION_BROWSER` to one of the supported providers:

| Provider | Env Vars Needed | Free Tier |
|----------|----------------|-----------|
| [Browserless](https://www.browserless.io/) | `VIDEO_VISION_BROWSERLESS_TOKEN` | 1,000 units/month |
| [Browserbase](https://www.browserbase.com/) | `VIDEO_VISION_BROWSERBASE_API_KEY` + `VIDEO_VISION_BROWSERBASE_PROJECT_ID` | 100 sessions/month |
| [Steel](https://steel.dev/) | `VIDEO_VISION_STEEL_API_KEY` | 100 sessions/month |

**Example — Steel:**

```bash
export VIDEO_VISION_BROWSER=steel
export VIDEO_VISION_STEEL_API_KEY="your-key"
node src/index.js https://youtube.com/watch?v=dQw4w9WgXcQ
```

When using a cloud browser, you do **not** need to run `npx playwright-core install chromium`.

---

## 🍪 Cookies

For authenticated / age-restricted content, provide cookie files. See the full [Cookie Setup Guide](docs/cookie-setup.md).

**JSON format** — `youtube_cookies.json`:
```json
[
  { "name": "SID", "value": "xxx", "domain": ".youtube.com", "path": "/" }
]
```

**Netscape format** — `bilibili_cookies.txt`:
```
.bilibili.com	TRUE	/	FALSE	1893456000	SESSDATA	your_value
```

---

## 🗂️ Project Structure

```
openclaw-video-vision/
├── SKILL.md                 # OpenClaw skill manifest (name + description + instructions)
├── src/
│   └── index.js              # Core: yt-dlp, crawler, frame extractor, vision client
├── examples/
│   ├── youtube_example.js    # YouTube usage demo
│   └── bilibili_example.js   # Bilibili usage demo
├── docs/                     # VitePress documentation (EN + 中文)
├── package.json
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! We'd especially love help with:

- 🎯 **New platforms** — TikTok, Twitter/X, Vimeo, Dailymotion
- 🧠 **Smarter extraction** — scene-change detection, audio transcription
- 🔌 **Model adapters** — local models (LLaVA, CogVLM), more API providers
- 📦 **Output formats** — JSON export, SRT subtitles, markdown reports

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

MIT © [maim010](https://github.com/maim010)

## 🙏 Sponsorship

This project is sponsored by [zmto](https://zmto.com). Thank you for supporting open source!
