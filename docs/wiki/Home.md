# openclaw-video-vision

AI-powered video understanding — crawl any video platform, extract key frames, get structured summaries powered by vision AI.

## Overview

openclaw-video-vision is an [OpenClaw](https://clawhub.com) skill that:

1. Accepts a video URL (YouTube, Bilibili, or any web page with `<video>`)
2. Extracts key frames via **yt-dlp + FFmpeg** or **browser screenshots**
3. Sends frames to a vision AI model for structured summarization

## Quick Navigation

| Page | Description |
|------|-------------|
| [[Installation]] | Prerequisites, setup, and first run |
| [[Configuration]] | All environment variables |
| [[Extraction-Modes]] | `auto` / `ytdlp` / `browser` — how to choose |
| [[Cloud-Browsers]] | Browserless, Browserbase, Steel setup |
| [[Cookies]] | Authenticated & age-restricted content |
| [[Troubleshooting]] | Common errors and fixes |
| [[Architecture]] | Code structure and data flow |

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

You can lock the extraction path via `VIDEO_VISION_MODE`. See [[Extraction-Modes]].
