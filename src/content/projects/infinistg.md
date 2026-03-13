---
title: "InfiniSTG"
description: "A browser-based shoot-em-up built for React Jam Spring 2024 using Pixi React for rendering and Zustand for game state."
tags: [typescript]
status: completed
hero: /placeholder-project.svg
links:
  repo: https://github.com/thejustinwalsh/infinistg
  live: https://thejustinwalsh.com/infinistg/
  discord: https://discord.gg/e3hnKqZpeA

---

InfiniSTG is a shoot-em-up (STG) built in 72 hours for React Jam Spring 2024 — a game jam that challenges developers to build games using React as the primary technology. The result is a fully playable vertical shooter that runs in the browser, using Pixi React to drive a WebGL renderer from within the React component tree and Zustand to manage all game state across systems.

The entire game was assembled from carefully selected open tools: LDtk for level editing, ZzFX for procedurally generated sound effects, Kenney's pixel art assets for ships and environments, and a community starfield for the scrolling space backdrop. A VSCode texture packer extension handled sprite atlas generation directly from the editor.

Pushing React to do something it wasn't designed for is the point. Managing bullets, enemies, collision, and player input through React state and effects is a deliberately unconventional choice — and exploring where that abstraction holds up and where it cracks under real-time game loop pressure is what makes InfiniSTG an interesting engineering artifact, not just a jam entry.
