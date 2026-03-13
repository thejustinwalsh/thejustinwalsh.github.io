---
title: "Self Hosted"
description: "Infrastructure configuration for self-hosted services on TrueNAS, routed through a Cloudflare Tunnel with zero open ports on the home network."
tags: [shell]
status: active
hero: /projects/self-hosted.png
links:
  repo: https://github.com/thejustinwalsh/self-hosted  discord: https://discord.gg/6kbT9F8Pcs

---

Running your own infrastructure at home means solving two hard problems at once: keeping services reachable from the internet without exposing your home network, and managing a growing catalog of containers without it becoming a configuration nightmare. This repo is the living solution to both.

All public traffic enters through a single Cloudflare Tunnel — no ports open on the router, no public IP exposed. The tunnel terminates at a gateway container running nginx alongside the cloudflared daemon in one image, deployed on TrueNAS SCALE. The gateway routes requests by hostname and enforces per-service path allowlists; anything not explicitly permitted returns a 404. Backend services run from the TrueNAS app catalog on a shared Docker network, accessible only on the local network and never directly through the tunnel.

The architecture is intentional in its constraints. One tunnel, one gateway image, explicit allowlists for every service. The security surface stays small by design: admin interfaces for backend services are LAN-only, and adding a new service means writing the hostname and path rules, not opening another firewall hole. Renovate keeps dependencies current automatically, making the maintenance overhead of self-hosting feel manageable rather than constant.
