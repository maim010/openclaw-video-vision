# 架构

## 文件结构

```
src/
└── index.js    # 单文件核心模块（约 660 行）
```

所有逻辑都在 `src/index.js` 中。除了可选的 `playwright-core` 外，没有其他外部运行时依赖。

## 数据流

```
run({ url, proxy, cookieFile })
│
├── detectPlatform(url)          → 'youtube' | 'bilibili' | 'generic'
│
├── [阶段 1] mode !== 'browser'
│   ├── getVideoWithYtDlp()      → { title, duration, videoUrl, httpHeaders }
│   ├── extractFrames(url)       → 尝试 FFmpeg 使用直链
│   ├── downloadWithYtDlp()      → 回退：下载到本地文件
│   └── extractFrames(file)      → FFmpeg 从本地文件提取
│
├── [阶段 2] mode !== 'ytdlp'
│   ├── launchBrowser()          → 本地 Chromium 或云服务商
│   ├── scrapeYouTube/Bilibili/Generic(page)
│   ├── extractFrames()          → 如果找到直链视频 URL
│   └── captureScreenshots()     → 回退：定位 + 截图
│
├── analyzeFramesWithVision()    → 将帧发送给视觉 AI
└── formatResult()               → 结构化文本输出
```

## 核心函数

| 函数 | 用途 |
|------|------|
| `run()` | 主入口，编排完整的处理流程 |
| `detectPlatform()` | URL 模式匹配，检测平台 |
| `getVideoWithYtDlp()` | 运行 `yt-dlp -j` 获取元数据和直链视频 URL |
| `downloadWithYtDlp()` | 运行 `yt-dlp` 下载视频到本地文件 |
| `launchBrowser()` | 延迟加载 playwright-core，连接本地/云浏览器 |
| `scrapeYouTube()` | YouTube 专用 DOM 抓取 |
| `scrapeBilibili()` | Bilibili 专用 DOM 抓取 |
| `scrapeGeneric()` | 通用 `<video>` 元素抓取 |
| `extractFrames()` | FFmpeg 按配置间隔提取帧 |
| `captureScreenshots()` | 基于浏览器的截图回退（定位 + 截图） |
| `analyzeFramesWithVision()` | 将 base64 帧发送到视觉 API |
| `loadCookies()` | 解析 JSON 或 Netscape Cookie 文件 |

## 阶段 1 详解：yt-dlp + FFmpeg

```
getVideoWithYtDlp(url)
    │
    │ yt-dlp -j --no-download -f 'best[height<=480]...'
    │
    ▼
{ videoUrl, httpHeaders, title, duration }
    │
    ├── [步骤 1a] extractFrames(videoUrl, headers)
    │       FFmpeg 直链 → 可能因 403 失败（IP 绑定 URL）
    │
    ├── [步骤 1b] downloadWithYtDlp(url, localPath)
    │       yt-dlp 下载完整视频 → extractFrames(localPath)
    │
    ▼
frames[] → analyzeFramesWithVision() → 格式化结果
```

## 阶段 2 详解：浏览器

```
launchBrowser()
    │
    │ require('playwright-core')  ← 延迟加载，缺失时抛出异常
    │
    ├── local:       chromium.launch()
    ├── browserless: chromium.connectOverCDP(wss://...)
    ├── browserbase: REST API → chromium.connectOverCDP(wss://...)
    └── steel:       chromium.connectOverCDP(wss://...)
         │
         ▼
    scrapeYouTube/Bilibili/Generic(page)
         │
         ├── 找到 videoUrl → extractFrames()
         └── 未找到 videoUrl → captureScreenshots()（点击播放、定位、截图）
         │
         ▼
    frames[] → analyzeFramesWithVision() → 格式化结果
```

## 导出

```javascript
module.exports = {
  run,                // 主入口
  detectPlatform,     // URL → 平台字符串
  loadCookies,        // 加载 Cookie 文件
  getVideoWithYtDlp,  // yt-dlp 元数据提取
  downloadWithYtDlp,  // yt-dlp 视频下载
};
```
