---
title: "React Defold"
description: "React components and a bidirectional message-passing bridge for embedding Defold game engine builds in web applications."
tags: [typescript, react, defold]
status: completed
hero: /placeholder-project.svg
links:
  repo: https://github.com/thejustinwalsh/react-defold
  live: https://tjw.dev/react-defold/
  discord: https://discord.gg/9XV8pDbz4H

---

Defold's HTML5 export can run in a browser, but wiring it into a React application — handling the canvas lifecycle, loading the dmloader script, and getting data flowing in both directions — is more work than it should be. React Defold wraps all of that into a set of composable components.

The `DefoldApp` component handles canvas creation, dmloader initialization, and application instantiation from a single JSX element. Drop it anywhere in your React tree with a `root` path, an `app` name, and dimensions, and the game loads. The companion `DefoldAppContextProvider` and `useDefoldAppContext` hook layer in a message queue for bidirectional communication: React can send commands to Defold, Defold can send events back, and both sides stay in sync through a simple `tick()` pattern that Defold polls from its `update()` function.

The bridge uses a window-namespaced queue rather than any proprietary runtime coupling, which keeps the Defold side minimal — just standard `html5.run()` calls with JSON-encoded payloads. For developers building hybrid experiences where a Defold game lives inside a React UI — custom overlays, leaderboards, storefronts, or tool integrations — this package removes the boilerplate and lets both sides speak naturally to each other.
