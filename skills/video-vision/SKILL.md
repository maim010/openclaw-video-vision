---
name: video-vision
description: Crawl YouTube, Bilibili and other video platforms using Playwright, extract key frames, and summarize visual content using vision AI models. Supports proxy IPs and account cookies for authenticated access.
homepage: https://github.com/maim010/openclaw-video-vision
metadata: {"openclaw":{"emoji":"🎬","requires":{"bins":["node","ffmpeg"],"env":["VIDEO_VISION_API_KEY"],"config":[]},"install":[{"type":"node","pkg":"playwright-core"},{"type":"download","url":"https://github.com/maim010/openclaw-video-vision/releases/latest/download/video-vision-skill.tar.gz","archive":"tar.gz"}]}}
---

# video-vision — Video Frame Extraction & AI Summarization Skill

This skill enables OpenClaw to browse video platforms (YouTube, Bilibili, and others) using Playwright,
extract key frames from videos, and use vision AI models to generate summaries of video content.

## When to Use This Skill

Use this skill when the user asks to:
- Summarize a YouTube or Bilibili video without watching it
- Extract visual highlights or key moments from a video
- Understand what a video contains based on its visual content
- Analyze a series of videos on a topic
- Process authenticated/private video content using cookies

## Capabilities

### Supported Platforms
- **YouTube** (youtube.com, youtu.be)
- **Bilibili** (bilibili.com, b23.tv)
- **Generic video pages** (any page with an embeddable or downloadable video)

### Core Features
1. **Browser-based crawling** via Playwright (Chromium headless, local or cloud)
2. **Frame extraction** using FFmpeg — configurable interval (e.g., 1 frame every 5s)
3. **Vision AI summarization** — sends frames to a configurable vision model endpoint (any OpenAI-compatible API)
4. **Proxy support** — HTTP/HTTPS/SOCKS5 proxies configurable per-request
5. **Cookie injection** — supports Netscape/JSON format cookie files for authenticated sessions
6. **yt-dlp integration** — preferred path for extracting video URLs without a browser (optional)
7. **Cloud browser support** — Browserless, Browserbase, Steel for environments without local Chromium

---

## How to Use

### Basic Video Summary

Tell OpenClaw:
> "Summarize this YouTube video: https://youtube.com/watch?v=XXXXX"

Or:
> "What is this Bilibili video about? https://www.bilibili.com/video/BVXXXXX"

OpenClaw will:
1. Open the video URL in a headless browser
2. Wait for the player to load and extract video metadata
3. Download/stream and extract frames at regular intervals
4. Send frames to the vision model
5. Return a structured summary with timestamps

### With Proxy

> "Summarize this video using proxy 127.0.0.1:7890"

Or configure a default proxy in your skill config (see Configuration below).

### With Cookies (Authenticated Content)

> "Summarize this private Bilibili video, use my cookies file at ~/bilibili_cookies.json"

Cookie files must be in **Netscape** format or **JSON** (array of `{name, value, domain, path}` objects).

### Batch Processing

> "Summarize all videos in this YouTube playlist: https://youtube.com/playlist?list=XXXXX"

---

## Configuration

Set these environment variables or configure via `~/.openclaw/openclaw.json`:

```json
{
  "skills": {
    "entries": [
      {
        "name": "video-vision",
        "env": {
          "VIDEO_VISION_API_KEY": "your-vision-model-api-key",
          "VIDEO_VISION_API_URL": "https://api.openai.com/v1/chat/completions",
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

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VIDEO_VISION_API_KEY` | *required* | Vision model API key |
| `VIDEO_VISION_API_URL` | OpenAI endpoint | Custom vision API endpoint |
| `VIDEO_VISION_MODEL` | `gpt-4o` | Vision model to use |
| `VIDEO_VISION_PROXY` | none | Default HTTP/SOCKS5 proxy |
| `VIDEO_VISION_FRAME_INTERVAL` | `5` | Seconds between extracted frames |
| `VIDEO_VISION_MAX_FRAMES` | `20` | Max frames per video |
| `VIDEO_VISION_COOKIES_DIR` | none | Directory with per-domain cookie files |

---

## Output Format

The skill returns a structured summary like:

```
🎬 Video Summary: [Title]
📺 Platform: YouTube | Duration: 12:34
👁️ Frames analyzed: 18

📝 Summary:
This video covers [main topic]...

⏱️ Key Moments:
- 0:30 — [description of what's visible]
- 2:15 — [description]
- 5:00 — [description]

🏷️ Topics detected: [tag1], [tag2], [tag3]
```

---

## Edge Cases

- **Age-restricted content**: Provide cookies with a logged-in session to bypass age gates.
- **Geo-blocked content**: Configure a proxy in the appropriate region.
- **Very long videos**: The skill automatically samples frames evenly across the duration, capped at `VIDEO_VISION_MAX_FRAMES`.
- **Live streams**: Only the currently buffered segment is analyzed; live streams are flagged in output.
- **Unavailable videos**: Returns a clear error message with the reason (private, deleted, region-blocked).

---

## Installation

```bash
git clone https://github.com/maim010/openclaw-video-vision.git ~/.openclaw/skills/video-vision
cd ~/.openclaw/skills/video-vision
npm install

# Install Playwright browsers (only needed for local browser mode)
npx playwright-core install chromium

# Recommended: install yt-dlp for best video URL extraction
# macOS: brew install yt-dlp
# pip:   pip install yt-dlp

# Make sure ffmpeg is installed
# macOS: brew install ffmpeg
# Ubuntu/Debian: sudo apt install ffmpeg
```

---

## Privacy & Security

- Videos are processed locally; frames are only sent to the configured vision API endpoint.
- Cookies are read from local files and never stored or transmitted beyond the target platform.
- Proxy credentials (if any) are kept in environment variables and not logged.
- No video data is cached to disk beyond the current session unless explicitly configured.
