---
title: "Brew Keeper"
description: "An Oh My Zsh plugin that silently keeps your curated Homebrew packages current via a native macOS LaunchAgent."
tags: [shell]
status: active
links:
  repo: https://github.com/thejustinwalsh/brew-keeper
  discord: https://discord.gg/xj6ntUHxpN

---

Brew Keeper is an Oh My Zsh plugin that takes the manual chore out of keeping Homebrew packages current. On first load it compiles a small C agent binary and registers a native macOS LaunchAgent that runs daily at 9:00 AM — or whenever the machine next wakes if it was asleep. The package list lives in a plain text file and is managed through a handful of tight shell commands: add, remove, list, update, and log.

The target audience is developers with a handful of tools — CLIs, language runtimes, AI coding assistants — that need to stay current without constant babysitting. Rather than upgrading everything in your Homebrew installation, Brew Keeper tracks only the packages you explicitly opt in, giving you control without the noise of watching sixty unrelated formulae roll by.

The implementation is deliberately minimal: a compiled C binary for the actual upgrade work, a SHA-256–tracked LaunchAgent plist that only reinstalls when the template or environment changes, and a clean shell interface that stays out of the way. It handles both formulae and casks, validates package names before writing them to the list, and logs every run for easy auditing. Opinionated, fast, and built to disappear into the background of a busy development machine.
