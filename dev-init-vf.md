---
required-reading:
  - "[[dev-knw-vf-agentation]]"
  - "[[dev-knw-vf-annotate]]"
  - "[[dev-knw-vf-dev_mode]]"
---

# Visual Feedback

Closing the loop between what a human *sees* in a running web app and what an agent *changes* in the code.

Describing a UI problem in prose is lossy in both directions. "The signup button is too close to the nav" makes the human guess at words and the agent guess at elements. This shard replaces that round trip with two complementary channels, and its whole design rests on keeping them separate.

## The Two Halves

Visual feedback asks two independent questions, and no single tool answers both well:

| Question | Answered by | Output |
|----------|-------------|--------|
| **Which element?** | Agentation — click-to-annotate on the live app | Markdown with CSS selectors, position, component context |
| **What's wrong spatially?** | The annotate tool — draw on a screenshot | A composited PNG: arrows, boxes, freehand, numbered markers |

Agentation knows the DOM but cannot draw. The annotate tool draws but knows nothing about the DOM. Used together they cover the space; used alone each has a predictable blind spot.

**Pick by the shape of the feedback, not by habit:**

- Feedback about *a specific element's code* — wrong copy, wrong handler, wrong component → **Agentation**. The selector is the payload.
- Feedback about *space, alignment, or relationships* — "move this there", "these should line up", "this gap is wrong" → **annotate**. The drawing is the payload.
- Both at once → run Agentation for the selectors, annotate for the geometry, paste both. They compose.

## The Annotate Tool

A single self-contained HTML file shipped as a shard asset, opened with one command:

```bash
flint shard vf annotate
```

The script serves the asset over `http://127.0.0.1` and opens a browser tab. **It must be served, not opened as a bare `file://` path** — the Clipboard API requires a secure context, and `file://` is not reliably one. The script exists for that reason alone.

Flow: capture a screenshot to the clipboard (`⌘⌃⇧4` on macOS) → paste into the page → draw → copy → paste into the agent conversation. The URL and note fields are burned into a header strip on the exported image, so a single paste carries the picture *and* its context. See [[dev-knw-vf-annotate]].

## Instrumenting a Codebase

Agentation ships as an npm package exposing a React component. Two constraints drive everything the instrument workflow does:

1. **It requires React 18+.** Non-React codebases cannot use the package at all and must fall back to the browser-extension variant.
2. **It has no built-in dev gating.** An unguarded `<Agentation />` ships the toolbar to production. The guard is the caller's responsibility, which makes it this shard's responsibility.

Never instrument without first identifying the codebase's own dev-mode mechanism and using *that* — a Vite app's guard is not a Next.js app's guard. See [[dev-knw-vf-dev_mode]] for the detection order and the correct guard per framework, and [[dev-knw-vf-agentation]] for the package's real API.

## Scope

This shard produces feedback that flows straight into an agent conversation. It deliberately manages **no artifact type** — there is no `(Feedback Round)` to file, and none should be added until a concrete operation needs one.
