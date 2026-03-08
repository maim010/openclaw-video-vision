# Cookie Setup Guide

This guide explains how to export and configure cookies for accessing authenticated or restricted video content.

## Why Cookies?

Some videos require authentication to access:
- **YouTube**: age-restricted, members-only, or private videos
- **Bilibili**: VIP-exclusive content, region-locked videos

By providing cookies from a logged-in browser session, `video-vision` can access this content on your behalf.

---

## Exporting Cookies

### Option 1: Browser Extensions (Recommended)

| Browser | Extension |
|---------|-----------|
| Chrome / Edge | [Cookie-Editor](https://cookie-editor.cgagnier.ca/) |
| Firefox | [Cookie-Editor](https://addons.mozilla.org/addon/cookie-editor/) |

Steps:
1. Log in to the video platform in your browser
2. Open the Cookie-Editor extension
3. Click **Export** > choose **JSON** format
4. Save as `youtube_cookies.json` or `bilibili_cookies.json`

### Option 2: DevTools

1. Open DevTools (F12) > Application > Cookies
2. Select the platform domain
3. Copy relevant cookies into the JSON format below

---

## Cookie File Formats

### JSON Format (Recommended)

Save as `~/.openclaw/cookies/youtube_cookies.json`:

```json
[
  {
    "name": "SID",
    "value": "your_sid_value",
    "domain": ".youtube.com",
    "path": "/"
  },
  {
    "name": "HSID",
    "value": "your_hsid_value",
    "domain": ".youtube.com",
    "path": "/"
  },
  {
    "name": "SSID",
    "value": "your_ssid_value",
    "domain": ".youtube.com",
    "path": "/"
  }
]
```

### Netscape Format

Save as `~/.openclaw/cookies/bilibili_cookies.txt`:

```
# Netscape HTTP Cookie File
.bilibili.com	TRUE	/	FALSE	1893456000	SESSDATA	your_sessdata_here
.bilibili.com	TRUE	/	FALSE	1893456000	bili_jct	your_bili_jct_here
.bilibili.com	TRUE	/	FALSE	1893456000	DedeUserID	your_uid_here
```

Fields (tab-separated): `domain`, `include_subdomains`, `path`, `secure`, `expiry`, `name`, `value`

---

## Configuration

### Per-Request

```
Summarize this video using cookies at ~/my_cookies.json:
https://www.youtube.com/watch?v=XXXXX
```

### Global Default

Set `VIDEO_VISION_COOKIES_DIR` to a directory containing cookie files named by platform:

```
~/.openclaw/cookies/
  ├── youtube_cookies.json
  ├── bilibili_cookies.json
  └── generic_cookies.json
```

---

## Security Notes

- Cookie files contain sensitive session data — **do not commit them to git**
- The `.gitignore` in this project already excludes `*_cookies.json` and `*_cookies.txt`
- Cookies are only sent to their respective platform domains via Playwright
- Rotate your cookies periodically and revoke old sessions
