# Configuration

All settings are controlled via environment variables or `~/.openclaw/openclaw.json`.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VIDEO_VISION_API_KEY` | *required* | Vision model API key |
| `VIDEO_VISION_API_URL` | `https://api.openai.com/v1/chat/completions` | Any OpenAI-compatible vision endpoint |
| `VIDEO_VISION_MODEL` | `gpt-4o` | Vision model to use |
| `VIDEO_VISION_MODE` | `auto` | Extraction mode: `auto` / `ytdlp` / `browser` (see [Extraction Modes](./extraction-modes.md)) |
| `VIDEO_VISION_PROXY` | — | Default proxy URL (HTTP/HTTPS/SOCKS5) |
| `VIDEO_VISION_FRAME_INTERVAL` | `5` | Seconds between extracted frames |
| `VIDEO_VISION_MAX_FRAMES` | `20` | Maximum frames per video |
| `VIDEO_VISION_COOKIES_DIR` | — | Directory containing cookie files (see [Cookies](./cookies.md)) |
| `VIDEO_VISION_LOW_RESOURCE` | `false` | Skip resource checks, disable transcription |
| `VIDEO_VISION_TRANSCRIPTION` | `auto` | Transcription mode: `auto` / `on` / `off` (auto = on unless low-resource) |
| `VIDEO_VISION_WHISPER_PATH` | `whisper-cli` | Path to whisper-cli binary |
| `VIDEO_VISION_WHISPER_MODEL_PATH` | (auto-detect) | Full path to ggml model file |
| `VIDEO_VISION_WHISPER_MODEL` | `medium` | Model name: tiny/base/small/medium/large-v3 |
| `VIDEO_VISION_WHISPER_THREADS` | `0` (auto) | CPU threads for whisper (0 = cores/2) |
| `VIDEO_VISION_WHISPER_LANGUAGE` | `auto` | Audio language hint |
| `VIDEO_VISION_BROWSER` | `local` | Browser backend: `local` / `browserless` / `browserbase` / `steel` |
| `VIDEO_VISION_BROWSERLESS_TOKEN` | — | Browserless API token |
| `VIDEO_VISION_BROWSERBASE_API_KEY` | — | Browserbase API key |
| `VIDEO_VISION_BROWSERBASE_PROJECT_ID` | — | Browserbase project ID |
| `VIDEO_VISION_STEEL_API_KEY` | — | Steel API key |

## OpenClaw JSON Config

```json
{
  "skills": {
    "entries": [
      {
        "name": "video-vision",
        "env": {
          "VIDEO_VISION_API_KEY": "sk-...",
          "VIDEO_VISION_MODEL": "gpt-4o",
          "VIDEO_VISION_MODE": "ytdlp",
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

## Proxy

Supports HTTP, HTTPS, and SOCKS5 proxies. The proxy is used for:
- yt-dlp video metadata & download
- Browser network traffic (Phase 2)

```bash
export VIDEO_VISION_PROXY="http://127.0.0.1:7890"
# or
export VIDEO_VISION_PROXY="socks5://127.0.0.1:1080"
```

Per-request proxy via CLI flag:

```bash
node src/index.js https://youtube.com/watch?v=xxx --proxy=http://127.0.0.1:7890
```

## Vision API Endpoints

Any OpenAI-compatible `/v1/chat/completions` endpoint works:

```bash
# OpenAI (default)
export VIDEO_VISION_API_URL="https://api.openai.com/v1/chat/completions"
export VIDEO_VISION_MODEL="gpt-4o"

# Anthropic (via compatible proxy)
export VIDEO_VISION_API_URL="https://your-proxy/v1/chat/completions"
export VIDEO_VISION_MODEL="claude-sonnet-4-20250514"

# Local model
export VIDEO_VISION_API_URL="http://localhost:11434/v1/chat/completions"
export VIDEO_VISION_MODEL="llava"
```
