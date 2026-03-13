---
title: "AirEJDB"
description: "An Adobe AIR Native Extension that brings EJDB's fast MongoDB-style document storage to iOS, Mac, and Windows."
tags: [c++]
status: archived
hero: /placeholder-project.svg
links:
  repo: https://github.com/thejustinwalsh/airejdb
---

AirEJDB is an Adobe AIR Native Extension (ANE) that bridges EJDB — a fast, MongoDB-inspired embedded document database — into the AIR runtime across iOS, Mac OS X, and Windows. Before mobile backends were commoditized, embedding a capable document store directly into an AIR application was a real engineering challenge, and this extension made it practical with a clean ActionScript 3 API.

The extension targets Flash and AIR developers who needed persistent, queryable structured data without a remote server. EJDB's query semantics map closely to MongoDB, so developers already familiar with that paradigm could save, query, and iterate collections of objects with minimal friction. A cursor-based API handles result iteration, and the underlying engine uses Tokyo Cabinet for storage, keeping the footprint small and the performance solid.

Building a multiplatform ANE in 2013 meant wrangling Xcode, the iOS SDK, and a Windows MSVC solution under Parallels simultaneously — then packaging everything with a Ruby Rake build system. It was the kind of cross-platform yak-shaving that shaped a deep respect for build tooling. Archived now, but a time capsule of what native mobile data persistence looked like before SQLite wrappers and cloud sync made the problem disappear.
