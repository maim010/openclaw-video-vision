# 提取模式

`VIDEO_VISION_MODE` 控制工具使用哪种提取路径。

## 三种模式

| 模式 | 值 | 阶段 1（yt-dlp） | 阶段 2（浏览器） | 适用场景 |
|------|------|:-----------------:|:----------------:|----------|
| 自动 | `auto` | 是，优先尝试 | 是，回退使用 | 桌面 / 完整环境 |
| 仅 yt-dlp | `ytdlp` | 是 | 否 | Android、PRoot、无 Chromium |
| 仅浏览器 | `browser` | 否 | 是 | yt-dlp 不支持的网站 |

## `auto`（默认）

```bash
export VIDEO_VISION_MODE=auto
```

1. 尝试使用 yt-dlp 获取视频元数据和直链
2. 尝试使用 FFmpeg 通过直链提取帧
3. 如果 FFmpeg 失败（例如 403），通过 yt-dlp 下载视频到本地文件，然后提取帧
4. 如果以上全部失败，回退到浏览器（阶段 2）

当你的环境同时支持两种路径时，推荐使用此模式。

## `ytdlp`

```bash
export VIDEO_VISION_MODE=ytdlp
```

仅使用 yt-dlp + FFmpeg。不会使用 playwright-core 或任何浏览器。如果帧提取失败，工具会返回错误而不是回退到浏览器路径。

**适用场景：**
- 无法安装 playwright-core（Android、PRoot、Termux）
- 想要避免浏览器的开销
- 仅处理 YouTube / Bilibili / yt-dlp 支持的网站
- 资源受限的环境

**需要：** `yt-dlp`、`ffmpeg`

## `browser`

```bash
export VIDEO_VISION_MODE=browser
```

完全跳过 yt-dlp。直接使用基于浏览器的抓取和截图提取。

**适用场景：**
- 目标网站不被 yt-dlp 支持
- 需要浏览器渲染的内容（JavaScript 密集型页面）
- 偏好使用云浏览器服务

**需要：** `playwright-core` + Chromium（本地）或云浏览器服务

## 决策流程图

```
能否安装 playwright-core + Chromium？
├── 否
│   └── 使用 VIDEO_VISION_MODE=ytdlp
│       需要：yt-dlp + FFmpeg
│
└── 是
    ├── 目标网站被 yt-dlp 支持？（YouTube、Bilibili 等）
    │   ├── 是  → VIDEO_VISION_MODE=auto（默认）
    │   └── 否  → VIDEO_VISION_MODE=browser
    │
    └── 想要避免浏览器开销？
        └── 是  → VIDEO_VISION_MODE=ytdlp
```
