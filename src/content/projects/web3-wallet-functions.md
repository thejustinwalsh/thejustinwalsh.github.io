---
title: "Web3 Wallet Functions"
description: "A lightweight TypeScript server that proxies the Zerion Wallet API with open CORS headers, built for rapid prototyping and Expo Snack demos."
tags: [typescript]
status: completed
hero: /placeholder-project.svg
links:
  repo: https://github.com/thejustinwalsh/web3-wallet-functions  discord: https://discord.gg/9GjKYTrUvY

---

Web3 Wallet Functions is a small TypeScript API server that wraps the Zerion Wallet API and exposes it behind a deliberately permissive CORS policy. Point it at any wallet address and it returns portfolio data — token balances, positions, transaction history — in a format that frontend and mobile demos can consume without fighting with browser security restrictions or setting up backend infrastructure.

The whole point of this project is speed of exploration. When you want to prototype a Web3 interface in an Expo Snack or test a wallet visualization concept in a CodeSandbox, you need a working API endpoint in minutes, not hours. This server provides that: configure your Zerion API key in a `.env` file, run `npm start`, and you have a working proxy that any client on any domain can query. It is explicitly not production infrastructure — the README says as much — but for the use case it targets, that tradeoff is exactly right.
