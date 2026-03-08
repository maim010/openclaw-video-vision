# Cookie

Cookie 注入允许访问需要登录或有年龄限制的内容。

## 两种提供 Cookie 的方式

### 1. 单次请求 `--cookies` 参数

```bash
node src/index.js https://youtube.com/watch?v=XXXXX --cookies=~/youtube_cookies.json
```

### 2. 全局 Cookie 目录

```bash
export VIDEO_VISION_COOKIES_DIR="~/.openclaw/cookies"
```

将 Cookie 文件以 `{平台}_cookies.json` 命名放入该目录：

```
~/.openclaw/cookies/
├── youtube_cookies.json
├── bilibili_cookies.json
└── generic_cookies.json
```

## Cookie 格式

### JSON 格式

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

### Netscape 格式

标准 `cookies.txt` 格式（由浏览器扩展导出）：

```
.youtube.com	TRUE	/	TRUE	1893456000	SID	your_value
.bilibili.com	TRUE	/	FALSE	1893456000	SESSDATA	your_value
```

字段说明：`domain`、`includeSubdomains`、`path`、`secure`、`expiry`、`name`、`value`（Tab 分隔）。

## 如何导出 Cookie

### 从浏览器扩展导出

1. 安装一个 Cookie 导出扩展：
   - Chrome：[Get cookies.txt LOCALLY](https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc)
   - Firefox：[cookies.txt](https://addons.mozilla.org/en-US/firefox/addon/cookies-txt/)
2. 访问目标网站并登录
3. 点击扩展导出 Cookie
4. 保存为 `youtube_cookies.txt` 或 `bilibili_cookies.txt`

### 从 yt-dlp 导出

```bash
yt-dlp --cookies-from-browser chrome --cookies youtube_cookies.txt "https://youtube.com"
```

## Cookie 在各路径中的使用方式

| 路径 | Cookie 使用方式 |
|------|-----------------|
| yt-dlp（阶段 1） | 通过 `--cookies` 参数传递给 yt-dlp |
| 浏览器（阶段 2） | 通过 `context.addCookies()` 注入到 Playwright 浏览器上下文 |
