---
title: "libBulletML"
description: "A modernized fork of libBulletML that strips Boost dependencies and upgrades the codebase to contemporary C++ standards."
tags: [c++]
status: completed
hero: /placeholder-project.svg
links:
  repo: https://github.com/thejustinwalsh/libbulletml  discord: https://discord.gg/v3YGkzhB5g

---

BulletML is the declarative XML-based language invented by Kenta Cho for describing bullet patterns in shoot-em-up games. libBulletML is the canonical C++ parser for that format — but it was showing its age: Boost dependencies, `std::auto_ptr` everywhere, and no modern build system. This fork fixes that.

The goal was surgical: modernize the build and language-level choices without rewiring the core library behavior. `std::auto_ptr` is gone, replaced throughout with `std::unique_ptr`. The Boost dependency has been removed entirely. Project file generation now uses [premake](https://premake.github.io), producing ready-to-build solutions for Visual Studio, MSYS2, macOS, and Linux from a single script. A GoogleTest suite is included for anyone who wants to verify correctness after changes.

What makes this fork practically useful is its license hygiene. The original carried GPL restrictions that complicated commercial or indie game use. This version is clean. For developers building bullet hell or danmaku-style games in C++ who want a solid, dependency-light BulletML parser they can actually ship, this is the version to use.
