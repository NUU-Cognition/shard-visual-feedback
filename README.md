# Visual Feedback (`vf`)

Closes the loop between what a human sees in a running web app and what an agent changes in the code.

Visual feedback asks two independent questions. **Which element?** is answered by [Agentation](https://github.com/benjitaylor/agentation) — click-to-annotate on the live app, producing markdown with CSS selectors. **What's wrong spatially?** is answered by the annotate tool shipped here — paste a screenshot, draw on it, copy one composited PNG. Neither tool does both; used together they cover the space.

## Quick Start

```bash
flint shard vf annotate          # open the drawing tool
flint shard vf annotate --port 8080 --no-open
```

Then: `⌘⌃⇧4` to capture a screenshot → `⌘V` into the page → draw → fill the URL field → `⌘⇧C` → paste into your agent.

To instrument a codebase with Agentation, load the shard and run the instrument workflow.

## Structure

| File | Purpose |
|------|---------|
| `dev-init-vf.md` | Shard context — the two-halves model, when to use which |
| `skills/dev-sk-vf-use_vf.md` | Open the channels and ground what the user is about to paste |
| `workflows/dev-wkfl-vf-instrument.md` | Add Agentation behind a dev-mode guard, verified against a real build |
| `workflows/dev-wkfl-vf-uninstrument.md` | Remove it cleanly |
| `knowledge/dev-knw-vf-agentation.md` | Agentation's real API, the React 18+ constraint, extension fallback |
| `knowledge/dev-knw-vf-dev_mode.md` | Dev-mode detection and the correct guard per framework |
| `knowledge/dev-knw-vf-annotate.md` | The annotate tool — capabilities, one-paste export, how to read it |
| `scripts/dev-annotate.js` | Serves the asset over loopback and opens a browser |
| `assets/dev-ast-vf-annotate.html` | The annotate tool — one self-contained file |

## Two Things Worth Knowing

**The tool is served, not opened.** `navigator.clipboard.write()` needs a secure context, and `file://` is not reliably one — opened directly, the copy silently degrades to a download. The script exists to serve it over `http://127.0.0.1`.

**Agentation is React 18+ only and has no built-in dev gating.** An unguarded `<Agentation />` ships a developer toolbar to production, and the mistake is invisible in dev. The instrument workflow confirms the detected framework and guard with you before editing, then verifies by grepping the production build.
