# Troubleshooting

## Common Errors

### `playwright-core is not installed`

```
Error: playwright-core is not installed. Install it with: npm install playwright-core
If you only need the yt-dlp + FFmpeg path, playwright-core is not required.
```

**Cause:** Phase 1 (yt-dlp) failed or was skipped, Phase 2 needs playwright-core but it's not installed.

**Fix:** Either install playwright-core, or set `VIDEO_VISION_MODE=ytdlp` to stay on the yt-dlp path and get a clearer error if it fails.

---

### `yt-dlp + FFmpeg failed to extract frames`

```
Error: yt-dlp + FFmpeg failed to extract frames and VIDEO_VISION_MODE is set to "ytdlp" (no browser fallback).
```

**Cause:** yt-dlp could not get video info, or FFmpeg could not extract frames, and browser fallback is disabled.

**Possible fixes:**
- Verify yt-dlp is installed and up to date: `yt-dlp --version`
- Verify FFmpeg is installed: `ffmpeg -version`
- Check if the URL is supported: `yt-dlp --list-formats <url>`
- Try with a proxy: `--proxy=http://...`
- Try with cookies for restricted content: `--cookies=~/cookies.json`

---

### `FFmpeg failed (exit N)` / HTTP 403

**Cause:** YouTube video URLs are IP-bound. FFmpeg may connect from a different IP than yt-dlp used.

**Fix:** This is handled automatically since v1.1 — the tool downloads the video via yt-dlp to a local file and then extracts frames. If you still see this, upgrade yt-dlp:

```bash
pip install --upgrade yt-dlp
```

---

### `VIDEO_VISION_API_KEY is not set`

```
Error: VIDEO_VISION_API_KEY is not set.
```

**Fix:**

```bash
export VIDEO_VISION_API_KEY="sk-..."
```

---

### `Incorrect API key provided`

**Cause:** The API key doesn't match the endpoint. For example, using a non-OpenAI key with the default OpenAI endpoint.

**Fix:** Set the correct `VIDEO_VISION_API_URL` for your provider:

```bash
export VIDEO_VISION_API_URL="https://your-provider/v1/chat/completions"
export VIDEO_VISION_API_KEY="your-key"
```

---

### yt-dlp version warning / SABR streaming

```
WARNING: [youtube] Some web client https formats have been skipped as they are missing a url.
YouTube is forcing SABR streaming for this client.
```

**Cause:** Your yt-dlp version is outdated. YouTube frequently changes its internals.

**Fix:**

```bash
pip install --upgrade yt-dlp
```

On Android/PRoot, the apt version may lag behind. Install via pip and ensure the pip binary takes priority:

```bash
pip install yt-dlp
# Verify version
yt-dlp --version
```

---

### No JavaScript runtime (yt-dlp)

```
WARNING: No supported JavaScript runtime could be found.
```

**Cause:** Newer yt-dlp versions need a JS runtime (deno or Node.js) for YouTube extraction.

**Fix:** Node.js is usually already installed. If using deno:

```bash
curl -fsSL https://deno.land/install.sh | sh
```

---

## Debugging Tips

### Test yt-dlp independently

```bash
# Check if yt-dlp can get video info
yt-dlp -j --no-download "https://youtube.com/watch?v=xxx"

# Try downloading
yt-dlp -f 'best[height<=480][ext=mp4]/best' -o /tmp/test.mp4 "https://youtube.com/watch?v=xxx"
```

### Test FFmpeg independently

```bash
ffmpeg -i /tmp/test.mp4 -vf 'fps=1/10' -vframes 5 -q:v 2 /tmp/frame_%04d.jpg -y
```

### Test module loading

```bash
node -e "require('./src/index.js')"
```

No output = success. Any error means a dependency issue.
