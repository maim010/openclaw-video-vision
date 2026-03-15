# 安装

## 前置条件

| 依赖 | 是否必需？ | 安装方式 |
|------|-----------|---------|
| Node.js >= 18 | 是 | [nodejs.org](https://nodejs.org) |
| FFmpeg | 是 | `brew install ffmpeg` / `apt install ffmpeg` |
| 视觉 API 密钥 | 是 | [OpenAI](https://platform.openai.com) / [Anthropic](https://console.anthropic.com) / 等 |
| yt-dlp | 推荐 | `brew install yt-dlp` / `pip install yt-dlp` |
| whisper.cpp | 可选（转录） | 参见下方 [Whisper.cpp 安装](#whisper-cpp-安装) |
| playwright-core | 可选 | `npm install playwright-core` |
| Chromium | 可选（仅浏览器路径） | `npx playwright-core install chromium` |

> **注意：** `playwright-core` 是可选依赖。如果无法安装（例如在 Android/PRoot 上），yt-dlp + FFmpeg 路径可以独立工作。设置 `VIDEO_VISION_MODE=ytdlp` 可以完全避免浏览器回退。

> **音频转录：** whisper.cpp 提供本地音频转录。启用后，视觉 AI 将同时接收视频帧和转录文本，生成更丰富的摘要。设置 `VIDEO_VISION_LOW_RESOURCE=true` 可禁用。

## 安装步骤

```bash
# 方式 A：npm（通过 GitHub Packages）
npm install @maim010/openclaw-video-vision@latest \
  --registry=https://npm.pkg.github.com \
  --//npm.pkg.github.com/:_authToken=你的GitHub_Token

# 方式 B：克隆仓库
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

## Whisper.cpp 安装

在 12+ CPU 核心和 14+ GB RAM 的机器上，音频转录默认开启。安装步骤：

```bash
# 编译 whisper.cpp
git clone https://github.com/ggml-org/whisper.cpp.git /opt/whisper.cpp
cd /opt/whisper.cpp
cmake -B build
cmake --build build --config Release -j$(nproc)
sudo ln -s /opt/whisper.cpp/build/bin/whisper-cli /usr/local/bin/whisper-cli

# 下载 medium 模型（约 1.5GB）
mkdir -p ~/.cache/whisper
wget -q https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin \
  -O ~/.cache/whisper/ggml-medium.bin
```

低配机器可跳过转录：

```bash
export VIDEO_VISION_LOW_RESOURCE=true
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
