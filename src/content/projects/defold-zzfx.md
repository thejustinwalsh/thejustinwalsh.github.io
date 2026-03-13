---
title: "Defold ZzFX"
description: "A Defold native extension porting the ZzFX procedural sound synthesizer for in-engine audio generation without asset files."
tags: [c++, defold, defold-native-extension, lua, game]
status: completed
hero: /placeholder-project.svg
links:
  repo: https://github.com/thejustinwalsh/defold-zzfx
  live: https://tjw.dev/defold-zzfx/
  discord: https://discord.gg/8wXAZgb2ft

---

Defold ZzFX brings the ZzFX "Zuper Zmall Zound Zynth" into the Defold game engine as a native extension. ZzFX is a procedural audio synthesizer originally created for JavaScript game jams — it generates sound effects entirely from a compact array of numeric parameters, no audio assets required. This port takes that same idea and packages it as a Defold dependency, letting Lua scripts trigger synthesized sounds with the same parameter arrays you'd design in the ZzFX Sound Designer tool.

For Defold developers building small games, game jam entries, or prototypes, this extension removes one of the more tedious parts of the pipeline: sourcing, converting, and bundling audio files. Sound effects become code — a single line of numbers that can be tweaked in the designer, pasted into a script, and played instantly. The extension supports up to 32 unique sounds with 32 simultaneous instances each, which covers the needs of most compact games comfortably.

The implementation is a faithful C++ port of ZzFX's core synthesis and soundboard logic, wrapped in Defold's native extension API. Plugging it into a project is a one-line dependency addition to `game.project`, and the Lua API is designed for direct compatibility with ZzFX Sound Designer exports — copy the parameter array, call `zzfx.play`, done.
