---
description: "Detecting a codebase's dev-mode mechanism and choosing the correct guard per framework"
---

# Knowledge: Dev Mode Detection

Instrumentation must never reach a production bundle. This file is how you determine the guard that a *specific* codebase actually honours, rather than pasting a guard that merely looks right.

The failure mode is quiet: the wrong guard still works perfectly in development, so nothing surfaces until a developer toolbar appears in production. Detect first, then guard.

## Detection Order

Work top-down and stop at the first match. The framework determines the guard; the package manager and script names do not.

1. **Read `package.json`** — `dependencies` and `devDependencies` name the framework, and `scripts` names the dev command.
2. **Look for a framework config file** in the repo root — `vite.config.*`, `next.config.*`, `nuxt.config.*`, `svelte.config.*`, `astro.config.*`, `angular.json`, `remix.config.*`.
3. **Confirm React and its major version** if the npm package is on the table — `npm ls react` or the `react` entry in `package.json`. Agentation needs 18+; see [[dev-knw-vf-agentation]].
4. **Find the mount point** — the root component or entry module where a global overlay belongs. Usually `src/main.tsx`, `src/App.tsx`, `app/layout.tsx`, or equivalent.

## The Guard, Per Framework

| Framework | Signal | Guard expression |
|-----------|--------|------------------|
| **Vite** (React) | `vite` in devDeps, `vite.config.*` | `import.meta.env.DEV` |
| **Next.js** | `next` in deps, `next.config.*` | `process.env.NODE_ENV === 'development'` |
| **Create React App** | `react-scripts` in deps | `process.env.NODE_ENV === 'development'` |
| **Remix** | `@remix-run/*` in deps | `process.env.NODE_ENV === 'development'` |
| **Webpack (custom)** | `webpack.config.*` | `process.env.NODE_ENV === 'development'` |
| **Astro** (React island) | `astro.config.*` + `@astrojs/react` | `import.meta.env.DEV` |

**Vite vs. everything else is the distinction that matters.** Vite statically replaces `import.meta.env.DEV` at build time and tree-shakes the dead branch, so the component is entirely absent from the production bundle. `process.env.NODE_ENV` in a Vite app is often undefined at runtime — a guard written that way can evaluate falsy in dev (toolbar never appears) or, worse, be left in the bundle.

Non-React frameworks (Vue, Svelte, Angular, plain) have no npm path at all — the guard question does not arise, because the fallback is the browser extension, which never touches the bundle.

## Preferred Mount Points

Mount the overlay as high as possible, outside routing, so it survives navigation:

| Framework | File | Placement |
|-----------|------|-----------|
| Vite + React | `src/main.tsx` or `src/App.tsx` | Sibling of the app root |
| Next.js (App Router) | `app/layout.tsx` | Inside `<body>`, after `{children}` |
| Next.js (Pages Router) | `pages/_app.tsx` | Sibling of `<Component />` |
| CRA | `src/App.tsx` | Sibling of the app root |

In Next.js App Router the layout is a **server component** by default; a client-only overlay needs `'use client'` on the file that renders it, or it must be wrapped in a small client component. Mounting it directly into a server layout without that will fail at build.

## Verifying the Guard Actually Holds

Typechecking proves nothing here. Confirm both directions:

1. **Dev** — run the dev script, load the app, confirm the toolbar appears.
2. **Production** — build (`npm run build`) and grep the output bundle for the package name:

   ```bash
   npm run build && grep -r "agentation" dist/ build/ .next/ 2>/dev/null | head
   ```

   **No matches is the pass condition.** A match means the guard did not tree-shake and the toolbar is shipping. Report the grep result rather than asserting the guard is correct.

## When Detection Is Ambiguous

Monorepos, custom bundlers, and heavily-wrapped configs can defeat the table above. Do not guess a guard — an incorrect one fails silently in exactly the direction that matters. Report what was found, name the ambiguity, and ask which app and which guard before editing.
