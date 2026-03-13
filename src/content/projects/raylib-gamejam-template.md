---
title: "raylib Game Jam Template"
description: "A zero-friction CMake template for raylib C++ game jam entries with GitHub Actions CI for both desktop and web builds."
tags: [c++, raylib, raylib-cpp, template]
status: completed
hero: /placeholder-project.svg
links:
  repo: https://github.com/thejustinwalsh/raylib-gamejam-template  discord: https://discord.gg/TghrHjFsej

---

Game jams live and die on setup time. This template exists so you can hit the green "Use this template" button on Friday night and be writing gameplay code within minutes — not wrestling with CMake, Emscripten, or CI configuration.

The template ships with a CMake build system configured for both native desktop and WebAssembly targets via Emscripten, automatic resource copying and bundling, a complete VSCode workspace with extension recommendations, and GitHub Actions workflows that build and verify both targets on every push. Desktop builds just work. Web builds use `emrun` to serve the game locally. Resources in `./resources` are picked up automatically.

Built on top of the raylib-cpp examples by Rob Loach, the template trims the noise and focuses on what a jam entrant actually needs: get to a running game fast, iterate without friction, and ship something that runs in a browser when the deadline hits. For anyone who reaches for raylib when a jam drops, this is the starting point.
