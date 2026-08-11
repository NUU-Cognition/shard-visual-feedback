---
description: "Add Agentation to a codebase behind a dev-mode guard — detect, install, mount, then verify it cannot reach production"
---

> [!important] THIS FILE IS AN INSTRUCTION. WHEN REFERENCED IT IS MEANT TO BE TAKEN AS AN ACTION.

Run `flint shard start vf` if you haven't already.

# Workflow: Instrument

Add the Agentation toolbar to a codebase so it renders in development and **never** in production.

This is staged rather than atomic because it edits someone's application code and because the central mistake is silent. The wrong dev guard behaves identically to the right one in development — it only shows up as a developer toolbar in production. Detection is confirmed with the user before anything is written, and the guard is proven against a real build before the work is called done.

# Input

- Target codebase path (resolve a Flint codebase reference with `flint resolve codebase` if given as a wikilink)
- (Optional) Which app to instrument, if the repo is a monorepo

# Actions

## Stage 1: Detect

Edit nothing in this stage.

1. Read `package.json` — record the framework, the dev script, and the package manager (from the lockfile: `pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, `package-lock.json` → npm).
2. Confirm React and its major version — `npm ls react`, or the `react` entry in `package.json`.
3. Identify the framework config file and the root component / entry module.
4. Choose the guard from [[dev-knw-vf-dev_mode]] § The Guard, Per Framework.

**If React is absent or below 18**, the npm package cannot work. Do not install it. Report the framework found, why the package does not apply, and that the Agentation Chrome extension is the route instead — it needs no code change and cannot leak into a bundle. The workflow ends here; see [[dev-knw-vf-agentation]] § Fallback.

**If the repo is a monorepo or the framework is ambiguous**, do not guess a guard — an incorrect one fails in exactly the direction that matters.

Present to the user: framework, React version, chosen mount point, and the exact guard expression you intend to use. Once the user confirms the target and the guard, progress to the next stage.

## Stage 2: Install and Mount

1. **Install as a dev dependency**, using the package manager the lockfile indicates:

   ```bash
   npm install agentation -D
   ```

   If it lands in `dependencies`, move it.

2. **Mount it guarded**, at the point confirmed in Stage 1:

   ```jsx
   import { Agentation } from 'agentation';

   // …inside the root component, as a sibling of the app:
   {import.meta.env.DEV && <Agentation />}
   ```

   Use the guard for the detected framework — `import.meta.env.DEV` for Vite and Astro, `process.env.NODE_ENV === 'development'` for Next.js, CRA, Remix, and custom webpack. Match the surrounding code's import ordering, quote style, and formatting.

   **Next.js App Router:** `app/layout.tsx` is a server component by default. Either add `'use client'` to the file rendering the toolbar, or wrap it in a small client component and mount that. Mounting straight into a server layout fails at build.

Once the edits are in, progress to the next stage.

## Stage 3: Verify Both Directions

Typechecking proves nothing here. Both checks are required.

1. **Dev** — run the dev script, load the app, confirm the toolbar appears bottom-right.

2. **Production** — build and grep the output for the package name:

   ```bash
   npm run build && grep -r "agentation" dist/ build/ .next/ 2>/dev/null | head
   ```

   **No matches is the pass condition.** A match means the guard did not tree-shake and the toolbar is shipping — return to Stage 2, fix the guard, and re-run.

Report what you actually ran and what you actually saw. If the dev-server check could not be run (no browser, port conflict, build failure), say so plainly rather than implying it passed.

Once both checks pass and the user confirms the toolbar works, the workflow is complete.

# Output

- Agentation installed as a dev dependency and mounted behind a framework-correct dev guard
- Production build grepped clean, with the actual result reported
- Or, for non-React codebases: no edits made, and a clear report pointing at the extension
