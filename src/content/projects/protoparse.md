---
title: "protoparse"
description: "A TypeScript library that parses Protocol Buffer text format documents into plain JSON objects."
tags: [typescript]
status: completed
hero: /placeholder-project.svg
links:
  repo: https://github.com/thejustinwalsh/protoparse
  discord: https://discord.gg/4xFv7VjvCX

---

Protocol Buffers have two serialization formats: the compact binary encoding most tools use, and a human-readable text format that shows up in config files, debug output, and data pipelines. The text format is well-specified but parsers for it are rare in the JavaScript ecosystem. protoparse fills that gap.

The library takes a protobuf text format document — the kind you'd find in a `.pbtxt` file or embedded in toolchain output — and converts it to a plain JavaScript object you can work with like any other JSON. No `.proto` schema file required, no binary decoding, no protobuf runtime. Just text in, object out.

It was built as a proof of concept to validate the parsing approach, and the scope stays intentionally narrow. If you're working with build systems, ML pipelines, or any toolchain that emits protobuf text format and need to process that data in TypeScript or Node, protoparse provides a lightweight path to doing so without pulling in a full protobuf runtime.
