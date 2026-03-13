---
title: "Deque"
description: "A work-in-progress desktop todo app built on Tauri, exploring a full-stack Rust backend paired with a React frontend."
tags: [typescript, react, rust, tauri-app, rspc, prisma-client-rust, prisma, react-query]
status: completed
hero: /placeholder-project.svg
links:
  repo: https://github.com/thejustinwalsh/deque
  discord: https://discord.gg/u8cMKpWEJN

---

Deque is a desktop todo application built on Tauri that serves as a playground for modern Rust-native desktop development. The stack pairs a React frontend with a full Rust backend wired together through rspc — a tRPC-inspired type-safe RPC layer for Tauri — giving the app end-to-end type safety from the Rust data layer all the way up to React Query hooks in the UI. Prisma Client Rust handles database access, keeping schema and query logic in one place without sacrificing the performance characteristics of a native backend.

The project targets developers curious about what a truly native Tauri application looks like when you push the Rust side further than the typical "shell command wrapper" pattern. Rspc brings the ergonomics of TypeScript's tRPC to cross-language Tauri development, and Prisma Client Rust means the database schema drives both the Rust types and the query API — a pattern that translates the best parts of the full-stack TypeScript experience into a Rust-native context.

Deque is an honest work in progress, built to explore a compelling architecture rather than ship a finished product. As a technical experiment it covers a lot of ground — Tauri's multi-process model, type-safe RPC across a language boundary, Rust-native ORM, and React Query's data synchronization — making the repository a useful reference for anyone assembling a similar stack from scratch.
