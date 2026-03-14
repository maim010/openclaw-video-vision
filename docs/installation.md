# Installation

## Prerequisites

| Dependency | Required? | Install |
|------------|-----------|---------|
| Node.js >= 18 | Yes | [nodejs.org](https://nodejs.org) |
| FFmpeg | Yes | `brew install ffmpeg` / `apt install ffmpeg` |
| Vision API Key | Yes | [OpenAI](https://platform.openai.com) / [Anthropic](https://console.anthropic.com) / etc. |
| yt-dlp | Recommended | `brew install yt-dlp` / `pip install yt-dlp` |
| whisper.cpp | Optional (transcription) | See [Whisper.cpp Setup](#whispercp-setup) below |
| playwright-core | Optional | `npm install playwright-core` |
| Chromium | Optional (browser path only) | `npx playwright-core install chromium` |

> **Note:** `playwright-core` is an optional dependency. If it cannot be installed (e.g. on Android/PRoot), the yt-dlp + FFmpeg path works without it. Set `VIDEO_VISION_MODE=ytdlp` to avoid browser fallback entirely.

> **Transcription:** whisper.cpp provides local audio transcription. When available, the vision AI receives both video frames and transcribed text for richer summaries. Set `VIDEO_VISION_LOW_RESOURCE=true` to disable.

## Setup

```bash
# Option A: npm (recommended)
npm install @maim010/openclaw-video-vision@latest

# Option B: Clone
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

## Whisper.cpp Setup

Audio transcription is enabled by default on machines with 12+ CPU cores and 14+ GB RAM. To set it up:

```bash
# Build whisper.cpp
git clone https://github.com/ggml-org/whisper.cpp.git /opt/whisper.cpp
cd /opt/whisper.cpp
cmake -B build
cmake --build build --config Release -j$(nproc)
sudo ln -s /opt/whisper.cpp/build/bin/whisper-cli /usr/local/bin/whisper-cli

# Download medium model (~1.5GB)
mkdir -p ~/.cache/whisper
wget -q https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin \
  -O ~/.cache/whisper/ggml-medium.bin
```

To run without transcription (lower-spec machines):

```bash
export VIDEO_VISION_LOW_RESOURCE=true
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
