---
title: "sh-raylib"
description: "Experimental raylib bindings for Static Hermes that let you write real-time 2D games and visualizations in TypeScript with near-native performance."
tags: [c, cmake, raylib, shermes, hermes]
status: completed
hero: /placeholder-project.svg
links:
  repo: https://github.com/thejustinwalsh/sh-raylib  discord: https://discord.gg/SWW9KD66RY

---

Static Hermes is Meta's experimental ahead-of-time compiler for JavaScript that produces native machine code rather than bytecode. Raylib is the beloved C library for 2D and 3D game development that keeps things gloriously simple. Combining the two shouldn't work — and yet sh-raylib makes it happen, generating TypeScript-callable bindings for the entire raylib surface so you can write game loops in a typed, modern language and compile them down to native binaries.

The bindings are auto-generated using `ffigen`, a tool from the Hermes project that leverages CastXML to parse C headers and emit extern declarations. Where raylib functions return structs — a pattern C handles naturally but foreign function interfaces typically choke on — the project generates cwrap shims that convert return values into out-parameters, sidestepping the ABI mismatch entirely. The result is a CMake build pipeline that produces both a TypeScript game binary and a reference pure-C binary side by side, making it straightforward to benchmark and compare the two.

The included BunnyMark demo — a classic 2D stress test of thousands of bouncing sprites — demonstrates that TypeScript compiled with Static Hermes can stay competitive with equivalent C code in a tight render loop. That's the provocative idea at the heart of this project: that JavaScript's era as a performance-constrained scripting language might genuinely be ending, and game development could be next to feel it.
