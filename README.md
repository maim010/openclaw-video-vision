# openclaw-video-vision

> **Don't watch videos to understand them. Let AI do it.**

Give it a URL — YouTube, Bilibili, or any page with a video — and get back a structured summary with key moments, timestamps, and topic tags. Powered by vision AI.

<p align="center">
  <a href="https://github.com/maim010/openclaw-video-vision/stargazers"><img src="https://img.shields.io/github/stars/maim010/openclaw-video-vision?style=social" alt="GitHub Stars"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://clawhub.com"><img src="https://img.shields.io/badge/OpenClaw-Skill-orange" alt="OpenClaw Skill"></a>
  <a href="https://maim010.github.io/openclaw-video-vision/"><img src="https://img.shields.io/badge/Docs-VitePress-646CFF" alt="Documentation"></a>
</p>

<p align="center">
  <a href="https://maim010.github.io/openclaw-video-vision/">Documentation</a> · <a href="https://maim010.github.io/openclaw-video-vision/zh/">中文文档</a> · <a href="./README_CN.md">中文 README</a>
</p>

---

## Why?

You find a 40-minute tech talk, a 2-hour lecture playlist, or a Bilibili tutorial in a language you don't speak. You don't have time to watch all of them, but you need to know what's in there.

**openclaw-video-vision** solves this: paste a URL, get a summary — with key moments pinpointed by timestamp, so you can jump straight to the parts that matter.

It works as an **OpenClaw skill**, meaning you just tell your AI agent in natural language: *"Summarize this video for me"* — and it handles the rest.

---

## Example

```
> Summarize this video: https://youtube.com/watch?v=...
```

```
Video Summary: Introduction to Transformer Architecture
Platform: YouTube | Duration: 18:42
Frames analyzed: 20 (every ~56s)

SUMMARY:
This video provides a detailed walkthrough of the Transformer
neural network architecture, covering self-attention mechanisms,
positional encoding, and encoder-decoder structures.

KEY MOMENTS:
- 0:00  Title slide — "Attention Is All You Need" paper reference
- 4:30  Diagram of multi-head attention mechanism
- 9:20  Python code for scaled dot-product attention
- 14:10 Comparison: RNN vs Transformer training speed

TOPICS: deep learning, transformers, attention mechanism, NLP
```

---

## Quick Start

### 1. Install

```bash
git clone https://github.com/maim010/openclaw-video-vision.git ~/.openclaw/workspace/skills/video-vision
cd ~/.openclaw/workspace/skills/video-vision
npm install
```

Dependencies: **Node.js >= 18**, **FFmpeg** (`brew install ffmpeg` / `apt install ffmpeg`), and a vision API key.

Recommended: **yt-dlp** (`brew install yt-dlp` / `pip install yt-dlp`) for best results.

### 2. Enable the skill

Add to `~/.openclaw/openclaw.json`:

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

### 3. Use it

Talk to your OpenClaw agent:

```
> Summarize this YouTube video: https://youtube.com/watch?v=dQw4w9WgXcQ
> What is this Bilibili video about? https://bilibili.com/video/BV1xx411c7mD
```

Or run directly:

```bash
export VIDEO_VISION_API_KEY="sk-..."
node src/index.js https://youtube.com/watch?v=dQw4w9WgXcQ
```

---

## How It Works

```
URL + Cookies + Proxy (optional)
        │
        ▼
┌─────────────────────────┐     ┌──────────────────────────┐
│ Phase 1: yt-dlp         │────▶│ Phase 2: Browser         │
│ Extract URL + metadata  │fail │ Playwright (local/cloud) │
│ FFmpeg extract frames   │     │ Scrape → FFmpeg or       │
└────────────┬────────────┘     │ screenshot fallback      │
             │                  └─────────────┬────────────┘
             └──────────┬─────────────────────┘
                        ▼
              ┌───────────────────┐
              │ Vision AI Model   │
              │ (GPT-4o, Claude,  │
              │  Gemini, etc.)    │
              └────────┬──────────┘
                       ▼
              Structured Summary
              + Key Moments
              + Timestamps + Topics
```

**Two extraction paths**, automatic fallback:
- **yt-dlp + FFmpeg** (preferred) — fast, no browser needed
- **Playwright browser** — for sites yt-dlp can't handle, with cloud browser support (Browserless / Browserbase / Steel)

---

## Features

| | |
|---|---|
| **Platforms** | YouTube, Bilibili, and any page with `<video>` elements |
| **Vision AI** | Any OpenAI-compatible endpoint — GPT-4o, Claude, Gemini, local models |
| **Proxy** | HTTP / HTTPS / SOCKS5, per-request or global |
| **Cookies** | Netscape & JSON formats for login-restricted / age-gated content |
| **Cloud Browsers** | Browserless, Browserbase, Steel — no local Chromium needed |
| **Configurable** | Frame interval, max frames, extraction mode (`auto`/`ytdlp`/`browser`) |
| **Portable** | Works on macOS, Linux, Windows, Android/Termux (yt-dlp mode), CI/serverless |

---

## Configuration

All settings via environment variables or `~/.openclaw/openclaw.json`:

| Variable | Default | Description |
|----------|---------|-------------|
| `VIDEO_VISION_API_KEY` | *required* | Vision model API key |
| `VIDEO_VISION_API_URL` | OpenAI endpoint | Any OpenAI-compatible vision endpoint |
| `VIDEO_VISION_MODEL` | `gpt-4o` | Vision model to use |
| `VIDEO_VISION_MODE` | `auto` | `auto` / `ytdlp` / `browser` |
| `VIDEO_VISION_PROXY` | — | Default proxy URL |
| `VIDEO_VISION_FRAME_INTERVAL` | `5` | Seconds between frames |
| `VIDEO_VISION_MAX_FRAMES` | `20` | Max frames per video |
| `VIDEO_VISION_BROWSER` | `local` | `local` / `browserless` / `browserbase` / `steel` |

Full configuration reference: [Documentation](https://maim010.github.io/openclaw-video-vision/configuration)

---

## Contributing

Contributions welcome! Areas we'd love help with:

- **New platforms** — TikTok, Twitter/X, Vimeo, Dailymotion
- **Smarter extraction** — scene-change detection, audio transcription
- **Model adapters** — local models (LLaVA, CogVLM), more providers
- **Output formats** — JSON export, SRT subtitles, markdown reports

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

MIT © [maim010](https://github.com/maim010)

## Sponsorship

This project is sponsored by [zmto](https://zmto.com). Thank you for supporting open source!
