# Contributing to openclaw-video-vision

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/maim010/openclaw-video-vision.git
cd openclaw-video-vision
npm install
npx playwright install chromium
```

Make sure you have **FFmpeg** installed:
- macOS: `brew install ffmpeg`
- Ubuntu/Debian: `sudo apt install ffmpeg`
- Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)

## Project Structure

```
src/index.js              # Core module (crawler, extractor, vision client)
skills/video-vision/      # OpenClaw skill manifest
examples/                 # Usage examples
docs/                     # Documentation
```

## How to Contribute

### Bug Reports

Open an [issue](https://github.com/maim010/openclaw-video-vision/issues) with:
- Steps to reproduce
- Expected vs actual behavior
- Platform and Node.js version

### Feature Requests

Ideas we'd love help with:
- **New platforms**: TikTok, Twitter/X, Vimeo, Dailymotion
- **Frame extraction**: scene-change detection, thumbnail-based extraction
- **Output formats**: JSON, SRT subtitles, markdown reports
- **Vision models**: adapter for local models (LLaVA, etc.)

### Pull Requests

1. Fork the repo and create a branch: `git checkout -b feature/my-feature`
2. Make your changes in `src/`
3. Test with a real video URL if possible
4. Submit a PR with a clear description

### Code Style

- Use standard JavaScript (no TypeScript for now)
- Keep functions focused and well-named
- Add JSDoc comments for public functions
- Handle errors gracefully with informative messages

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
