---
title: "ts-defold/create"
description: "One-command project scaffolding for Defold games written in TypeScript, with a community template registry and zero manual setup."
tags: [typescript, game-development, defold, lua, defold-game]
status: completed
hero: ../../assets/projects/ts-defold-create.png
links:
  repo: https://github.com/ts-defold/create
  live: https://ts-defold.dev
  discord: https://discord.gg/4cKcC9AyPw

---

`ts-defold/create` is the official project generator for the ts-defold ecosystem — a single command that scaffolds a fully configured Defold game project with TypeScript support ready to go. Running `npm init @ts-defold <project-directory>` pulls down a template, wires up the TypeScript toolchain, and drops you into a working game project in seconds. No manual config, no hunting down type definitions, no fighting with the build pipeline.

The template system is where it gets genuinely useful. By default the CLI searches GitHub for any repository matching the `tsd-template-*` naming convention, so the community can publish templates that are instantly discoverable. Point it at a war battles starter, a platformer boilerplate, or your own company's internal scaffold — or supply a local zip archive or remote URL if you need something completely custom.

This tool is the entry point for the broader ts-defold project, which brings full TypeScript authoring to the Defold game engine. Defold uses Lua natively, and ts-defold transpiles TypeScript to Lua while generating type-safe bindings for the entire Defold API. The `create` CLI is the handshake between that ecosystem and developers who just want to start building.
