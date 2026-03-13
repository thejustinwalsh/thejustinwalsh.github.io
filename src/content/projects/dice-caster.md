---
title: "Dice Caster"
description: "A hosted dice rolling API with standard notation support and statistically sound distribution, built on TypeScript and Redis."
tags: [typescript]
status: completed
hero: /placeholder-project.svg
links:
  repo: https://github.com/thejustinwalsh/dice-caster  discord: https://discord.gg/fK9zChkMBx

---

Dice Caster is a lightweight REST API for rolling dice using standard tabletop notation — the same `XdY+Z` format any TTRPG player knows by heart. Hit `/api/roll/3d6` and get back each die result alongside the total, with an optional modifier baked right into the URL path. No query strings, no request bodies, just clean RESTful semantics for a universally understood mechanic.

The project is built with TypeScript and backed by Upstash Redis, giving it a serverless-friendly foundation that scales to zero when idle. It's aimed at game developers, Discord bot authors, or anyone building tabletop tooling who needs a reliable, hosted randomness endpoint rather than rolling their own (pun intended).

What sets it apart is its attention to distribution quality. Many naive dice-rolling implementations lean on JavaScript's `Math.random()` without consideration for statistical properties, but Dice Caster treats correct distribution as a first-class concern — making it actually trustworthy for games where probability matters.
