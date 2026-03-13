---
title: "ZzFX Studio"
description: "An algorithmic 4-channel chiptune tracker that generates complete retro game music in milliseconds using pure math — no samples, no AI, no network calls."
tags: [typescript, algorithmic-music, audio, chiptune, game-jam, retro, tracker, zzfx, zzfxm]
status: active
hero: /projects/zzfx-studio.gif
links:
  repo: https://github.com/thejustinwalsh/zzfx-studio
  live: https://tjw.dev/zzfx-studio/
  discord: https://discord.gg/eRWuk7W4tY

---

ZzFX Studio is an algorithmic music generator and tracker built for game jam developers who need retro audio immediately. Click a button and it produces a complete 4-channel chiptune song — lead, harmony, bass, and drums — in under 10 milliseconds. All synthesis runs through ZzFX and ZzFXM, tiny JavaScript audio engines that together weigh about 1KB. No samples are loaded, no network calls are made, and the entire thing works offline. Five vibe templates (Adventure, Battle, Dungeon, Title Screen, Boss) control density, BPM range, preferred scales, and effect probability, giving each generated song a distinct character from the start.

The generation engine is built on real music theory, not randomness. Drums are laid down first using kick templates and probability-weighted snare patterns. Bass lines follow Euclidean rhythm timing with scale-constrained note pools. Melody uses a constrained random walk with motif repetition so the result actually sounds composed. Harmony fills gaps reactively with arpeggiated chord tones. All melodic content locks to the selected key and scale. If one channel isn't working for you, regenerate just that layer while keeping the rest.

The app runs as a PWA with offline support and as a native desktop window via Neutralino.js on macOS, Linux, and Windows. Songs export as ESM code snippets, `.js` files, or rendered `.wav` audio. The export format includes a metadata comment that enables lossless re-import, so songs can be shared, modified, and round-tripped without losing the generative data behind them. It is built on React Native Web with React Native Skia handling the oscilloscope and ADSR visualizations.
