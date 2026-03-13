---
title: "Jenkins Status App"
description: "A React Native multi-platform Jenkins dashboard that runs natively on Android, iOS, macOS, and Windows from a single TypeScript codebase."
tags: [typescript]
status: completed
hero: /placeholder-project.svg
links:
  repo: https://github.com/thejustinwalsh/jenkins-status-app
  discord: https://discord.gg/gfDy2VHu37

---

Jenkins Status App is a native dashboard for Jenkins CI that runs on all four major platforms — Android, iOS, macOS, and Windows — from a single React Native TypeScript codebase. Using React Native's desktop support via Microsoft's React Native Windows and macOS targets, it delivers a proper native app experience regardless of which operating system your team uses to monitor builds.

The app is designed around the daily workflow of a developer who cares about CI status without wanting to keep a browser tab open to Jenkins all day. It exposes build status, project listings, and quick actions in a compact, always-accessible native window, with planned per-server credential management stored securely in the system keychain.

The project also serves as an opinionated React Native multi-platform template — it ships with Tamagui for UI, Reactotron for debugging, and a well-structured `src/` layout including navigation, screens, hooks, and context providers. Starting a new cross-platform React Native app from this base means skipping the usual boilerplate archaeology and getting straight to building product.
