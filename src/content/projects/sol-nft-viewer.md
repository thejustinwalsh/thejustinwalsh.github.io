---
title: "Sol NFT Viewer"
description: "A fast, no-frills browser for viewing Solana NFT collections directly from the blockchain, built with Next.js."
tags: [typescript]
status: completed
hero: /placeholder-project.svg
links:
  repo: https://github.com/thejustinwalsh/sol-nft-viewer
  live: https://sol-nft-viewer.vercel.app  discord: https://discord.gg/EFexbnatcq

---

At the height of the Solana NFT boom, the tooling to simply look at what you owned was scattered and slow. Sol NFT Viewer cuts through the noise — connect your wallet address, and it fetches your on-chain NFT holdings directly from the Solana network and renders them cleanly. No marketplace overhead, no token-gating, just a straightforward view of what lives in your wallet.

Built on Next.js and deployed to Vercel, the app leans on Solana's JSON RPC API to pull token metadata and resolve off-chain assets. It's the kind of project that gets built because you need it yourself — a focused utility that does one thing well and ships fast. For developers exploring Solana's NFT metadata standards or building their own tooling, the source is a compact reference for how to query token accounts and resolve Metaplex metadata on-chain.
