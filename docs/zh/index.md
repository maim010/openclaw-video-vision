---
layout: home
hero:
  name: openclaw-video-vision
  text: AI 驱动的视频理解
  tagline: 抓取任意视频平台，提取关键帧，通过视觉 AI 生成结构化摘要。
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/installation
    - theme: alt
      text: 在 GitHub 上查看
      link: https://github.com/maim010/openclaw-video-vision
---

## 概述

openclaw-video-vision 是一个 [OpenClaw](https://clawhub.com) 技能，它可以：

1. 接收一个视频 URL（YouTube、Bilibili 或任何包含 `<video>` 的网页）
2. 通过 **yt-dlp + FFmpeg** 或 **浏览器截图** 提取关键帧
3. 将帧发送给视觉 AI 模型进行结构化摘要

## 快速导航

| 页面 | 描述 |
|------|------|
| [安装](./installation.md) | 前置条件、安装步骤和首次运行 |
| [配置](./configuration.md) | 所有环境变量说明 |
| [提取模式](./extraction-modes.md) | `auto` / `ytdlp` / `browser` — 如何选择 |
| [云浏览器](./cloud-browsers.md) | Browserless、Browserbase、Steel 配置 |
| [Cookie](./cookies.md) | 需要登录或有年龄限制的内容 |
| [故障排查](./troubleshooting.md) | 常见错误及解决方法 |
| [架构](./architecture.md) | 代码结构和数据流 |

## 支持的平台

| 平台 | yt-dlp 路径 | 浏览器路径 |
|------|:-----------:|:----------:|
| YouTube | 支持 | 支持 |
| Bilibili | 支持 | 支持 |
| 通用 `<video>` 页面 | 部分支持 | 支持 |

## 两种提取路径

```
视频 URL
    |
    v
[阶段 1] yt-dlp + FFmpeg ---- 成功 ----> 视觉 AI -> 摘要
    |
    | 失败
    v
[阶段 2] 浏览器 (Playwright) ---- 成功 ----> 视觉 AI -> 摘要
```

阶段 1 仅需要 **yt-dlp** 和 **FFmpeg** — 无需浏览器，无需 Chromium。
阶段 2 需要 **playwright-core**（可选依赖）+ Chromium 或云浏览器。

你可以通过 `VIDEO_VISION_MODE` 锁定提取路径。参见[提取模式](./extraction-modes.md)。
