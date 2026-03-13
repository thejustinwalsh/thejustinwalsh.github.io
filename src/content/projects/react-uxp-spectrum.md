---
title: "React UXP Spectrum"
description: "A complete set of React wrappers for Adobe's UXP Spectrum Web Components, taming the quirks of web-component-based UI inside Adobe plugin extensions."
tags: [typescript, adobe, uxp, spectrum, react]
status: completed
hero: /placeholder-project.svg
links:
  repo: https://github.com/thejustinwalsh/react-uxp-spectrum
  discord: https://discord.gg/qftZaETmbz

---

Building Adobe extensions with React and Spectrum should be straightforward — it isn't. Adobe's UXP platform uses Spectrum as a web-component library, and web components and React have a famously uncomfortable relationship. Event handling, property binding, and ref forwarding all require specific handling that the official React Spectrum package doesn't fully address for the UXP environment specifically.

React UXP Spectrum is a complete set of React component wrappers derived from Adobe's UXP Spectrum documentation. Each component encapsulates the oddities: property mapping, custom event normalization, and the platform-specific quirks that show up when Spectrum web components run inside Photoshop, Illustrator, or XD's plugin sandbox. The result is an API that feels like ordinary React — no raw web component wrangling, no mysterious event listeners.

The library grew directly out of real plugin work and tracks the UXP Spectrum docs closely. It's the kind of package that exists because the official tooling doesn't quite get you there, and every developer building UXP extensions with React was solving the same problems independently.
