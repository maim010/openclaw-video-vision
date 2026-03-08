# Cookies

Cookie injection allows access to authenticated or age-restricted content.

## Two Ways to Provide Cookies

### 1. Per-request `--cookies` flag

```bash
node src/index.js https://youtube.com/watch?v=XXXXX --cookies=~/youtube_cookies.json
```

### 2. Global cookies directory

```bash
export VIDEO_VISION_COOKIES_DIR="~/.openclaw/cookies"
```

Place cookie files named `{platform}_cookies.json` in the directory:

```
~/.openclaw/cookies/
├── youtube_cookies.json
├── bilibili_cookies.json
└── generic_cookies.json
```

## Cookie Formats

### JSON format

```json
[
  {
    "name": "SID",
    "value": "xxx",
    "domain": ".youtube.com",
    "path": "/",
    "httpOnly": true,
    "secure": true
  }
]
```

### Netscape format

Standard `cookies.txt` format (exported by browser extensions):

```
.youtube.com	TRUE	/	TRUE	1893456000	SID	your_value
.bilibili.com	TRUE	/	FALSE	1893456000	SESSDATA	your_value
```

Fields: `domain`, `includeSubdomains`, `path`, `secure`, `expiry`, `name`, `value` (tab-separated).

## How to Export Cookies

### From Browser Extensions

1. Install a cookie export extension:
   - Chrome: [Get cookies.txt LOCALLY](https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc)
   - Firefox: [cookies.txt](https://addons.mozilla.org/en-US/firefox/addon/cookies-txt/)
2. Navigate to the target site and log in
3. Click the extension and export cookies
4. Save as `youtube_cookies.txt` or `bilibili_cookies.txt`

### From yt-dlp

```bash
yt-dlp --cookies-from-browser chrome --cookies youtube_cookies.txt "https://youtube.com"
```

## Cookie Usage by Path

| Path | How cookies are used |
|------|---------------------|
| yt-dlp (Phase 1) | Passed via `--cookies` flag to yt-dlp |
| Browser (Phase 2) | Injected into Playwright browser context via `context.addCookies()` |
