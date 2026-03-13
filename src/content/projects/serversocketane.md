---
title: "ServerSocketANE"
description: "An Adobe AIR Native Extension that unlocks server socket functionality on iOS, filling a critical gap Adobe left in the mobile AIR SDK."
tags: [c]
status: archived
hero: /placeholder-project.svg
links:
  repo: https://github.com/thejustinwalsh/ServerSocketANE
  discord: https://discord.gg/qy6DkkQdJk

---

Adobe AIR gave Flash developers a path to mobile, but it shipped with a notable omission: the `ServerSocket` class simply didn't work on iOS. For developers building multiplayer games, local network tools, or any peer-to-peer communication on top of AIR, that was a hard wall. ServerSocketANE tears it down by implementing the missing API as a native Objective-C extension, exposing a package path — `com.thejustinwalsh.net.ServerSocket` — that maps directly onto the familiar `flash.net` API shape.

The extension was built for ActionScript developers who wanted to ship real networked applications to iOS without abandoning the AIR ecosystem. Drop-in compatibility was the design goal: if your code already used `flash.net.ServerSocket`, switching to the ANE required changing little more than the import. The underlying implementation handles buffering automatically, flushing data every 512 bytes and exposing a `flush()` call for explicit control — a practical detail that prevents silent data loss in tight send loops.

Built with a Ruby rake-based build system that targets the iOS SDK via Xcode, ServerSocketANE reflects an era when the ANE ecosystem was the only way to push AIR past Adobe's platform abstractions. It's archived now, but it remains a clean example of how native extensions bridged the gap between cross-platform runtimes and the hardware beneath them.
