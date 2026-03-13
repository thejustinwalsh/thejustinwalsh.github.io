---
title: "Untile"
description: "A .NET CLI tool that splits packed tilesheet images into individual tile files, given a target tile size."
tags: [c#]
status: completed
hero: /placeholder-project.svg
links:
  repo: https://github.com/thejustinwalsh/Untile  discord: https://discord.gg/UXgct3xNDQ

---

Untile is a .NET command-line tool that takes a packed tilesheet image — the kind that ships with nearly every 2D game asset pack — and slices it into individual tile files. You point it at an input image, specify a tile size like `16x16`, and it writes each extracted tile to an output directory. That's the whole pitch: a focused, single-purpose tool that does exactly one thing without ceremony.

For game developers and artists working with tile-based workflows, this kind of extraction utility fills a quiet but persistent gap. Asset packs rarely ship pre-sliced, and manually exporting tiles from a 256x256 sheet in an image editor is exactly the kind of tedious work that a twenty-line .NET tool should handle instead. Untile is built on `dotnet run` with a clean options interface and no unnecessary dependencies.
