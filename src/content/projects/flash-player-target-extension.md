---
title: "Flash Player Target Extension"
description: "Adobe Flash CS6 extension that patches the Publish Settings dialog to expose Flash Player 11.5, 11.6, and 11.7 as compile targets."
tags: []
status: completed
links:
  repo: https://github.com/thejustinwalsh/flash-player-target-extension
  discord: https://discord.gg/k2XbQmUSBs

---

Flash Professional CS6 shipped without support for the newest Flash Player runtime versions — a frustrating gap for developers who needed to publish SWFs targeting Player 11.5, 11.6, or 11.7. This extension closes that gap by patching the Publish Settings dialog to list those versions in the Target dropdown, exactly where you'd expect to find them.

Installing it is dead simple: drop the `.zxp` file into Adobe Extension Manager and it wires itself into CS6's UI. From that point forward, newer player targets appear alongside the originals without any workflow disruption. The extension was distributed through Adobe Exchange and scratched a very specific itch for Flash developers stuck on CS6 during the transition period.

It's a small, precise tool from 2012 — a relic of the Flash era — but a good example of the kind of surgical developer-tooling fix that makes a daily workflow bearable. The source is MIT-licensed and published for anyone who still maintains legacy AS3 codebases.
