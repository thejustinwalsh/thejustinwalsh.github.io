---
title: "CastleDB for Godot"
description: "A Godot 3 plugin that imports CastleDB files and generates typed GDScript for fully autocompleted static game data."
tags: [gdscript]
status: completed
hero: /placeholder-project.svg
links:
  repo: https://github.com/thejustinwalsh/castledb-godot  discord: https://discord.gg/sXQBsfxWRe

---

CastleDB for Godot is a plugin that turns CastleDB's structured `.cdb` files into first-class static data inside Godot 3 projects. Rather than parsing JSON at runtime or manually maintaining lookup dictionaries, the plugin's importer generates typed GDScript from your database the moment Godot processes the file — giving you immediate, autocompleted access to every sheet and row directly in the editor.

Game designers and developers using CastleDB to manage items, enemies, levels, or any structured game data can load that data into Godot without writing glue code. Unique identifier columns get hashed lookup tables for fast keyed access, and each sheet exposes an `all` array for iteration. The generated script is queryable, type-safe by convention, and reloads automatically as the source database changes.

With 68 stars, this plugin addressed a real gap in Godot's data pipeline tooling. CastleDB's tightly typed, spreadsheet-style editor pairs naturally with Godot's scene-driven workflow, and code generation was the right solution — it keeps the runtime lean while making the editor experience feel native. The plugin supports the core CastleDB types used in real projects: IDs, enumerations, booleans, ints, floats, colors, strings, files, and tiles.
