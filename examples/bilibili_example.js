#!/usr/bin/env node
/**
 * Bilibili video summarization example
 *
 * Prerequisites:
 *   VIDEO_VISION_API_KEY=sk-xxx node examples/bilibili_example.js
 */

const { run } = require('../src/index');

const VIDEO_URL = 'https://www.bilibili.com/video/BV1xx411c7mD';

(async () => {
  console.log('Summarizing Bilibili video...\n');

  // Basic usage
  const result = await run({ url: VIDEO_URL });
  console.log(result);

  // With proxy (recommended for Bilibili outside China)
  // const result = await run({
  //   url: VIDEO_URL,
  //   proxy: 'http://127.0.0.1:7890',
  // });

  // With cookies for VIP / members-only content
  // const result = await run({
  //   url: 'https://www.bilibili.com/video/BVXXXXXXX',
  //   cookieFile: '~/bilibili_cookies.json',
  //   proxy: 'http://127.0.0.1:7890',
  // });
})();
