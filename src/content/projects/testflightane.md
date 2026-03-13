---
title: "TestFlightANE"
description: "An Adobe AIR Native Extension that wraps the TestFlight SDK for iOS, bringing beta testing and crash reporting to AIR-based mobile apps."
tags: [objective-c]
status: archived
hero: /placeholder-project.svg
links:
  repo: https://github.com/thejustinwalsh/TestFlightANE
---

Before Apple acquired TestFlight and baked it into Xcode, TestFlight was the go-to external service for iOS beta distribution and over-the-air crash reporting. For Adobe AIR developers, though, integrating native SDKs meant writing a Native Extension — a thin Objective-C bridge that translates ActionScript calls into native API calls. TestFlightANE is exactly that bridge, keeping the API surface as faithful to the original Objective-C SDK as an ANE can.

The extension's design goal was zero-friction adoption: every static method in the `TestFlight` Objective-C class maps to a matching static method in the `com.thejustinwalsh.ane.TestFlight` ActionScript class. Initializing the SDK, logging checkpoints, capturing feedback, and binding sessions to device identifiers all work the same way they did in native iOS code — you just call them from ActionScript. The one genuinely tricky part was the deprecated `uniqueIdentifier` call: Apple was already flagging it for App Store rejection, so the README flags exactly which code to comment out for release builds.

Built with the same Ruby rake system as ServerSocketANE, the extension targets the iOS SDK through Xcode and bundles cleanly into a `.ane` file for distribution. It's a time capsule of the ANE era — before TestFlight became part of the platform itself — and a reminder of how much foundational plumbing developers used to build from scratch.
