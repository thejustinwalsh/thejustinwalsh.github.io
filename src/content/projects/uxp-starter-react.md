---
title: "UXP Starter React"
description: "A production-ready starter template for building Adobe UXP plugins with React, TypeScript, and Adobe Spectrum components."
tags: [typescript, adobe, uxp, spectrum, react, jsx, tsx]
status: completed
hero: /placeholder-project.svg
links:
  repo: https://github.com/thejustinwalsh/uxp-starter-react
---

UXP Starter React is a complete project template for building plugins for Adobe Photoshop and Adobe XD using the Unified Extensibility Platform (UXP) — Adobe's modern replacement for the aging CEP/ExtendScript system. The starter configures React, TypeScript, and Adobe Spectrum components out of the box, with a build pipeline that handles both development watching and production bundling. An interactive setup script generates the required plugin manifest, so you spend your first session writing UI code rather than wrestling with configuration.

Adobe's UXP platform is powerful but underserved by tooling. Most developers start from scratch or from incomplete examples scattered across documentation pages. This starter exists to give that a clean entry point: a minimal but correct foundation with the right dependencies wired together, ready to load directly into Photoshop via the UXP DevTools CLI. It covers the patterns that come up immediately in real plugin work — component rendering, event handling, and the bridge between the plugin's JavaScript context and Photoshop's action system.
