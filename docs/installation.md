# Installation

## Prerequisites

| Dependency | Required? | Install |
|------------|-----------|---------|
| Node.js >= 18 | Yes | [nodejs.org](https://nodejs.org) |
| FFmpeg | Yes | `brew install ffmpeg` / `apt install ffmpeg` |
| Vision API Key | Yes | [OpenAI](https://platform.openai.com) / [Anthropic](https://console.anthropic.com) / etc. |
| yt-dlp | Recommended | `brew install yt-dlp` / `pip install yt-dlp` |
| playwright-core | Optional | `npm install playwright-core` |
| Chromium | Optional (browser path only) | `npx playwright-core install chromium` |

> **Note:** `playwright-core` is an optional dependency. If it cannot be installed (e.g. on Android/PRoot), the yt-dlp + FFmpeg path works without it. Set `VIDEO_VISION_MODE=ytdlp` to avoid browser fallback entirely.

## Setup

```bash
# Clone
git clone https://github.com/maim010/openclaw-video-vision.git ~/.openclaw/workspace/skills/video-vision
cd ~/.openclaw/workspace/skills/video-vision

# Install Node dependencies
npm install

# (Optional) Install Chromium for browser path
npx playwright-core install chromium
```

## First Run

```bash
# Set your vision API key
export VIDEO_VISION_API_KEY="sk-..."

# Summarize a video
node src/index.js https://youtube.com/watch?v=dQw4w9WgXcQ
```

## Platform-Specific Notes

### Android / PRoot / Termux

playwright-core and Chromium cannot be installed. Use the yt-dlp + FFmpeg path:

```bash
apt install ffmpeg
pip install yt-dlp

export VIDEO_VISION_MODE=ytdlp
```

### Serverless / CI

No local Chromium available. Either:
- Use `VIDEO_VISION_MODE=ytdlp` (if yt-dlp + FFmpeg are available), or
- Use a cloud browser: set `VIDEO_VISION_BROWSER=browserless|browserbase|steel` (see [Cloud Browsers](./cloud-browsers.md))

### macOS / Linux / Windows (Desktop)

All paths work. Default `VIDEO_VISION_MODE=auto` is recommended.

```bash
brew install ffmpeg yt-dlp   # macOS
# or
apt install ffmpeg && pip install yt-dlp   # Linux
```
