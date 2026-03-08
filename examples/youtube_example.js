#!/usr/bin/env node
/**
 * YouTube video summarization example
 *
 * Prerequisites:
 *   VIDEO_VISION_API_KEY=sk-xxx node examples/youtube_example.js
 */

const { run } = require('../src/index');

const VIDEO_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

(async () => {
  console.log('Summarizing YouTube video...\n');

  // Basic usage
  const result = await run({ url: VIDEO_URL });
  console.log(result);

  // With proxy
  // const result = await run({
  //   url: VIDEO_URL,
  //   proxy: 'http://127.0.0.1:7890',
  // });

  // With cookies for age-restricted content
  // const result = await run({
  //   url: 'https://www.youtube.com/watch?v=RESTRICTED_ID',
  //   cookieFile: '~/youtube_cookies.json',
  // });
})();
