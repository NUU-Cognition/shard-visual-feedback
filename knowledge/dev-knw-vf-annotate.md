---
description: "The annotate tool — capabilities, the one-paste export design, and how to read its output as an agent"
---

# Knowledge: The Annotate Tool

A single self-contained HTML file, shipped as this shard's asset (`assets/ast-vf-annotate.html`) and opened with `flint shard vf annotate`. It answers *what is wrong spatially*. It knows nothing about the DOM — for that, see [[dev-knw-vf-agentation]].

No dependencies, no build step, no extension, no network access. Everything is inline in the one file.

## Why It Is Served, Not Opened

The script starts a loopback HTTP server rather than opening the file directly. This is not incidental: the tool copies the finished annotation via `navigator.clipboard.write()`, which requires a **secure context**. A bare `file://` URL is not reliably one, so the copy silently degrades into a download — the tool appears to work while quietly doing the wrong thing.

Serving over `http://127.0.0.1` makes it a secure context. That is the script's entire reason to exist.

## Capabilities

| Tool | Key | Notes |
|------|-----|-------|
| Pen | `P` | Freehand |
| Arrow | `A` | Sized arrowhead, shaft stops short of the head |
| Rectangle | `R` | |
| Ellipse | `O` | |
| Text | `T` | Inline entry on canvas; `Enter` commits, `Esc` cancels |
| Numbered marker | `N` | Auto-incrementing circles — use these to key an image to a written list |

Colors `1`–`7`, stroke width slider, undo/redo (`⌘Z` / `⇧⌘Z`), clear. Image arrives by paste, drag-drop, or file picker.

Stroke weight, font size, and marker radius are all stored in canvas units scaled from display units at draw time, so marks stay visually consistent whether the screenshot is 800px or a 3000px retina capture.

## The One-Paste Design

The clipboard carries **one payload**. Rather than forcing two pastes, the tool renders the URL and note fields into a header strip composited onto the exported PNG. A single paste therefore delivers the picture, the page it came from, and a one-line description together.

Verified: a 1600×1000 source with both fields filled exports at 1600×1090 — a 90px strip for two lines.

Leave both fields empty and no strip is added; the export is the annotated image alone.

## Reading the Output as an Agent

You receive a PNG. Read it as follows:

- **Numbered markers key to a list.** If the human also pasted text with numbered items, marker ① on the image is item 1 in the text. Match them before acting.
- **Arrows carry direction.** An arrow from A to B usually means "move this there" or "this should point at that" — not merely "look here".
- **Boxes scope, they do not necessarily condemn.** A rectangle marks the region under discussion; the complaint is in the note or the text, not the box itself.
- **The header strip is context, not content.** The URL tells you which route to open; the note is the headline of the request.

**You will not get CSS selectors from this tool.** If the feedback is about a specific element's code and no Agentation markdown accompanies it, locate the element yourself from the route plus the visual — or ask. Do not guess a selector from pixels and then edit as if it were confirmed.

## Limits Worth Knowing

- Annotations are **flattened into the image** on export. There is no structured description of the marks — no "arrow from (x1,y1) to (x2,y2)" in text form. The picture is the payload.
- There is no persistence. Reloading the page discards the current annotation. Copy or download before navigating away.
- Full-page capture is out of scope. The tool annotates whatever screenshot you paste; capturing beyond the viewport is the operating system's job.
