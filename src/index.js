#!/usr/bin/env node
/**
 * video-vision — OpenClaw Skill
 * Playwright-based video crawler with frame extraction and vision AI summarization.
 *
 * Supported platforms: YouTube, Bilibili, generic video pages
 * Author: maim010 (https://github.com/maim010)
 * License: MIT
 */

const { execFile, spawn } = require('child_process');
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
  // Extraction mode: 'auto' (default) | 'ytdlp' | 'browser'
  mode: (process.env.VIDEO_VISION_MODE || 'auto').toLowerCase(),
  // Cloud browser settings
  browser: (process.env.VIDEO_VISION_BROWSER || 'local').toLowerCase(),
  browserlessToken: process.env.VIDEO_VISION_BROWSERLESS_TOKEN || '',
  browserbaseApiKey: process.env.VIDEO_VISION_BROWSERBASE_API_KEY || '',
  browserbaseProjectId: process.env.VIDEO_VISION_BROWSERBASE_PROJECT_ID || '',
  steelApiKey: process.env.VIDEO_VISION_STEEL_API_KEY || '',
  // Transcription settings
  lowResource: process.env.VIDEO_VISION_LOW_RESOURCE === 'true',
  transcription: process.env.VIDEO_VISION_TRANSCRIPTION || 'auto', // 'auto' | 'on' | 'off'
  whisperPath: process.env.VIDEO_VISION_WHISPER_PATH || 'whisper-cli',
  whisperModelPath: process.env.VIDEO_VISION_WHISPER_MODEL_PATH || '',
  whisperModel: process.env.VIDEO_VISION_WHISPER_MODEL || 'medium',
  whisperThreads: parseInt(process.env.VIDEO_VISION_WHISPER_THREADS || '0', 10), // 0 = auto (cpu count / 2)
  whisperLanguage: process.env.VIDEO_VISION_WHISPER_LANGUAGE || 'auto',
};

// ─── Resource check ──────────────────────────────────────────────────────────
function checkResources() {
  if (CONFIG.lowResource) return;

  const cpuCount = os.cpus().length;
  const totalMem = os.totalmem();
  const minCores = 12;
  const minMemGB = 14;

  const errors = [];
  if (cpuCount < minCores) {
    errors.push(`CPU: ${cpuCount} cores found, ${minCores} required`);
  }
  if (totalMem < minMemGB * 1024 * 1024 * 1024) {
    errors.push(`RAM: ${(totalMem / 1024 ** 3).toFixed(1)}GB found, ${minMemGB}GB required`);
  }
  if (errors.length > 0) {
    throw new Error(
      `Insufficient system resources for video-vision:\n` +
      errors.map(e => `  - ${e}`).join('\n') + '\n\n' +
      `video-vision requires ${minCores}+ CPU cores and ${minMemGB}GB+ RAM for local audio transcription.\n` +
      `Set VIDEO_VISION_LOW_RESOURCE=true to run without transcription on lower-spec machines.`
    );
  }
}

// ─── Whisper availability check ──────────────────────────────────────────────
function checkWhisper() {
  return new Promise(resolve => {
    execFile(CONFIG.whisperPath, ['--help'], { timeout: 5000 }, (err) => {
      resolve(!err);
    });
  });
}

// ─── Resolve whisper model path ──────────────────────────────────────────────
function resolveWhisperModel() {
  // 1. Explicit path
  if (CONFIG.whisperModelPath) {
    if (fs.existsSync(CONFIG.whisperModelPath)) return CONFIG.whisperModelPath;
    throw new Error(`Whisper model not found at: ${CONFIG.whisperModelPath}`);
  }

  const modelName = `ggml-${CONFIG.whisperModel}.bin`;

  // 2. ~/.cache/whisper/ggml-{model}.bin
  const cachePath = path.join(os.homedir(), '.cache', 'whisper', modelName);
  if (fs.existsSync(cachePath)) return cachePath;

  // 3. ./models/ggml-{model}.bin (whisper.cpp convention)
  const localPath = path.join(process.cwd(), 'models', modelName);
  if (fs.existsSync(localPath)) return localPath;

  throw new Error(
    `Whisper model "${modelName}" not found.\n` +
    `Searched:\n` +
    `  - ${cachePath}\n` +
    `  - ${localPath}\n\n` +
    `Download with:\n` +
    `  mkdir -p ~/.cache/whisper\n` +
    `  wget https://huggingface.co/ggerganov/whisper.cpp/resolve/main/${modelName} -O ~/.cache/whisper/${modelName}\n\n` +
    `Or set VIDEO_VISION_WHISPER_MODEL_PATH to the full path of your model file.`
  );
}

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

// ─── yt-dlp integration (optional) ───────────────────────────────────────────
function getVideoWithYtDlp(url, { proxy = null, cookieFile = null } = {}) {
  return new Promise(resolve => {
    const args = [
      '-j', '--no-download',
      '-f', 'best[height<=480][ext=mp4]/best[ext=mp4]/best',
      url,
    ];

    const proxyStr = proxy || CONFIG.proxy;
    if (proxyStr) args.push('--proxy', proxyStr);
    if (cookieFile) {
      const resolved = path.resolve(cookieFile.replace('~', os.homedir()));
      if (fs.existsSync(resolved)) args.push('--cookies', resolved);
    }

    execFile('yt-dlp', args, { timeout: 30000, maxBuffer: 5 * 1024 * 1024 }, (err, stdout) => {
      if (err || !stdout) return resolve(null);
      try {
        const info = JSON.parse(stdout);
        resolve({
          title: info.title || info.fulltitle || 'Unknown',
          duration: info.duration ? formatSeconds(info.duration) : 'unknown',
          durationSecs: info.duration || 0,
          description: (info.description || '').slice(0, 500),
          videoUrl: info.url || null,
          httpHeaders: info.http_headers || {},
        });
      } catch (_) {
        resolve(null);
      }
    });
  });
}

// ─── yt-dlp download to local file (fallback when direct URL fails) ─────────
function downloadWithYtDlp(url, outputPath, { proxy = null, cookieFile = null } = {}) {
  return new Promise((resolve, reject) => {
    const args = [
      '-f', 'best[height<=480][ext=mp4]/best[ext=mp4]/best',
      '-o', outputPath,
      '--no-playlist',
      url,
    ];

    const proxyStr = proxy || CONFIG.proxy;
    if (proxyStr) args.push('--proxy', proxyStr);
    if (cookieFile) {
      const resolved = path.resolve(cookieFile.replace('~', os.homedir()));
      if (fs.existsSync(resolved)) args.push('--cookies', resolved);
    }

    execFile('yt-dlp', args, { timeout: 300000, maxBuffer: 1024 * 1024 }, (err) => {
      if (err) return reject(err);
      if (!fs.existsSync(outputPath)) return reject(new Error('yt-dlp download produced no file'));
      resolve(outputPath);
    });
  });
}

// ─── Browser launcher — supports local + cloud browsers ──────────────────────
async function launchBrowser(proxy = null) {
  let chromium;
  try {
    chromium = require('playwright-core').chromium;
  } catch (_) {
    throw new Error(
      'playwright-core is not installed. Install it with: npm install playwright-core\n' +
      'If you only need the yt-dlp + FFmpeg path, playwright-core is not required.'
    );
  }

  const mode = CONFIG.browser;

  if (mode === 'browserless') {
    if (!CONFIG.browserlessToken) throw new Error('VIDEO_VISION_BROWSERLESS_TOKEN is not set.');
    const wsUrl = `wss://production-sfo.browserless.io?token=${CONFIG.browserlessToken}`;
    return chromium.connectOverCDP(wsUrl);
  }

  if (mode === 'browserbase') {
    if (!CONFIG.browserbaseApiKey) throw new Error('VIDEO_VISION_BROWSERBASE_API_KEY is not set.');
    if (!CONFIG.browserbaseProjectId) throw new Error('VIDEO_VISION_BROWSERBASE_PROJECT_ID is not set.');

    // Create a session via REST API
    const sessionData = await new Promise((resolve, reject) => {
      const body = JSON.stringify({ projectId: CONFIG.browserbaseProjectId });
      const req = https.request(
        {
          hostname: 'www.browserbase.com',
          path: '/v1/sessions',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-bb-api-key': CONFIG.browserbaseApiKey,
            'Content-Length': Buffer.byteLength(body),
          },
        },
        res => {
          let data = '';
          res.on('data', c => { data += c; });
          res.on('end', () => {
            try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
          });
        }
      );
      req.on('error', reject);
      req.write(body);
      req.end();
    });

    const connectUrl = `wss://connect.browserbase.com?apiKey=${CONFIG.browserbaseApiKey}&sessionId=${sessionData.id}`;
    return chromium.connectOverCDP(connectUrl);
  }

  if (mode === 'steel') {
    if (!CONFIG.steelApiKey) throw new Error('VIDEO_VISION_STEEL_API_KEY is not set.');
    const wsUrl = `wss://connect.steel.dev?apiKey=${CONFIG.steelApiKey}`;
    return chromium.connectOverCDP(wsUrl);
  }

  // local mode (default)
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

    return { title, duration, description, videoUrl: null };
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
async function extractFrames(videoUrl, duration, outputDir, headers = {}) {
  const durationSecs = typeof duration === 'number' ? duration : parseDuration(duration);
  const interval = CONFIG.frameInterval;
  const maxFrames = CONFIG.maxFrames;

  // Calculate a reasonable interval so we don't exceed maxFrames
  const adjustedInterval = durationSecs > 0
    ? Math.max(interval, Math.ceil(durationSecs / maxFrames))
    : interval;

  fs.mkdirSync(outputDir, { recursive: true });
  const outputPattern = path.join(outputDir, 'frame_%04d.jpg');

  return new Promise((resolve, reject) => {
    const args = [];

    // Build -headers argument (must come before -i)
    const headerEntries = Object.entries(headers);
    if (headerEntries.length > 0) {
      const headerStr = headerEntries.map(([k, v]) => `${k}: ${v}\r\n`).join('');
      args.push('-headers', headerStr);
    }

    args.push(
      '-i', videoUrl,
      '-vf', `fps=1/${adjustedInterval}`,
      '-vframes', String(maxFrames),
      '-q:v', '2',
      outputPattern,
      '-y',
    );

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

// ─── Audio extractor via FFmpeg ────────────────────────────────────────────────
function extractAudio(videoSource, outputPath) {
  return new Promise(resolve => {
    const args = [
      '-i', videoSource,
      '-vn', '-acodec', 'pcm_s16le', '-ar', '16000', '-ac', '1',
      '-y', outputPath,
    ];

    const proc = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';

    const timeout = setTimeout(() => { proc.kill(); }, 120000);
    proc.stderr.on('data', d => { stderr += d.toString(); });
    proc.on('close', code => {
      clearTimeout(timeout);
      if (code === 0 && fs.existsSync(outputPath)) {
        resolve(outputPath);
      } else {
        resolve(null);
      }
    });
    proc.on('error', () => {
      clearTimeout(timeout);
      resolve(null);
    });
  });
}

// ─── Audio transcription via whisper-cli ──────────────────────────────────────
async function transcribeAudio(wavPath) {
  const modelPath = resolveWhisperModel();
  const threads = CONFIG.whisperThreads || Math.max(1, Math.floor(os.cpus().length / 2));

  const args = [
    '-m', modelPath,
    '-f', wavPath,
    '-t', String(threads),
    '-oj',
  ];
  if (CONFIG.whisperLanguage !== 'auto') {
    args.push('-l', CONFIG.whisperLanguage);
  }

  return new Promise(resolve => {
    const proc = spawn(CONFIG.whisperPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';

    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.on('close', code => {
      if (code !== 0 || !stdout.trim()) return resolve(null);
      try {
        const json = JSON.parse(stdout);
        const segments = (json.transcription || []).map(s => ({
          start: s.offsets?.from != null ? s.offsets.from / 1000 : 0,
          end: s.offsets?.to != null ? s.offsets.to / 1000 : 0,
          text: (s.text || '').trim(),
        }));
        const text = segments.map(s => s.text).join(' ');
        resolve({
          text,
          language: json.result?.language || CONFIG.whisperLanguage,
          segments,
        });
      } catch (_) {
        resolve(null);
      }
    });
    proc.on('error', () => resolve(null));
  });
}

// ─── Format transcription for vision prompt ───────────────────────────────────
function formatTranscription(transcription) {
  if (!transcription || !transcription.segments || transcription.segments.length === 0) {
    return transcription?.text || '';
  }

  const fmtTime = secs => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  let result = '';
  for (const seg of transcription.segments) {
    const line = `[${fmtTime(seg.start)} - ${fmtTime(seg.end)}] ${seg.text}\n`;
    if (result.length + line.length > 2000) {
      result += '... (transcription truncated)\n';
      break;
    }
    result += line;
  }
  return result.trim();
}

// ─── Screenshot fallback for platforms without direct video URL ───────────────
async function captureScreenshots(page, platform, outputDir) {
  fs.mkdirSync(outputDir, { recursive: true });
  const frames = [];

  // Step 1: Click play button to start video (avoid black-screen captures)
  try {
    if (platform === 'youtube') {
      const playBtn = page.locator('.ytp-play-button');
      if (await playBtn.count() > 0) await playBtn.click().catch(() => {});
    } else if (platform === 'bilibili') {
      const playBtn = page.locator('.bpx-player-ctrl-play');
      if (await playBtn.count() > 0) await playBtn.click().catch(() => {});
    } else {
      // Generic: try clicking the video element itself
      const videoEl = page.locator('video');
      if (await videoEl.count() > 0) await videoEl.click().catch(() => {});
    }

    // Wait for video to actually start playing
    await page.waitForFunction(
      () => {
        const v = document.querySelector('video');
        return v && v.currentTime > 0 && !v.paused;
      },
      { timeout: 5000 }
    ).catch(() => {});
  } catch (_) {}

  // Step 2: Seek to various positions and screenshot
  const positions = [0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 0.9];

  for (let i = 0; i < positions.length; i++) {
    try {
      await page.evaluate(
        ({ pos }) => {
          const v = document.querySelector('video');
          if (v && v.duration) v.currentTime = v.duration * pos;
        },
        { pos: positions[i] }
      );
      await page.waitForTimeout(800);
      const framePath = path.join(outputDir, `frame_${String(i + 1).padStart(4, '0')}.jpg`);
      await page.locator('video').screenshot({ path: framePath, type: 'jpeg', quality: 80 });
      frames.push(framePath);
    } catch (_) {}
  }

  return { frames, adjustedInterval: 'screenshot' };
}

// ─── Vision API call ──────────────────────────────────────────────────────────
async function analyzeFramesWithVision(frames, title, description, transcription = null) {
  if (!CONFIG.apiKey) throw new Error('VIDEO_VISION_API_KEY is not set.');

  // Build messages: one text prompt + image contents
  const imageContents = frames.map(f => {
    const b64 = fs.readFileSync(f).toString('base64');
    return {
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${b64}`, detail: 'low' },
    };
  });

  const transcriptBlock = transcription ? `\nAudio Transcription:\n${formatTranscription(transcription)}\n` : '';
  const hasAudio = !!transcription;

  const messages = [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `You are analyzing key frames${hasAudio ? ' and audio transcription' : ''} extracted from a video titled: "${title}".
${description ? `Description hint: ${description}\n` : ''}
These ${frames.length} frames are sampled evenly across the video's duration.
${transcriptBlock}
Please provide:
1. A concise overall summary (2-4 sentences) based on the visuals${hasAudio ? ' and audio content' : ''}.
2. Key moments (with approximate frame index${hasAudio ? ' and timestamp' : ''}).
3. Main topics (as tags).

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
function formatResult(url, platform, meta, frameCount, interval, visionResult, transcriptionInfo = null) {
  const platformLabel = { youtube: 'YouTube', bilibili: 'Bilibili', generic: 'Web Video' }[platform];
  const lines = [
    `🎬 Video Summary: ${meta.title}`,
    `📺 Platform: ${platformLabel} | Duration: ${meta.duration}`,
    `👁️  Frames analyzed: ${frameCount} (every ~${interval}s)`,
    `🔗 URL: ${url}`,
    '',
    visionResult,
  ];
  if (transcriptionInfo) {
    lines.splice(3, 0,
      `🎙️ Audio transcribed: ${transcriptionInfo.wordCount} words ` +
      `(whisper-${CONFIG.whisperModel}, language: ${transcriptionInfo.language})`
    );
  }
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

function formatSeconds(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function cleanupDir(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) {}
}

// ─── Main entry point ─────────────────────────────────────────────────────────
async function run({ url, proxy = null, cookieFile = null }) {
  // Resource pre-check
  checkResources();

  // Determine if transcription is active
  const transcriptionEnabled = CONFIG.transcription === 'on' ||
    (CONFIG.transcription === 'auto' && !CONFIG.lowResource);

  // Check whisper availability if transcription enabled
  let canTranscribe = false;
  if (transcriptionEnabled) {
    canTranscribe = await checkWhisper();
    if (!canTranscribe && !CONFIG.lowResource) {
      throw new Error(
        'whisper-cli not found. Install whisper.cpp or set VIDEO_VISION_LOW_RESOURCE=true.\n' +
        'See: https://github.com/ggml-org/whisper.cpp'
      );
    }
  }

  const platform = detectPlatform(url);
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'video-vision-'));
  const framesDir = path.join(tmpDir, 'frames');
  const audioPath = path.join(tmpDir, 'audio.wav');
  const mode = CONFIG.mode; // 'auto' | 'ytdlp' | 'browser'

  try {
    let ytdlpInfo = null;

    // ── Phase 1: yt-dlp + FFmpeg (skipped when mode === 'browser') ────────
    if (mode !== 'browser') {
      ytdlpInfo = await getVideoWithYtDlp(url, { proxy, cookieFile });

      if (ytdlpInfo) {
        let frameInfo = null;
        let videoSource = null;

        // Step 1a: Try FFmpeg with direct URL
        if (ytdlpInfo.videoUrl) {
          try {
            const ffmpegHeaders = {};
            if (ytdlpInfo.httpHeaders) {
              if (ytdlpInfo.httpHeaders.Referer) ffmpegHeaders.Referer = ytdlpInfo.httpHeaders.Referer;
              if (ytdlpInfo.httpHeaders['User-Agent']) ffmpegHeaders['User-Agent'] = ytdlpInfo.httpHeaders['User-Agent'];
            }
            if (platform === 'bilibili' && !ffmpegHeaders.Referer) {
              ffmpegHeaders.Referer = 'https://www.bilibili.com/';
            }

            frameInfo = await extractFrames(
              ytdlpInfo.videoUrl,
              ytdlpInfo.durationSecs || ytdlpInfo.duration,
              framesDir,
              ffmpegHeaders,
            );
            if (frameInfo.frames.length === 0) frameInfo = null;
            else videoSource = ytdlpInfo.videoUrl;
          } catch (_) {
            frameInfo = null;
          }
        }

        // Step 1b: Direct URL failed (403 etc.) — download via yt-dlp then extract
        if (!frameInfo) {
          try {
            const localVideo = path.join(tmpDir, 'video.mp4');
            await downloadWithYtDlp(url, localVideo, { proxy, cookieFile });
            frameInfo = await extractFrames(
              localVideo,
              ytdlpInfo.durationSecs || ytdlpInfo.duration,
              framesDir,
            );
            if (frameInfo.frames.length === 0) frameInfo = null;
            else videoSource = localVideo;
          } catch (_) {
            frameInfo = null;
          }
        }

        if (frameInfo && frameInfo.frames.length > 0) {
          // Extract audio and transcribe in parallel with nothing (sequential after frames)
          let transcription = null;
          if (canTranscribe && videoSource) {
            const audioExtracted = await extractAudio(videoSource, audioPath);
            if (audioExtracted) {
              transcription = await transcribeAudio(audioPath);
            }
          }

          const visionResult = await analyzeFramesWithVision(
            frameInfo.frames, ytdlpInfo.title, ytdlpInfo.description, transcription
          );
          const meta = { title: ytdlpInfo.title, duration: ytdlpInfo.duration, description: ytdlpInfo.description };
          const transcriptionInfo = transcription ? {
            wordCount: transcription.text.split(/\s+/).length,
            language: transcription.language || CONFIG.whisperLanguage,
          } : null;
          return formatResult(url, platform, meta, frameInfo.frames.length, frameInfo.adjustedInterval, visionResult, transcriptionInfo);
        }
      }

      // yt-dlp mode: do not fall through to browser
      if (mode === 'ytdlp') {
        throw new Error(
          'yt-dlp + FFmpeg failed to extract frames and VIDEO_VISION_MODE is set to "ytdlp" (no browser fallback).'
        );
      }
    }

    // ── Phase 2: Browser fallback (skipped when mode === 'ytdlp') ─────────
    const cookies = loadCookies(platform, cookieFile);
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

      // Use yt-dlp metadata if browser didn't get good data
      if (ytdlpInfo) {
        if (!meta.title || meta.title === 'Unknown') meta.title = ytdlpInfo.title;
        if (meta.duration === 'unknown' && ytdlpInfo.duration !== 'unknown') meta.duration = ytdlpInfo.duration;
        if (!meta.description && ytdlpInfo.description) meta.description = ytdlpInfo.description;
      }

      let frameInfo;
      let videoSource = null;

      if (meta.videoUrl) {
        // Generic scraper found a direct video URL
        try {
          frameInfo = await extractFrames(meta.videoUrl, meta.duration, framesDir);
          videoSource = meta.videoUrl;
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

      // Transcribe audio if we have a video source (not screenshots)
      let transcription = null;
      if (canTranscribe && videoSource) {
        const audioExtracted = await extractAudio(videoSource, audioPath);
        if (audioExtracted) {
          transcription = await transcribeAudio(audioPath);
        }
      }

      const visionResult = await analyzeFramesWithVision(frames, meta.title, meta.description, transcription);
      const transcriptionInfo = transcription ? {
        wordCount: transcription.text.split(/\s+/).length,
        language: transcription.language || CONFIG.whisperLanguage,
      } : null;

      return formatResult(url, platform, meta, frames.length, adjustedInterval, visionResult, transcriptionInfo);
    } finally {
      if (browser) await browser.close().catch(() => {});
    }
  } finally {
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
    console.error('Usage: node src/index.js <video-url> [--proxy=<proxy>] [--cookies=<file>]');
    process.exit(1);
  }

  run({ url, proxy, cookieFile })
    .then(result => { console.log(result); })
    .catch(err => { console.error('Error:', err.message); process.exit(1); });
}

module.exports = { run, detectPlatform, loadCookies, getVideoWithYtDlp, downloadWithYtDlp, extractAudio, transcribeAudio, checkResources };
