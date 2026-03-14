# 配置

所有设置通过环境变量或 `~/.openclaw/openclaw.json` 控制。

## 环境变量

| 变量 | 默认值 | 描述 |
|------|--------|------|
| `VIDEO_VISION_API_KEY` | *必填* | 视觉模型 API 密钥 |
| `VIDEO_VISION_API_URL` | `https://api.openai.com/v1/chat/completions` | 任何 OpenAI 兼容的视觉端点 |
| `VIDEO_VISION_MODEL` | `gpt-4o` | 使用的视觉模型 |
| `VIDEO_VISION_MODE` | `auto` | 提取模式：`auto` / `ytdlp` / `browser`（参见[提取模式](./extraction-modes.md)） |
| `VIDEO_VISION_PROXY` | — | 默认代理 URL（HTTP/HTTPS/SOCKS5） |
| `VIDEO_VISION_FRAME_INTERVAL` | `5` | 提取帧之间的间隔秒数 |
| `VIDEO_VISION_MAX_FRAMES` | `20` | 每个视频的最大帧数 |
| `VIDEO_VISION_COOKIES_DIR` | — | Cookie 文件目录（参见 [Cookie](./cookies.md)） |
| `VIDEO_VISION_LOW_RESOURCE` | `false` | 跳过资源检查，禁用转录 |
| `VIDEO_VISION_TRANSCRIPTION` | `auto` | 转录模式：`auto` / `on` / `off`（auto = 非低资源时开启） |
| `VIDEO_VISION_WHISPER_PATH` | `whisper-cli` | whisper-cli 二进制文件路径 |
| `VIDEO_VISION_WHISPER_MODEL_PATH` | （自动检测） | ggml 模型文件的完整路径 |
| `VIDEO_VISION_WHISPER_MODEL` | `medium` | 模型名称：tiny/base/small/medium/large-v3 |
| `VIDEO_VISION_WHISPER_THREADS` | `0`（自动） | whisper 使用的 CPU 线程数（0 = 核数/2） |
| `VIDEO_VISION_WHISPER_LANGUAGE` | `auto` | 音频语言提示 |
| `VIDEO_VISION_BROWSER` | `local` | 浏览器后端：`local` / `browserless` / `browserbase` / `steel` |
| `VIDEO_VISION_BROWSERLESS_TOKEN` | — | Browserless API 令牌 |
| `VIDEO_VISION_BROWSERBASE_API_KEY` | — | Browserbase API 密钥 |
| `VIDEO_VISION_BROWSERBASE_PROJECT_ID` | — | Browserbase 项目 ID |
| `VIDEO_VISION_STEEL_API_KEY` | — | Steel API 密钥 |

## OpenClaw JSON 配置

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

## 代理

支持 HTTP、HTTPS 和 SOCKS5 代理。代理用于：
- yt-dlp 视频元数据获取和下载
- 浏览器网络流量（阶段 2）

```bash
export VIDEO_VISION_PROXY="http://127.0.0.1:7890"
# 或
export VIDEO_VISION_PROXY="socks5://127.0.0.1:1080"
```

通过 CLI 参数设置单次请求的代理：

```bash
node src/index.js https://youtube.com/watch?v=xxx --proxy=http://127.0.0.1:7890
```

## 视觉 API 端点

任何 OpenAI 兼容的 `/v1/chat/completions` 端点均可使用：

```bash
# OpenAI（默认）
export VIDEO_VISION_API_URL="https://api.openai.com/v1/chat/completions"
export VIDEO_VISION_MODEL="gpt-4o"

# Anthropic（通过兼容代理）
export VIDEO_VISION_API_URL="https://your-proxy/v1/chat/completions"
export VIDEO_VISION_MODEL="claude-sonnet-4-20250514"

# 本地模型
export VIDEO_VISION_API_URL="http://localhost:11434/v1/chat/completions"
export VIDEO_VISION_MODEL="llava"
```
