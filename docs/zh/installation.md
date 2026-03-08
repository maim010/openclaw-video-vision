# 安装

## 前置条件

| 依赖 | 是否必需？ | 安装方式 |
|------|-----------|---------|
| Node.js >= 18 | 是 | [nodejs.org](https://nodejs.org) |
| FFmpeg | 是 | `brew install ffmpeg` / `apt install ffmpeg` |
| 视觉 API 密钥 | 是 | [OpenAI](https://platform.openai.com) / [Anthropic](https://console.anthropic.com) / 等 |
| yt-dlp | 推荐 | `brew install yt-dlp` / `pip install yt-dlp` |
| playwright-core | 可选 | `npm install playwright-core` |
| Chromium | 可选（仅浏览器路径） | `npx playwright-core install chromium` |

> **注意：** `playwright-core` 是可选依赖。如果无法安装（例如在 Android/PRoot 上），yt-dlp + FFmpeg 路径可以独立工作。设置 `VIDEO_VISION_MODE=ytdlp` 可以完全避免浏览器回退。

## 安装步骤

```bash
# 克隆仓库
git clone https://github.com/maim010/openclaw-video-vision.git ~/.openclaw/workspace/skills/video-vision
cd ~/.openclaw/workspace/skills/video-vision

# 安装 Node 依赖
npm install

# （可选）安装 Chromium 用于浏览器路径
npx playwright-core install chromium
```

## 首次运行

```bash
# 设置视觉 API 密钥
export VIDEO_VISION_API_KEY="sk-..."

# 总结一个视频
node src/index.js https://youtube.com/watch?v=dQw4w9WgXcQ
```

## 特定平台说明

### Android / PRoot / Termux

无法安装 playwright-core 和 Chromium。使用 yt-dlp + FFmpeg 路径：

```bash
apt install ffmpeg
pip install yt-dlp

export VIDEO_VISION_MODE=ytdlp
```

### 无服务器 / CI 环境

没有本地 Chromium。可以选择：
- 使用 `VIDEO_VISION_MODE=ytdlp`（如果 yt-dlp + FFmpeg 可用），或
- 使用云浏览器：设置 `VIDEO_VISION_BROWSER=browserless|browserbase|steel`（参见[云浏览器](./cloud-browsers.md)）

### macOS / Linux / Windows（桌面）

所有路径均可用。推荐使用默认的 `VIDEO_VISION_MODE=auto`。

```bash
brew install ffmpeg yt-dlp   # macOS
# 或
apt install ffmpeg && pip install yt-dlp   # Linux
```
