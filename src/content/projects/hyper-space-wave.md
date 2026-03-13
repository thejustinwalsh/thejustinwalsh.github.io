---
title: "Hyper Space Wave"
description: "A cross-platform wave-based shoot-em-up prototype built as a TypeScript monorepo targeting both web and mobile with shared game logic."
tags: [typescript, expo, pixijs, react, koota]
status: active
links:
  repo: https://github.com/thejustinwalsh/hyper-space-wave
  discord: https://discord.gg/8JvV8zrkzM

---

Hyper Space Wave is a wave-based shoot-em-up prototype that targets web and native mobile from a single TypeScript codebase. The monorepo splits into two app clients — a Vite-powered web client using React and PixiJS for rendering, and an Expo React Native client for iOS and Android — with all core game logic, ECS, and rendering hooks living in a shared `packages/core` library that neither client duplicates.

The game's architecture is built around Koota, an Entity Component System library for React, which keeps game state and rendering logic cleanly separated even as the visual layer runs on PixiJS's WebGL renderer. A custom Leva plugin package extends the developer UI with game-specific controls, making it easy to tune wave parameters in real time without touching source code.

Under active development, the project is exploring data-driven wave design: tuning tables defined in JSON with math expression support, editable live through a virtualized Leva table editor with Zod validation. It's an experiment in how far you can push React and ECS patterns as a game architecture before you need to reach for something more purpose-built.
