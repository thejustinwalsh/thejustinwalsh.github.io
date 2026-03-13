---
title: "Heaps iOS"
description: "A working example of the Heaps game engine running on iOS, bridging Haxe's HashLink runtime to Apple's mobile platform."
tags: [haxe]
status: completed
hero: /placeholder-project.svg
links:
  repo: https://github.com/thejustinwalsh/heaps-ios
  discord: https://discord.gg/9n4TQswb9K

---

Heaps is a high-performance Haxe game engine that targets multiple backends — but getting it running on iOS requires navigating the HashLink native runtime, Xcode's build system, and platform-specific audio and rendering constraints all at once. This project is a complete, buildable example that shows exactly how to pull it off, using the official Base2D Heaps sample as the reference application.

The repository includes a bootstrap script to fetch dependencies, pinned versions of the full Haxe and HashLink toolchain, and working build scripts for packaging to iOS. It targets the `h2d` layer specifically — Heaps' 2D rendering stack — since the `h3d` path had some unresolved rendering issues on iOS at the time.

For any Haxe developer wanting to ship a 2D game or interactive experience to iPhone or iPad without switching to a different engine, this repo cuts weeks off the setup time. The key pain points — OpenAL EFX shimming, asset and pak scripting, lack of High DPI support — are all documented openly so you know exactly what to expect and where to customize.
