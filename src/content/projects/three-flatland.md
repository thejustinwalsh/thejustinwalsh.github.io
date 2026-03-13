---
title: "Three Flatland"
description: "A WebGPU-native 2D rendering library for Three.js with composable TSL shaders, automatic batching, and first-class React Three Fiber support."
tags: [typescript, 2d, graphics, r3f, react-three-fiber, three-js, threejs, tsl, webgpu]
status: active
hero: /projects/three-flatland.png
links:
  repo: https://github.com/thejustinwalsh/three-flatland
---

Three Flatland is a high-performance 2D rendering library for Three.js built from the ground up for WebGPU. Rather than retrofitting legacy techniques, it uses TSL (Three Shader Language) as its native shader authoring format — meaning every sprite, tilemap, and visual effect is expressed as a composable shader graph that runs efficiently on both WebGPU and WebGL backends. Sprites sharing a material batch automatically into single draw calls, and the scene graph separates transform hierarchy from render order through an independent layer and zIndex system.

The library is built for web game developers and creative coders who want GPU-driven 2D without abandoning the Three.js ecosystem. It ships with first-class React Three Fiber integration via `three-flatland/react`, making it a natural fit for teams already working in R3F. Tilemap support covers both Tiled and LDtk editor formats, including animated tiles, so existing level pipelines can plug straight in.

What sets Three Flatland apart is its library of over 50 composable TSL shader nodes — tint, outline, dissolve, CRT scanlines, palette swap, and more — all stackable without writing a line of shader code. The animation system is spritesheet-driven with frame-perfect timing and callbacks. The entire package is tree-shakeable, so you only pay for what you import. It's early alpha, but the foundation is already ambitious: a 2D renderer for the web that takes WebGPU seriously.
