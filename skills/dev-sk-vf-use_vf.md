---
description: "Ground an incoming round of visual feedback — declare what the user is about to paste and how to read it"
---

> [!important] THIS FILE IS AN INSTRUCTION. WHEN REFERENCED IT IS MEANT TO BE TAKEN AS AN ACTION.

Run `flint shard start vf` if you haven't already.

# Skill: Use VF

Set up the channels for a round of visual feedback and **state plainly what is about to arrive**, so the paste that follows is interpreted correctly instead of guessed at.

The failure this prevents is specific: an image or a block of selector markdown lands mid-conversation with no framing, and the agent treats it as decoration, or reads an arrow as "look here" when it meant "move this there". Grounding is cheap; a wrong edit and a second round are not.

# Input

- (Optional) Which channels the round needs — element identification, spatial feedback, or both

# Actions

## 1. Open what the round needs

**Spatial feedback** (drawing on a screenshot) — start the tool with your harness's background execution, since it runs until interrupted:

```bash
flint shard vf annotate
```

`--port <n>` if `7333` is taken; `--no-open` to suppress the browser.

The command prints nothing while it runs — `flint shard <sh> <script>` buffers child output until exit. The browser opens on its own; **state the URL yourself**: `http://127.0.0.1:7333/` by default. Startup errors do surface, since those exit the process.

**Element identification** (selectors) — check whether Agentation is already mounted:

```bash
grep -rn "agentation" src/ app/ 2>/dev/null
```

If it is not, and the round needs it, run [[dev-wkfl-vf-instrument]]. Many rounds need only one channel — do not instrument a codebase for a single "move this 8px left".

## 2. Tell the user the flow

Concise, one line each — they may not have used these before:

> **Annotate:** `⌘⌃⇧4` to capture → `⌘V` into the page → draw → fill the URL field → `⌘⇧C` → paste here.
> **Agentation:** click the element → leave a comment → copy → paste here.

## 3. Ground what is arriving — say this out loud

Declare, before the paste, what you expect and what it will mean. This is the point of the skill:

| The user will paste | What it is | What is authoritative | What is absent |
|---|---|---|---|
| **Agentation markdown** | Text: clicked elements with CSS selectors, position, comments | The **selector** — grep straight to it, do not re-derive | Geometry. It cannot express "move this there" |
| **An annotated PNG** | One image: arrows, boxes, freehand, numbered markers, with the URL and note burned into a header strip | The **drawing** — spatial relationships are the message | Selectors. There is no element identity in it |
| **Both** | The markdown says *which elements*; the image says *what is wrong with them* | Selectors for identity, drawing for intent | — |

Then read what actually arrives against that frame:

- **Numbered markers key to a list.** Marker ① is item 1 in any accompanying text. Match them before acting.
- **Arrows carry direction.** A → B usually means "move this there" or "this should point at that", not merely "look here".
- **Boxes scope, they do not condemn.** The rectangle marks the region under discussion; the complaint is in the note.
- **The header strip is context.** The URL is the route to open; the note is the headline.

## 4. Wait, then restate

Do not pre-emptively edit in anticipation of the feedback.

When it arrives, restate what you understood as a short list of concrete changes and confirm before editing. Ambiguity is cheapest to resolve here.

If the feedback is about a specific element's code and no Agentation markdown came with it, locate the element from the route plus the visual — or ask. **Never infer a selector from pixels and then edit as though it were confirmed.**

## 5. Close the round

Stop the annotate server when the round is done. If Agentation was mounted only for this round, offer [[dev-wkfl-vf-uninstrument]].

Verify changes in the running app, not in the diff — reload, look, and report what you actually saw.

# Output

- The needed channels open, and the user told how to use them
- The incoming feedback explicitly grounded before it arrives
- Changes restated and confirmed before editing, then verified visually
