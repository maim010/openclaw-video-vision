# 故障排查

## 常见错误

### `playwright-core is not installed`

```
Error: playwright-core is not installed. Install it with: npm install playwright-core
If you only need the yt-dlp + FFmpeg path, playwright-core is not required.
```

**原因：** 阶段 1（yt-dlp）失败或被跳过，阶段 2 需要 playwright-core 但未安装。

**解决方法：** 安装 playwright-core，或设置 `VIDEO_VISION_MODE=ytdlp` 以保持在 yt-dlp 路径上，失败时会获得更明确的错误信息。

---

### `yt-dlp + FFmpeg failed to extract frames`

```
Error: yt-dlp + FFmpeg failed to extract frames and VIDEO_VISION_MODE is set to "ytdlp" (no browser fallback).
```

**原因：** yt-dlp 无法获取视频信息，或 FFmpeg 无法提取帧，且浏览器回退已禁用。

**可能的解决方法：**
- 验证 yt-dlp 已安装且为最新版本：`yt-dlp --version`
- 验证 FFmpeg 已安装：`ffmpeg -version`
- 检查 URL 是否被支持：`yt-dlp --list-formats <url>`
- 尝试使用代理：`--proxy=http://...`
- 尝试使用 Cookie 访问受限内容：`--cookies=~/cookies.json`

---

### `FFmpeg failed (exit N)` / HTTP 403

**原因：** YouTube 视频 URL 与 IP 绑定。FFmpeg 可能使用了与 yt-dlp 不同的 IP 连接。

**解决方法：** 自 v1.1 起已自动处理 — 工具会通过 yt-dlp 下载视频到本地文件，然后再提取帧。如果仍然遇到此问题，请升级 yt-dlp：

```bash
pip install --upgrade yt-dlp
```

---

### `VIDEO_VISION_API_KEY is not set`

```
Error: VIDEO_VISION_API_KEY is not set.
```

**解决方法：**

```bash
export VIDEO_VISION_API_KEY="sk-..."
```

---

### `Incorrect API key provided`

**原因：** API 密钥与端点不匹配。例如，在默认 OpenAI 端点使用了非 OpenAI 的密钥。

**解决方法：** 为你的服务商设置正确的 `VIDEO_VISION_API_URL`：

```bash
export VIDEO_VISION_API_URL="https://your-provider/v1/chat/completions"
export VIDEO_VISION_API_KEY="your-key"
```

---

### yt-dlp 版本警告 / SABR 流媒体

```
WARNING: [youtube] Some web client https formats have been skipped as they are missing a url.
YouTube is forcing SABR streaming for this client.
```

**原因：** yt-dlp 版本过旧。YouTube 经常更改其内部实现。

**解决方法：**

```bash
pip install --upgrade yt-dlp
```

在 Android/PRoot 上，apt 版本可能落后。通过 pip 安装并确保 pip 二进制文件优先：

```bash
pip install yt-dlp
# 验证版本
yt-dlp --version
```

---

### 无 JavaScript 运行时（yt-dlp）

```
WARNING: No supported JavaScript runtime could be found.
```

**原因：** 较新版本的 yt-dlp 需要 JS 运行时（deno 或 Node.js）来处理 YouTube 提取。

**解决方法：** Node.js 通常已经安装。如果使用 deno：

```bash
curl -fsSL https://deno.land/install.sh | sh
```

---

## 调试技巧

### 独立测试 yt-dlp

```bash
# 检查 yt-dlp 是否能获取视频信息
yt-dlp -j --no-download "https://youtube.com/watch?v=xxx"

# 尝试下载
yt-dlp -f 'best[height<=480][ext=mp4]/best' -o /tmp/test.mp4 "https://youtube.com/watch?v=xxx"
```

### 独立测试 FFmpeg

```bash
ffmpeg -i /tmp/test.mp4 -vf 'fps=1/10' -vframes 5 -q:v 2 /tmp/frame_%04d.jpg -y
```

### 测试模块加载

```bash
node -e "require('./src/index.js')"
```

无输出 = 成功。任何报错意味着依赖问题。
