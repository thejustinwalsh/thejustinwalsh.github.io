---
title: Meat Loop
description: How I actually run a long agent loop, and why the human standing next to it is the part that makes it work.
date: 2026-08-29
tags:
  - agentic
  - workflow
  - process
  - meta
ogImage: /side-piece/og.png
draft: true
---

One line goes into every long-running agent task now:

> [!note]
> Any new steer goes into the task queue while you keep working. Any question gets answered while you keep working.

Before that line I was an interrupt. Every correction meant stopping the agent, saying the thing, waiting for it to build momentum back — so I batched corrections and let the small stuff ride until I had enough to justify the stop. Half of it never got said, and what did get said landed after the agent had already built on the mistake. Now it runs and I feed it. A note goes into the queue instead of derailing whatever is in flight.

That inversion is the workflow. I call it the meat loop because the loop closes through a person, and the person is me.

## What starts it

The loop needs a real seed: a spec, a plan, a bug list, a description good enough that the agent can tell when it's done. I set a `/goal` in codex and hand it the whole thing — work the list, write the tests, verify it in the browser with live probes, check for visual regressions.

Those last clauses carry more than they look like they do. An agent that can only see its own diff will tell you the work is finished while the page fails to render. Give it a way to observe the thing it just built and "done" starts meaning something.

## Read the reasoning, not the summary

A summary is written after the fact and compressed to fit. That makes it cryptic, and cryptic is indistinguishable from correct when you're skimming. So I expand the reasoning and read the thinking that led to the conclusion.

That's where a misinterpretation is visible. The summary tells you it updated the layout to match the design. The reasoning tells you it decided a spacing token looked wrong and changed it on the way past.

It costs less than it sounds like. I'm not auditing the diff line by line, I'm watching for the moment the agent talks itself into something. That moment reads fast, and it reads long before the code does.

When I catch one it goes in as a follow-up task while the context that produced it is still loaded. Not a stop. Not a correction shouted over the top of the work. A task, in the queue, like everything else.

This one habit is most of the difference between a loop that produces good work and a loop that produces a lot of work.

## Nonsense is a tell

Every so often the agent posts something that reads off. A status message that doesn't match what it should be doing, a claim with no basis, confidence that arrived from nowhere.

I don't steer on that yet. I ask for detail first. Usually it comes back fine, the message was badly compressed, and I've lost a turn. When it doesn't come back fine, the detail is where the problem lives, and I'm correcting a specific thing instead of guessing at it. Asking is cheap. Steering on a bad guess puts a wrong instruction into a context that will keep honoring it.

## Keeping the stack full

I keep the repo open in my own editor while the loop runs, and I read the parts it isn't touching.

This is the part I'm most likely to skip, and skipping it is what starves the queue. While the agent works through what's in scope, I audit the surfaces next door and add what I find to the stack. The additions come from reading code rather than searching it. I'm not grepping for a symbol. I'm noticing that a module got away from me.

Which means the loop only stays fed while I'm actually loaded on it. When I come back from being away, I ask for a status update before anything else, read it properly, then re-steer. Leave when it's pointed the right way, come back with a question. What doesn't work is being gone and then not reading what happened while I was.

## Context is what you're actually managing

New tasks stay adjacent to the work already in the context. The value of a long session is everything the agent has accumulated — the file layout, the conventions, the reasoning behind the last several decisions — and adjacent work gets all of it for free. Work that isn't adjacent pays to rebuild it, and pays again in the room it takes up.

So anything that isn't adjacent goes out to a subagent. An unrelated corner of the codebase with a few loose touch points gets a narrow brief and hands back a result, and the long-running context never loads a second mental model it won't need again.

The same instinct is why I built [side-piece](https://tjw.dev/side-piece). It connects the agent CLIs, so sol can hand a diff to opus for an adversarial review, or either of them can hand it to an opencode model, while I keep building. The review runs in the background against an isolated worktree and comes back as a result. A model that didn't write the code isn't reviewing its own reasoning, and it costs the main context nothing.

## When to eject

After a few compactions I can tell which way a session is going. Either the quality is holding, or the agent is struggling: repeating work it already did, needing three passes to land one change, losing conventions it had a moment ago.

Then it's save or eject. Saving means re-grounding hard — restating the goal, clearing everything stale out of the queue. Ejecting means taking the code where it stands, writing a fresh plan against it, and starting clean.

I eject sooner than feels comfortable. The pull is to salvage the session I've already invested in, and that's the instinct that costs me. A degrading loop spends an hour producing work I throw away, and the fresh plan costs ten minutes I owed the project already.

## There is no graph

That's the whole thing. One agent, one long context, a queue that takes interruptions without stopping, another model on the side for the reviews I don't want it grading itself on, subagents for the unrelated work, and me reading the parts nobody assigned.

No orchestration framework, nothing to install. What it asks for is attention in specific places: the reasoning trace, the odd message, the code nobody is looking at. The software factory, such as it is, is a person paying attention.
