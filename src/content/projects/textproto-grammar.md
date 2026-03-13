---
title: "Textproto Grammar"
description: "Syntax Highlighting for the Protocol Buffer Text Format"
tags: [javascript, protobuf, protocol-buffers, textproto, syntax-highlighting, textproto-grammar, grammar, vscode-extension, pbtxt]
status: completed
hero: /projects/textproto-grammar.png
links:
  repo: https://github.com/thejustinwalsh/textproto-grammar
  live: https://marketplace.visualstudio.com/items?itemName=thejustinwalsh.textproto-grammer
  discord: https://discord.gg/DbURCnJ7Tp

---

Protocol Buffers are everywhere in production systems, but the text format — the human-readable `.textproto` and `.pbtxt` variant used for config files, test fixtures, and readable serialization — has always been a second-class citizen in editors. Textproto Grammar fixes that for VS Code, shipping a proper TextMate grammar that highlights field names, scalar values, string literals, nested message blocks, and enum identifiers with the precision the format deserves.

The extension handles the nuances that trip up simpler grammar approaches: single and double-quoted strings, deeply nested message structures, lenient field parsing, and the occasional proto-specific quirk. It also brings highlighting into fenced code blocks inside Markdown previews, so your `.md` documentation with embedded textproto samples finally looks right in the editor preview too.

A community contribution from [@marcusrbrown](https://github.com/marcusrbrown) brought extension bundling via Rollup, a full CI workflow, and automated publishing to the VS Code Marketplace — turning what started as a personal utility into a properly maintained open source extension. If you work with protobuf configs, ML model configs, or anything that serializes to the text format, this is the extension that makes VS Code feel like it actually knows what you're looking at.
