---
title: "React Concurrent Store"
description: "A ponyfill for React's upcoming concurrent stores API that lets you safely mutate state during non-blocking transitions today."
tags: [typescript, concurrent, experimental, feedback, ponyfill, react, store, usestore-hook]
status: active
hero: /placeholder-project.svg
links:
  repo: https://github.com/thejustinwalsh/react-concurrent-store
  live: https://tjw.dev/react-concurrent-store/
  discord: https://discord.gg/jFpJHbGSqJ

---

`useSyncExternalStore` is how React apps integrate with external state today — but the name says it all. It's synchronous. Mutate a store during a `useTransition` and React de-opts to a blocking update, throwing away the concurrency benefits you were trying to use. The React team has announced a new concurrent store API to fix this, but it isn't in a stable release yet.

This package is a ponyfill of that upcoming API, implemented entirely in user land. The `useStore` hook mirrors the planned `use(store)` interface: create a store with `createStore()`, pass it an optional reducer, and subscribe from any component. The hook handles caching, lifecycle management, and concurrent-safe updates — state changes during transitions stay non-blocking. Async stores work too: pass a `Promise` as the initial value and the hook integrates directly with Suspense via React's `use()` hook.

The explicit goal is to generate feedback on the upcoming API while making it useful today. The migration path is designed to be mechanical: swap the import from `react-use-store` to `react` and replace `useStore` with `use` once the feature ships. No experimental React builds required — the ponyfill runs on the current stable release.
