---
title: "Tubetape"
description: "A native desktop app for extracting audio from YouTube, slicing precise samples with BPM detection, and building a local library — no yt-dlp installation required."
tags: [typescript, audio-editing, beats, music-production, react, rust, tauri, youtube-downloader]
status: active
hero: /projects/tubetape.png
links:
  repo: https://github.com/thejustinwalsh/tubetape
---

Tubetape is a desktop application for music producers and beat makers who want to pull audio from YouTube and turn it into clean, precisely cut samples. Paste a URL, and the app extracts the audio track and renders a full waveform visualization. From there you click and drag to define sample regions with DAW-level accuracy — start point, end point, loop settings — and export them directly to your filesystem. BPM detection runs automatically via aubio so you know what you're working with before you commit a cut.

The technical design is what makes it interesting. Rather than shipping yt-dlp as a native dependency users have to install themselves, Tubetape runs yt-dlp inside Pyodide — Python compiled to WebAssembly — so the entire extraction pipeline lives inside the app bundle. HTTP requests route through a Rust layer to sidestep CORS, JavaScript challenges are solved in a sandboxed iframe, and FFmpeg is bundled as a dylib loaded via `dlopen` at runtime. The result is a zero-dependency install experience despite a genuinely complex audio pipeline underneath.

The app is built with Tauri v2, React 19, and Rust, targeting macOS, Linux, and Windows. Audio metadata and cached tracks persist locally in IndexedDB, so previously fetched sources load instantly on return visits. It is an MVP in active development, but the core extraction and sampling workflow is already functional and fast.
