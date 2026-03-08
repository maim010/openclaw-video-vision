#!/usr/bin/env node
/**
 * video-vision — OpenClaw Skill
 * Playwright-based video crawler with frame extraction and vision AI summarization.
 *
 * Supported platforms: YouTube, Bilibili, generic video pages
 * Author: maim010 (https://github.com/maim010)
 * License: MIT
 */

const { chromium } = require('playwright');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const http = require('http');

// ─── Config from environment ──────────────────────────────────────────────────
const CONFIG = {
  apiKey: process.env.VIDEO_VISION_API_KEY || '',
  apiUrl: process.env.VIDEO_VISION_API_URL || 'https://api.openai.com/v1/chat/completions',
  model: process.env.VIDEO_VISION_MODEL || 'gpt-4o',
  proxy: process.env.VIDEO_VISION_PROXY || null,
  frameInterval: parseInt(process.env.VIDEO_VISION_FRAME_INTERVAL || '5', 10),
  maxFrames: parseInt(process.env.VIDEO_VISION_MAX_FRAMES || '20', 10),
  cookiesDir: process.env.VIDEO_VISION_COOKIES_DIR
    ? path.resolve(process.env.VIDEO_VISION_COOKIES_DIR.replace('~', os.homedir()))
    : null,
};

// ─── Platform detection ───────────────────────────────────────────────────────
function detectPlatform(url) {
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  if (/bilibili\.com|b23\.tv/.test(url)) return 'bilibili';
  return 'generic';
}

// ─── Cookie loader ────────────────────────────────────────────────────────────
function loadCookies(platform, cookieFile = null) {
  const filePath = cookieFile
    ? path.resolve(cookieFile.replace('~', os.homedir()))
    : CONFIG.cookiesDir
    ? path.join(CONFIG.cookiesDir, `${platform}_cookies.json`)
    : null;

  if (!filePath || !fs.existsSync(filePath)) return [];

  const raw = fs.readFileSync(filePath, 'utf-8').trim();

  // JSON format
  if (raw.startsWith('[') || raw.startsWith('{')) {
    const parsed = JSON.parse(raw);
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    return arr.map(c => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path || '/',
      httpOnly: c.httpOnly || false,
      secure: c.secure || false,
    }));
  }

  // Netscape format
  return raw
    .split('\n')
    .filter(l => l && !l.startsWith('#'))
    .map(line => {
      const parts = line.split('\t');
      if (parts.length < 7) return null;
      return {
        domain: parts[0],
        path: parts[2],
        secure: parts[3] === 'TRUE',
        expires: parseInt(parts[4], 10) || undefined,
        name: parts[5],
        value: parts[6],
      };
    })
    .filter(Boolean);
}

// ─── Browser launcher ─────────────────────────────────────────────────────────
async function launchBrowser(proxy = null) {
  const launchOptions = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  };

  const proxyStr = proxy || CONFIG.proxy;
  if (proxyStr) {
    const url = new URL(proxyStr.startsWith('http') ? proxyStr : `http://${proxyStr}`);
    launchOptions.proxy = {
      server: `${url.protocol}//${url.hostname}:${url.port}`,
      username: url.username || undefined,
      password: url.password || undefined,
    };
  }

  return chromium.launch(launchOptions);
}

// ─── YouTube scraper ──────────────────────────────────────────────────────────
async function scrapeYouTube(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('h1.ytd-watch-metadata, h1.title', { timeout: 10000 }).catch(() => {});

  const meta = await page.evaluate(() => {
    const title =
      document.querySelector('h1.ytd-watch-metadata yt-formatted-string')?.textContent ||
      document.querySelector('h1.title')?.textContent ||
      document.title;

    const duration =
      document.querySelector('.ytp-time-duration')?.textContent || 'unknown';

    const description =
      document.querySelector('#description-inline-expander yt-attributed-string')?.textContent?.slice(0, 500) ||
      document.querySelector('meta[name="description"]')?.content?.slice(0, 500) || '';

    // Try to get direct video URL from ytInitialPlayerResponse
    let videoUrl = null;
    try {
      const match = document.documentElement.innerHTML.match(/"url":"(https:\/\/[^"]*mime=video[^"]*)"/);
      if (match) videoUrl = match[1].replace(/\\u0026/g, '&');
    } catch (_) {}

    return { title, duration, description, videoUrl };
  });

  return meta;
}

// ─── Bilibili scraper ─────────────────────────────────────────────────────────
async function scrapeBilibili(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('.video-title, h1', { timeout: 10000 }).catch(() => {});

  const meta = await page.evaluate(() => {
    const title =
      document.querySelector('.video-title')?.textContent ||
      document.querySelector('h1')?.textContent ||
      document.title;

    const duration =
      document.querySelector('.bui-video-time-duration')?.textContent ||
      document.querySelector('.bilibili-player-video-time-total')?.textContent ||
      'unknown';

    const description =
      document.querySelector('.basic-desc-info')?.textContent?.slice(0, 500) ||
      document.querySelector('meta[name="description"]')?.content?.slice(0, 500) || '';

    return { title, duration, description, videoUrl: null };
  });

  return meta;
}

// ─── Generic scraper ──────────────────────────────────────────────────────────
async function scrapeGeneric(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

  const meta = await page.evaluate(() => {
    const title = document.title || 'Unknown';
    const videoEl = document.querySelector('video');
    const videoUrl = videoEl?.src || videoEl?.querySelector('source')?.src || null;
    return { title, duration: 'unknown', description: '', videoUrl };
  });

  return meta;
}

// ─── Frame extractor via FFmpeg ───────────────────────────────────────────────
async function extractFrames(videoUrl, duration, outputDir) {
  const durationSecs = parseDuration(duration);
  const interval = CONFIG.frameInterval;
  const maxFrames = CONFIG.maxFrames;

  // Calculate a reasonable interval so we don't exceed maxFrames
  const adjustedInterval = durationSecs > 0
    ? Math.max(interval, Math.ceil(durationSecs / maxFrames))
    : interval;

  fs.mkdirSync(outputDir, { recursive: true });
  const outputPattern = path.join(outputDir, 'frame_%04d.jpg');

  return new Promise((resolve, reject) => {
    const args = [
      '-i', videoUrl,
      '-vf', `fps=1/${adjustedInterval}`,
      '-vframes', String(maxFrames),
      '-q:v', '2',
      outputPattern,
      '-y',
    ];

    const proc = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';

    proc.stderr.on('data', d => { stderr += d.toString(); });
    proc.on('close', code => {
      const frames = fs.readdirSync(outputDir)
        .filter(f => f.endsWith('.jpg'))
        .sort()
        .map(f => path.join(outputDir, f));

      if (frames.length === 0 && code !== 0) {
        reject(new Error(`FFmpeg failed (exit ${code}): ${stderr.slice(-300)}`));
      } else {
        resolve({ frames, adjustedInterval });
      }
    });
  });
}

// ─── Screenshot fallback for platforms without direct video URL ───────────────
async function captureScreenshots(page, platform, outputDir) {
  fs.mkdirSync(outputDir, { recursive: true });
  const frames = [];

  // Seek to various positions and screenshot
  const positions = [0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 0.9];
  const selector = platform === 'bilibili' ? 'video' : 'video';

  for (let i = 0; i < positions.length; i++) {
    try {
      await page.evaluate(
        ({ sel, pos }) => {
          const v = document.querySelector(sel);
          if (v && v.duration) v.currentTime = v.duration * pos;
        },
        { sel: selector, pos: positions[i] }
      );
      await page.waitForTimeout(800);
      const framePath = path.join(outputDir, `frame_${String(i + 1).padStart(4, '0')}.jpg`);
      await page.locator(selector).screenshot({ path: framePath, type: 'jpeg', quality: 80 });
      frames.push(framePath);
    } catch (_) {}
  }

  return { frames, adjustedInterval: 'screenshot' };
}

// ─── Vision API call ──────────────────────────────────────────────────────────
async function analyzeFramesWithVision(frames, title, description) {
  if (!CONFIG.apiKey) throw new Error('VIDEO_VISION_API_KEY is not set.');

  // Build messages: one text prompt + image contents
  const imageContents = frames.map(f => {
    const b64 = fs.readFileSync(f).toString('base64');
    return {
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${b64}`, detail: 'low' },
    };
  });

  const messages = [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `You are analyzing key frames extracted from a video titled: "${title}".
${description ? `Description hint: ${description}\n` : ''}
These ${frames.length} frames are sampled evenly across the video's duration.

Please provide:
1. A concise overall summary (2-4 sentences) of what this video is about based on the visuals.
2. A list of key visual moments or scenes (with approximate frame index).
3. Main topics or subjects visible in the video (as tags).

Format your response as:

SUMMARY:
<summary text>

KEY MOMENTS:
- Frame ~N: <description>
- Frame ~N: <description>

TOPICS: <tag1>, <tag2>, <tag3>`,
        },
        ...imageContents,
      ],
    },
  ];

  const body = JSON.stringify({
    model: CONFIG.model,
    max_tokens: 800,
    messages,
  });

  return new Promise((resolve, reject) => {
    const apiUrl = new URL(CONFIG.apiUrl);
    const lib = apiUrl.protocol === 'https:' ? https : http;

    const req = lib.request(
      {
        hostname: apiUrl.hostname,
        port: apiUrl.port || (apiUrl.protocol === 'https:' ? 443 : 80),
        path: apiUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${CONFIG.apiKey}`,
          'Content-Length': Buffer.byteLength(body),
        },
      },
      res => {
        let data = '';
        res.on('data', c => { data += c; });
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.error) return reject(new Error(json.error.message));
            const text = json.choices?.[0]?.message?.content || '';
            resolve(text);
          } catch (e) {
            reject(e);
          }
        });
      }
    );

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Result formatter ─────────────────────────────────────────────────────────
function formatResult(url, platform, meta, frameCount, interval, visionResult) {
  const platformLabel = { youtube: 'YouTube', bilibili: 'Bilibili', generic: 'Web Video' }[platform];
  const lines = [
    `🎬 Video Summary: ${meta.title}`,
    `📺 Platform: ${platformLabel} | Duration: ${meta.duration}`,
    `👁️  Frames analyzed: ${frameCount} (every ~${interval}s)`,
    `🔗 URL: ${url}`,
    '',
    visionResult,
  ];
  return lines.join('\n');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseDuration(str) {
  if (!str || str === 'unknown') return 0;
  const parts = str.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parseInt(str, 10) || 0;
}

function cleanupDir(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) {}
}

// ─── Main entry point ─────────────────────────────────────────────────────────
async function run({ url, proxy = null, cookieFile = null }) {
  const platform = detectPlatform(url);
  const cookies = loadCookies(platform, cookieFile);
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'video-vision-'));

  let browser, page;

  try {
    browser = await launchBrowser(proxy);
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    });

    if (cookies.length > 0) await context.addCookies(cookies);
    page = await context.newPage();

    let meta;
    if (platform === 'youtube') meta = await scrapeYouTube(page, url);
    else if (platform === 'bilibili') meta = await scrapeBilibili(page, url);
    else meta = await scrapeGeneric(page, url);

    let frameInfo;
    const framesDir = path.join(tmpDir, 'frames');

    if (meta.videoUrl) {
      try {
        frameInfo = await extractFrames(meta.videoUrl, meta.duration, framesDir);
      } catch (_) {
        frameInfo = await captureScreenshots(page, platform, framesDir);
      }
    } else {
      frameInfo = await captureScreenshots(page, platform, framesDir);
    }

    const { frames, adjustedInterval } = frameInfo;

    if (frames.length === 0) {
      return `⚠️ Could not extract frames from: ${url}\nTitle: ${meta.title}`;
    }

    const visionResult = await analyzeFramesWithVision(frames, meta.title, meta.description);

    return formatResult(url, platform, meta, frames.length, adjustedInterval, visionResult);
  } finally {
    if (browser) await browser.close().catch(() => {});
    cleanupDir(tmpDir);
  }
}

// ─── CLI runner ───────────────────────────────────────────────────────────────
if (require.main === module) {
  const args = process.argv.slice(2);
  const url = args[0];
  const proxy = args.find(a => a.startsWith('--proxy='))?.split('=')[1] || null;
  const cookieFile = args.find(a => a.startsWith('--cookies='))?.split('=')[1] || null;

  if (!url) {
    console.error('Usage: node index.js <video-url> [--proxy=<proxy>] [--cookies=<file>]');
    process.exit(1);
  }

  run({ url, proxy, cookieFile })
    .then(result => { console.log(result); })
    .catch(err => { console.error('Error:', err.message); process.exit(1); });
}

module.exports = { run, detectPlatform, loadCookies };
