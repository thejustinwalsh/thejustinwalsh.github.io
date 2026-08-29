---
title: Meat Loop
description: The endless review agent loop I actually build with — and why the slow, wet part of it is still me.
date: 2026-08-29
tags:
  - agentic
  - workflow
  - process
  - meta
draft: true
---

There is a lot of writing right now about agent orchestration. Graphs, supervisors, routers, fan-out topologies with a dozen boxes and arrows. I've read most of it. None of it is what I actually do.

What I actually do is run one long agent loop and stand next to it. I call it the meat loop, because the loop closes through me. The agent does the typing. I do the steering, the smell test, and the decision about when to keep going. It is not an incredibly complex setup. There is no graph. And the software factory still feels like me.

## Starting the Loop

Every good loop starts from something written down. A spec, a plan, a bug list, or at minimum a genuinely good description of the work. Not "fix the review comments" — the actual list, with enough context that the agent can tell when it's done.

Then I set a `/goal` in codex and hand it the whole thing: fix all the review findings, the fixes, the changes. Write tests. Verify it works with live probes in the browser. Check for visual regressions. That last part matters more than it sounds — an agent that can only see its own diff will confidently declare victory over a broken page.

The important part is the standing instruction attached to the goal:

> [!note]
> Any new steer gets added to the task queue while you continue to work. Any question gets answered while you continue to work.

That one rule is what turns a chat session into a loop. Without it, every thought I have costs a full stop and restart. With it, I can drop a correction in mid-stride and the agent absorbs it into the queue instead of abandoning what it's doing. The loop keeps running while I think.

## Watching for Nonsense

While it's fixing things, it will post nonsense. Not often, but reliably. A confident summary of something that didn't happen. A claim that a test passes when it was never run. An interpretation of a requirement that is subtly, expensively wrong.

I flag those immediately and ask for more detail. Not "that's wrong" — a request to explain. Half the time the detail is fine and I misread the shorthand. The other half, the detail is where the wrongness lives, and then I steer.

This is the highest-value thing I do in the loop, and it costs almost nothing. Catching a bad assumption in the first minute is a one-line correction. Catching it after twenty minutes of building on top of it is a revert.

## Read the Thinking, Not the Summary

Summaries and conclusions are compressed to the point of being cryptic. They're written to be short, not to be verifiable. So I expand the reasoning and read the thoughts that led up to the conclusion instead.

That's where the misinterpretations are visible. The summary says "updated the layout to match the design." The reasoning says it decided the spacing token was probably wrong and changed it. The summary would never have told me that. If I spot anything off, it goes in as a follow-up task immediately, while the context that produced it is still warm.

## The Second Surface

The agent has the repo. I also have the repo, open in VS Code, and I'm reading the parts it isn't touching.

This is the part people skip. While the loop grinds on the surfaces in scope, I audit adjacent ones — the code paths near the change that nobody has looked at in a while, the tests that assert nothing, the component that got refactored around and left behind. Everything I find goes on the stack.

The loop never runs dry. By the time it finishes the original list, the list is longer, and every addition came from a human reading code rather than an agent grepping for it. Those are different searches and they find different things.

## Borrowing Another Model's Eyes

I use [tjw.dev/side-piece](https://tjw.dev/side-piece) to connect my agent clips. It lets sol ask opus for an adversarial review, or lets either of them ask an opencode model for a review — all while I keep building features.

An adversarial review from a model that didn't write the code is worth more than a self-review from the model that did. The author model is optimizing for a coherent story about its own work. A cold reviewer has no story to protect. Running that in parallel means the critique arrives without costing me the main loop's momentum.

## Checking In

I don't sit there the whole time. Once the agent is clearly headed in the right direction, I leave.

When I come back, the first thing I ask for is a status update. Then I read it, decide whether the trajectory is still good, and re-steer. That's the whole rhythm: leave when it's on rails, return with a question, correct, leave again. The loop tolerates me being gone. It does not tolerate me being gone and not reading what happened.

## Keeping the Context Clean

New tasks stay adjacent to the work and the context we've already built up. That's a deliberate constraint, not laziness. The value in a long-running session is the accumulated understanding — the file layout, the conventions, the reasons behind the last four decisions. Every task that's adjacent to that gets it for free.

Work that isn't adjacent gets delegated. When something needs fixing in an unrelated part of the codebase with only a few loose touch points, I direct the agent to spin up a subagent for it. The subagent gets a narrow brief and returns a result. The main context never has to load a second unrelated mental model.

That's the only orchestration in this whole setup, and it exists for exactly one reason: to avoid poisoning the long-running context.

## Compaction as a Quality Signal

After a few compactions, you know.

Either the quality of work is still high — the agent remembers the conventions, the fixes land clean, the summaries match reality — or it's struggling to execute. Repeating work it already did. Re-litigating settled decisions. Producing changes that need three rounds of correction.

When it's struggling, there are two options: try to save the loop, or eject and start fresh. Saving usually means an aggressive re-grounding — restate the goal, re-list what's actually done, prune the queue. Ejecting means taking the current state of the code, writing a new plan against it, and starting a clean loop.

I've learned not to be sentimental about it. A loop that's degrading will burn an hour producing work you have to throw away. Starting fresh costs ten minutes of writing a plan you should have updated anyway.

## The Factory Still Feels Like Me

This has been how I've been building. One agent, one long context, a queue that accepts interruptions, a second model for adversarial review, subagents for the unrelated stuff, and a human reading the parts nobody assigned.

No graph. No orchestration framework. No dashboard of running agents. The complexity lives in the judgment — what to flag, what to queue, when to eject — and that hasn't been automated away yet.

The meat is still in the loop. That's the point.
