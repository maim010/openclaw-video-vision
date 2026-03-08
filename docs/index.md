---
layout: home
hero:
  name: openclaw-video-vision
  text: AI-powered video understanding
  tagline: Crawl any video platform, extract key frames, get structured summaries powered by vision AI.
  actions:
    - theme: brand
      text: Get Started
      link: /installation
    - theme: alt
      text: View on GitHub
      link: https://github.com/maim010/openclaw-video-vision
---

## Overview

openclaw-video-vision is an [OpenClaw](https://clawhub.com) skill that:

1. Accepts a video URL (YouTube, Bilibili, or any web page with `<video>`)
2. Extracts key frames via **yt-dlp + FFmpeg** or **browser screenshots**
3. Sends frames to a vision AI model for structured summarization

## Quick Navigation

| Page | Description |
|------|-------------|
| [Installation](./installation.md) | Prerequisites, setup, and first run |
| [Configuration](./configuration.md) | All environment variables |
| [Extraction Modes](./extraction-modes.md) | `auto` / `ytdlp` / `browser` — how to choose |
| [Cloud Browsers](./cloud-browsers.md) | Browserless, Browserbase, Steel setup |
| [Cookies](./cookies.md) | Authenticated & age-restricted content |
| [Troubleshooting](./troubleshooting.md) | Common errors and fixes |
| [Architecture](./architecture.md) | Code structure and data flow |

## Supported Platforms

| Platform | yt-dlp path | Browser path |
|----------|:-----------:|:------------:|
| YouTube | Yes | Yes |
| Bilibili | Yes | Yes |
| Generic `<video>` pages | Partial | Yes |

## Two Extraction Paths

```
Video URL
    |
    v
[Phase 1] yt-dlp + FFmpeg ---- success ----> Vision AI -> Summary
    |
    | fail
    v
[Phase 2] Browser (Playwright) ---- success ----> Vision AI -> Summary
```

Phase 1 requires **yt-dlp** and **FFmpeg** only — no browser, no Chromium.
Phase 2 requires **playwright-core** (optional dependency) + Chromium or a cloud browser.

You can lock the extraction path via `VIDEO_VISION_MODE`. See [Extraction Modes](./extraction-modes.md).
