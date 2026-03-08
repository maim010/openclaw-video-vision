# Cloud Browsers

When you can't or don't want to install Chromium locally, connect to a cloud browser provider. This is useful for serverless, CI, or headless environments.

> **Note:** Cloud browsers still require `playwright-core` to be installed (it provides the CDP client). If `playwright-core` also can't be installed, use `VIDEO_VISION_MODE=ytdlp` instead.

## Supported Providers

| Provider | Env Vars | Free Tier |
|----------|----------|-----------|
| [Browserless](https://www.browserless.io/) | `VIDEO_VISION_BROWSERLESS_TOKEN` | 1,000 units/month |
| [Browserbase](https://www.browserbase.com/) | `VIDEO_VISION_BROWSERBASE_API_KEY` + `VIDEO_VISION_BROWSERBASE_PROJECT_ID` | 100 sessions/month |
| [Steel](https://steel.dev/) | `VIDEO_VISION_STEEL_API_KEY` | 100 sessions/month |

## Setup

### Browserless

```bash
export VIDEO_VISION_BROWSER=browserless
export VIDEO_VISION_BROWSERLESS_TOKEN="your-token"
```

### Browserbase

```bash
export VIDEO_VISION_BROWSER=browserbase
export VIDEO_VISION_BROWSERBASE_API_KEY="your-api-key"
export VIDEO_VISION_BROWSERBASE_PROJECT_ID="your-project-id"
```

### Steel

```bash
export VIDEO_VISION_BROWSER=steel
export VIDEO_VISION_STEEL_API_KEY="your-api-key"
```

## How It Works

Cloud browsers connect via Chrome DevTools Protocol (CDP) over WebSocket:

```
openclaw-video-vision
    |
    | playwright-core (CDP client)
    |
    v
wss://provider.com?token=xxx
    |
    v
[Remote Chromium Instance]
    |
    v
Scrape video page, capture screenshots
```

You do **not** need to run `npx playwright-core install chromium` when using a cloud browser.

## Combining with yt-dlp

In `auto` mode (default), yt-dlp is tried first. The cloud browser is only used if yt-dlp + FFmpeg fail. This minimizes cloud browser usage and costs.

```bash
export VIDEO_VISION_MODE=auto           # try yt-dlp first
export VIDEO_VISION_BROWSER=steel       # fall back to Steel
export VIDEO_VISION_STEEL_API_KEY="..."
```
