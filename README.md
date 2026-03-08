# 🎬 openclaw-video-vision

> **AI-powered video understanding** — Crawl any video platform, extract key frames, get structured summaries powered by vision AI.

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://clawhub.com"><img src="https://img.shields.io/badge/OpenClaw-Skill-orange" alt="OpenClaw Skill"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-%3E%3D18-green" alt="Node.js"></a>
  <a href="https://playwright.dev"><img src="https://img.shields.io/badge/Playwright-Chromium-2EAD33" alt="Playwright"></a>
  <a href="https://ffmpeg.org"><img src="https://img.shields.io/badge/FFmpeg-required-blue" alt="FFmpeg"></a>
</p>

<p align="center">
  <b>YouTube</b> · <b>Bilibili</b> · <b>Any Video Page</b>
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
                          ┌───────────────────────┐
                          │  🕷️ Playwright Browser │
                          │   Headless Chromium    │
                          └───────────┬───────────┘
                                      │
                      ┌───────────────┴───────────────┐
                      ▼                               ▼
            ┌──────────────────┐            ┌──────────────────┐
            │ 📹 Direct Video  │            │ 📸 Screenshot    │
            │    Download      │            │    Fallback      │
            └────────┬─────────┘            └────────┬─────────┘
                     │                               │
                     └───────────────┬───────────────┘
                                     ▼
                          ┌───────────────────────┐
                          │  🖼️ FFmpeg Extract     │
                          │   Key Frames (N fps)  │
                          └───────────┬───────────┘
                                      ▼
                          ┌───────────────────────┐
                          │  🤖 Vision AI Model    │
                          │  GPT-4o / Claude /    │
                          │  Gemini / LLaVA ...   │
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

---

## 🚀 Quick Start

### Install

```bash
# Via ClawHub
clawhub install video-vision

# Or manually
git clone https://github.com/maim010/openclaw-video-vision.git ~/.openclaw/skills/video-vision
cd ~/.openclaw/skills/video-vision
npm install
npx playwright install chromium
```

### Prerequisites

| Dependency | Install |
|------------|---------|
| Node.js ≥ 18 | [nodejs.org](https://nodejs.org) |
| FFmpeg | `brew install ffmpeg` / `apt install ffmpeg` |
| Vision API Key | [OpenAI](https://platform.openai.com) / [Anthropic](https://console.anthropic.com) / etc. |

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
          "VIDEO_VISION_COOKIES_DIR": "~/.openclaw/cookies"
        }
      }
    ]
  }
}
```

| Variable | Default | Description |
|----------|---------|-------------|
| `VIDEO_VISION_API_KEY` | *required* | Vision model API key |
| `VIDEO_VISION_API_URL` | `https://api.openai.com/v1/chat/completions` | Custom API endpoint |
| `VIDEO_VISION_MODEL` | `gpt-4o` | Vision model to use |
| `VIDEO_VISION_PROXY` | — | Default proxy URL |
| `VIDEO_VISION_FRAME_INTERVAL` | `5` | Seconds between frames |
| `VIDEO_VISION_MAX_FRAMES` | `20` | Max frames per video |
| `VIDEO_VISION_COOKIES_DIR` | — | Cookie files directory |

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
├── src/
│   └── index.js              # Core: crawler, frame extractor, vision client
├── skills/
│   └── video-vision/
│       └── SKILL.md          # OpenClaw skill manifest
├── examples/
│   ├── youtube_example.js    # YouTube usage demo
│   └── bilibili_example.js   # Bilibili usage demo
├── docs/
│   └── cookie-setup.md       # Cookie export & config guide
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
