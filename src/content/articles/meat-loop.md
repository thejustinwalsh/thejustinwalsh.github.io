---
title: Meat Loop
description: The endless review agent loop I've been building with, and why I'm still the part that closes it.
date: 2026-08-29
tags:
  - agentic
  - workflow
  - process
  - meta
ogImage: /side-piece/og.png
draft: true
---

Everyone is writing about agent orchestration right now, and most of it arrives as a diagram: supervisors, routers, a graph of specialized workers passing artifacts between themselves. I read that stuff and recognize almost none of my actual week in it.

What I run is one long agent loop with me standing next to it, and I call it the meat loop because I'm the part that closes it. Codex does the typing while I do the steering, the smell test, and the call on whether any of it is still worth continuing.

## Starting it

A loop is only as good as the thing you point it at, so I start from something written down: a spec, a plan, a bug list, or at minimum a description detailed enough that the agent can tell when it is finished. Something like "fix the review comments" leaves it guessing where the finish line sits, and it will guess generously.

Then I set a `/goal` in codex and hand over the whole thing. Fix the review findings, write the tests, verify it in a browser with live probes, check for visual regressions. That last one earns its place, because an agent that can only see its own diff will happily declare victory over a page that doesn't render.

The instruction that turns this from a chat session into a loop rides along with the goal:

> [!note]
> Any new steer goes into the task queue while you continue working. Any question gets answered while you continue working.

Without it, every thought I have costs a full stop and a restart, and I start rationing my own corrections to avoid paying that. With it I can drop something in mid-stride and watch it land in the queue instead of derailing whatever is already running.

## Nonsense, flagged early

It will post nonsense. Not constantly, but often enough to plan around: a claim that the tests pass when nothing ran, or a reading of a requirement that is subtly and expensively wrong.

I flag those immediately and ask for detail rather than saying "that's wrong." Maybe half the time the detail comes back fine and I had misread the shorthand; the other half, the detail is exactly where the wrongness lives, and then I steer. Either way it is cheap. Catching a bad assumption in its first minute costs one line, and catching it twenty minutes later costs a revert plus everything that got stacked on top of it.

## The summary is not the work

Conclusions come out compressed to the point of being cryptic, written to be short rather than checkable, so I expand the reasoning and read what led up to them instead.

That is where a misreading is actually visible. A summary saying it "updated the layout to match the design" hides the reasoning where it decided a spacing token was probably wrong and changed it. Anything I spot there goes back as a follow-up task straight away, while the context that produced it is still warm.

## Reading what nobody assigned

The agent has the repo, and so do I, open in VS Code, reading the parts it is not touching.

This is the half people skip. While the loop grinds through the surfaces in scope I audit the ones next door: code paths near the change that nobody has opened in a year, the component everything got refactored around and then left behind. All of it goes on the stack, so the loop never runs dry, and by the time it clears the original list the list has grown. Every addition came from a human reading code rather than an agent grepping for it, which is a different search that turns up different things.

## Somebody else's eyes

I use [side-piece](https://tjw.dev/side-piece) to connect my agent CLIs, so sol can hand a diff to opus for an adversarial review, or either of them can hand it to an opencode model, while I keep building.

This beats asking the author model to check its own work, because the author is defending a story about what it just did and a reviewer that never wrote the code has no story to protect. The mechanics carry their own weight here: the review runs in the background against an isolated worktree, so it reads everything and writes nothing that lands on me, and the session resumes, so "push back on point three" continues a conversation the provider already has cached instead of re-sending the entire context and paying for it twice.

## Coming back

I don't sit and watch. Once it is clearly pointed the right way I go do something else, and when I come back the first thing I ask for is a status update, which I read properly before deciding whether the trajectory still holds.

That is the rhythm. Leave when it is on rails, come back with a question, correct, leave again. The loop tolerates me being gone; what it won't tolerate is me being gone and then not reading what happened while I was.

## Keeping the context clean

New work stays adjacent to what we have already built up, which is deliberate rather than lazy. The value in a long session is the accumulated understanding of the file layout, the conventions, and the reasons behind the last four decisions, and anything adjacent to that inherits all of it for nothing.

Anything that is not adjacent, I delegate. When something needs fixing in an unrelated corner of the codebase with only a few loose touch points, I have the agent spin up a subagent with a narrow brief and take back a result, so the main context never has to load a second unrelated mental model of a system it will not touch again. That is the only orchestration in the whole setup, and it exists to keep the long-running context from getting poisoned.

## After a few compactions you know

Either the quality is holding, with the conventions remembered and the summaries matching reality, or it is visibly struggling: repeating work it already did, needing three rounds to land one change.

There are two moves at that point. Saving the loop means aggressive re-grounding, restating the goal and pruning the queue of everything that has gone stale. Ejecting means taking the code as it stands, writing a fresh plan against it, and starting clean.

I've stopped being sentimental about which one I reach for. A degrading loop will burn an hour producing work I throw away, while writing a new plan costs ten minutes I probably owed the project anyway.

## It still feels like mine

One agent, one long context, a queue that accepts interruptions, another model on the side for the reviews I wouldn't trust it to run on itself, subagents for the unrelated work, and a human reading the parts nobody assigned. No graph, and no dashboard of little agents blinking at each other.

The complexity all sits in the judgement about what to flag, what to queue, and when to eject, and none of that has been automated away yet.
