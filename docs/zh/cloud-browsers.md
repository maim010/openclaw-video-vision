# 云浏览器

当你无法或不想在本地安装 Chromium 时，可以连接到云浏览器服务。这适用于无服务器、CI 或无头环境。

> **注意：** 云浏览器仍然需要安装 `playwright-core`（它提供 CDP 客户端）。如果 `playwright-core` 也无法安装，请使用 `VIDEO_VISION_MODE=ytdlp`。

## 支持的服务商

| 服务商 | 环境变量 | 免费额度 |
|--------|----------|----------|
| [Browserless](https://www.browserless.io/) | `VIDEO_VISION_BROWSERLESS_TOKEN` | 每月 1,000 单位 |
| [Browserbase](https://www.browserbase.com/) | `VIDEO_VISION_BROWSERBASE_API_KEY` + `VIDEO_VISION_BROWSERBASE_PROJECT_ID` | 每月 100 个会话 |
| [Steel](https://steel.dev/) | `VIDEO_VISION_STEEL_API_KEY` | 每月 100 个会话 |

## 配置

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

## 工作原理

云浏览器通过 Chrome DevTools Protocol（CDP）经 WebSocket 连接：

```
openclaw-video-vision
    |
    | playwright-core (CDP 客户端)
    |
    v
wss://provider.com?token=xxx
    |
    v
[远程 Chromium 实例]
    |
    v
抓取视频页面，捕获截图
```

使用云浏览器时，**不需要**运行 `npx playwright-core install chromium`。

## 与 yt-dlp 结合使用

在 `auto` 模式（默认）下，会优先尝试 yt-dlp。云浏览器仅在 yt-dlp + FFmpeg 失败时使用。这可以最大限度减少云浏览器的使用量和成本。

```bash
export VIDEO_VISION_MODE=auto           # 优先尝试 yt-dlp
export VIDEO_VISION_BROWSER=steel       # 回退到 Steel
export VIDEO_VISION_STEEL_API_KEY="..."
```
