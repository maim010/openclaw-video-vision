# 🎬 openclaw-video-vision

> An [OpenClaw](https://github.com/openclaw/openclaw) skill that crawls YouTube, Bilibili, and other video platforms using Playwright, extracts key frames via FFmpeg, and summarizes video content using vision AI models.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![OpenClaw Skill](https://img.shields.io/badge/OpenClaw-Skill-orange)](https://clawhub.com)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green)](https://nodejs.org)

---

## ✨ Features

- 🕷️ **Playwright-based crawling** — headless Chromium scrapes YouTube, Bilibili, and generic video pages
- 🖼️ **Key frame extraction** — FFmpeg samples frames at configurable intervals across the full video duration
- 🤖 **Vision AI summarization** — sends frames to any OpenAI-compatible vision model endpoint (GPT-4o, Claude, Gemini, etc.)
- 🌐 **Proxy support** — configure HTTP, HTTPS, or SOCKS5 proxies per-request or globally
- 🍪 **Cookie injection** — load Netscape or JSON cookie files for authenticated access to private/age-restricted content
- 📋 **Structured output** — returns title, duration, key moments with timestamps, and topic tags

---

## 🚀 Quick Start

### Install via ClawHub

```bash
clawhub install video-vision
```

### Manual Install

```bash
git clone https://github.com/maim010/openclaw-video-vision.git ~/.openclaw/skills/video-vision
cd ~/.openclaw/skills/video-vision
npm install
npx playwright install chromium
```

### Prerequisites

- Node.js ≥ 18
- FFmpeg (`brew install ffmpeg` / `sudo apt install ffmpeg`)
- A vision-capable AI API key (OpenAI, Anthropic, etc.)

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
|---|---|---|
| `VIDEO_VISION_API_KEY` | *required* | Vision model API key |
| `VIDEO_VISION_API_URL` | OpenAI v1 | Custom API endpoint |
| `VIDEO_VISION_MODEL` | `gpt-4o` | Model to use |
| `VIDEO_VISION_PROXY` | — | Default proxy URL |
| `VIDEO_VISION_FRAME_INTERVAL` | `5` | Seconds between frames |
| `VIDEO_VISION_MAX_FRAMES` | `20` | Max frames per video |
| `VIDEO_VISION_COOKIES_DIR` | — | Cookie files directory |

---

## 💬 Usage with OpenClaw

Once installed, just ask your OpenClaw agent:

```
Summarize this YouTube video: https://youtube.com/watch?v=dQw4w9WgXcQ
```

```
What is this Bilibili video about? https://www.bilibili.com/video/BV1xx411c7mD
  Use proxy 127.0.0.1:7890 and my cookies at ~/bilibili_cookies.json
```

```
Summarize all videos in this playlist: https://youtube.com/playlist?list=PLxxxxxx
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

## 🍪 Cookie File Formats

**JSON format** (`~/.openclaw/cookies/youtube_cookies.json`):
```json
[
  { "name": "SID", "value": "xxx", "domain": ".youtube.com", "path": "/" },
  { "name": "HSID", "value": "yyy", "domain": ".youtube.com", "path": "/" }
]
```

**Netscape format** (`~/.openclaw/cookies/bilibili_cookies.txt`):
```
# Netscape HTTP Cookie File
.bilibili.com	TRUE	/	FALSE	1893456000	SESSDATA	your_value_here
```

Export cookies from your browser using extensions like [EditThisCookie](https://chrome.google.com/webstore/detail/editthiscookie) or [Cookie-Editor](https://cookie-editor.cgagnier.ca/).

---

## 🖥️ CLI Usage

```bash
# Basic
node src/index.js https://youtube.com/watch?v=XXXXX

# With proxy
node src/index.js https://www.bilibili.com/video/BVXXXXX --proxy=http://127.0.0.1:7890

# With cookies
node src/index.js https://youtube.com/watch?v=XXXXX --cookies=~/youtube_cookies.json
```

---

## 🗂️ Project Structure

```
openclaw-video-vision/
├── skills/
│   └── video-vision/
│       └── SKILL.md          # OpenClaw AgentSkills manifest
├── src/
│   └── index.js              # Core crawler, frame extractor & vision client
├── examples/
│   ├── youtube_example.js    # YouTube usage example
│   └── bilibili_example.js   # Bilibili usage example
├── docs/
│   └── cookie-setup.md       # Cookie export guide
├── package.json
├── .gitignore
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or PR for:
- New platform support (Twitter/X, TikTok, Vimeo, etc.)
- Alternative frame extraction strategies
- Additional vision model adapters

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

MIT © [maim010](https://github.com/maim010)
