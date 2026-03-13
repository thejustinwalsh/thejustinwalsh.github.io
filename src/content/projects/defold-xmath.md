---
title: "Defold xMath"
description: "A Defold native extension reimagining vmath with allocation-free vector and quaternion math for performance-critical game loops."
tags: [c++, defold, defold-native-extension, lua, game]
status: active
hero: /placeholder-project.svg
links:
  repo: https://github.com/thejustinwalsh/defold-xmath
  discord: https://discord.gg/qTM3aRaKqR

---

Defold xMath is a native extension for the Defold game engine that rethinks how vector and quaternion math works in Lua. The standard `vmath` library returns new objects from every operation, which means every `add`, `mul`, or `normalize` in your update loop quietly allocates heap memory. xMath sidesteps this entirely by taking the output variable as the first argument — write once, reuse every frame, zero garbage.

The extension targets game developers writing performance-sensitive Defold code: character controllers, physics integrations, particle systems, anything where per-frame math is on the hot path. Switching from `vmath` to xMath on even a modest update function can cut several allocations per tick, which translates directly to fewer GC pauses and more consistent frame times on constrained mobile hardware.

With 32 stars, the extension has found a real audience in the Defold community. The API mirrors `vmath` closely enough that migration is mechanical rather than architectural — swap the function prefix, flip the argument order, and keep moving. Under the hood it's a tight C++ native extension, which means the math lands as close to the metal as Defold allows from a Lua script.
