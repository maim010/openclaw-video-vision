# Architecture

## File Structure

```
src/
└── index.js    # Single-file core module (~850 lines)
```

All logic lives in `src/index.js`. No external runtime dependencies besides the optional `playwright-core`.

## Data Flow

```
run({ url, proxy, cookieFile })
│
├── checkResources()              → verify CPU/RAM (skip if lowResource)
├── checkWhisper()                → verify whisper-cli available
├── detectPlatform(url)           → 'youtube' | 'bilibili' | 'generic'
│
├── [Phase 1] mode !== 'browser'
│   ├── getVideoWithYtDlp()      → { title, duration, videoUrl, httpHeaders }
│   ├── extractFrames(url)       → try FFmpeg with direct URL
│   ├── downloadWithYtDlp()      → fallback: download to local file
│   ├── extractFrames(file)      → FFmpeg from local file
│   ├── extractAudio()           → 16kHz mono WAV
│   └── transcribeAudio()        → { text, language, segments }
│
├── [Phase 2] mode !== 'ytdlp'
│   ├── launchBrowser()          → local Chromium or cloud provider
│   ├── scrapeYouTube/Bilibili/Generic(page)
│   ├── extractFrames()          → if direct video URL found
│   ├── captureScreenshots()     → fallback: seek + screenshot
│   ├── extractAudio()           → if video source available
│   └── transcribeAudio()        → if audio extracted
│
├── analyzeFramesWithVision()    → send frames + transcript to vision AI
└── formatResult()               → structured text output
```

## Key Functions

| Function | Purpose |
|----------|---------|
| `run()` | Main entry point, orchestrates the full pipeline |
| `detectPlatform()` | URL pattern matching for platform detection |
| `getVideoWithYtDlp()` | Runs `yt-dlp -j` to get metadata + direct video URL |
| `downloadWithYtDlp()` | Runs `yt-dlp` to download video to a local file |
| `launchBrowser()` | Lazy-loads playwright-core, connects to local/cloud browser |
| `scrapeYouTube()` | YouTube-specific DOM scraping |
| `scrapeBilibili()` | Bilibili-specific DOM scraping |
| `scrapeGeneric()` | Generic `<video>` element scraping |
| `extractFrames()` | FFmpeg frame extraction at configured intervals |
| `captureScreenshots()` | Browser-based screenshot fallback (seek + capture) |
| `extractAudio()` | FFmpeg audio extraction to 16kHz mono WAV |
| `transcribeAudio()` | Run whisper-cli and parse JSON output |
| `formatTranscription()` | Format transcript segments for vision prompt |
| `checkResources()` | Verify CPU/RAM meet requirements (skip if lowResource) |
| `checkWhisper()` | Check if whisper-cli binary is available |
| `resolveWhisperModel()` | Find ggml model file in standard paths |
| `analyzeFramesWithVision()` | Sends base64 frames + transcript to vision API |
| `loadCookies()` | Parses JSON or Netscape cookie files |

## Phase 1 Detail: yt-dlp + FFmpeg

```
getVideoWithYtDlp(url)
    │
    │ yt-dlp -j --no-download -f 'best[height<=480]...'
    │
    ▼
{ videoUrl, httpHeaders, title, duration }
    │
    ├── [Step 1a] extractFrames(videoUrl, headers)
    │       FFmpeg direct URL → may fail with 403 (IP-bound URLs)
    │
    ├── [Step 1b] downloadWithYtDlp(url, localPath)
    │       yt-dlp downloads full video → extractFrames(localPath)
    │
    ▼
frames[] → analyzeFramesWithVision() → formatted result
```

## Phase 2 Detail: Browser

```
launchBrowser()
    │
    │ require('playwright-core')  ← lazy loaded, throws if missing
    │
    ├── local:       chromium.launch()
    ├── browserless: chromium.connectOverCDP(wss://...)
    ├── browserbase: REST API → chromium.connectOverCDP(wss://...)
    └── steel:       chromium.connectOverCDP(wss://...)
         │
         ▼
    scrapeYouTube/Bilibili/Generic(page)
         │
         ├── videoUrl found → extractFrames()
         └── no videoUrl    → captureScreenshots() (click play, seek, screenshot)
         │
         ▼
    frames[] → analyzeFramesWithVision() → formatted result
```

## Exports

```javascript
module.exports = {
  run,                // Main entry point
  detectPlatform,     // URL → platform string
  loadCookies,        // Load cookie file
  getVideoWithYtDlp,  // yt-dlp metadata extraction
  downloadWithYtDlp,  // yt-dlp video download
  extractAudio,       // FFmpeg audio extraction
  transcribeAudio,    // whisper-cli transcription
  checkResources,     // System resource verification
};
```
