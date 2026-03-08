# Extraction Modes

`VIDEO_VISION_MODE` controls which extraction path the tool uses.

## Three Modes

| Mode | Value | Phase 1 (yt-dlp) | Phase 2 (Browser) | Best for |
|------|-------|:-----------------:|:------------------:|----------|
| Auto | `auto` | Yes, try first | Yes, fallback | Desktop / full environment |
| yt-dlp only | `ytdlp` | Yes | No | Android, PRoot, no Chromium |
| Browser only | `browser` | No | Yes | Sites unsupported by yt-dlp |

## `auto` (default)

```bash
export VIDEO_VISION_MODE=auto
```

1. Try yt-dlp to get video metadata + direct URL
2. Try FFmpeg with the direct URL
3. If FFmpeg fails (e.g. 403), download video via yt-dlp to local file, then extract frames
4. If all of the above fail, fall back to browser (Phase 2)

This is the recommended mode when your environment supports both paths.

## `ytdlp`

```bash
export VIDEO_VISION_MODE=ytdlp
```

Only uses yt-dlp + FFmpeg. Never touches playwright-core or any browser. If frame extraction fails, the tool returns an error instead of falling through to the browser path.

**Use this when:**
- playwright-core cannot be installed (Android, PRoot, Termux)
- You want to avoid browser overhead
- You only process YouTube / Bilibili / sites supported by yt-dlp
- You're in a resource-constrained environment

**Requires:** `yt-dlp`, `ffmpeg`

## `browser`

```bash
export VIDEO_VISION_MODE=browser
```

Skips yt-dlp entirely. Goes straight to browser-based scraping + screenshot extraction.

**Use this when:**
- The target site is not supported by yt-dlp
- You need browser-rendered content (JavaScript-heavy pages)
- You prefer cloud browser providers

**Requires:** `playwright-core` + Chromium (local) or a cloud browser provider

## Decision Flowchart

```
Can you install playwright-core + Chromium?
├── No
│   └── Use VIDEO_VISION_MODE=ytdlp
│       Requires: yt-dlp + FFmpeg
│
└── Yes
    ├── Target sites supported by yt-dlp? (YouTube, Bilibili, etc.)
    │   ├── Yes  → VIDEO_VISION_MODE=auto (default)
    │   └── No   → VIDEO_VISION_MODE=browser
    │
    └── Want to avoid browser overhead?
        └── Yes  → VIDEO_VISION_MODE=ytdlp
```
