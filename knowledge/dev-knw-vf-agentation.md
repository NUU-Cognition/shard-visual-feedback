---
description: "Agentation reference — real install API, the React 18+ constraint, the extension fallback, and output shape"
---

# Knowledge: Agentation

Agentation is a click-to-annotate toolbar for a running web app. You click an element, leave a comment, and it produces structured markdown identifying that element — CSS selectors, position, and surrounding context — for an AI coding agent to act on.

It answers *which element*. It cannot draw. For spatial feedback see [[dev-knw-vf-annotate]].

## The Package

```bash
npm install agentation -D
```

An npm package exposing a React component. Not a script tag, not a CLI.

```jsx
import { Agentation } from 'agentation';

function App() {
  return (
    <>
      <YourApp />
      <Agentation />
    </>
  );
}
```

Zero runtime dependencies. Desktop browsers only — the toolbar does not support mobile.

## Two Constraints That Drive Everything

**1. React 18+ only.** The package is a React component. A Vue, Svelte, Angular, Astro, or plain-JS app cannot use it at all. This is not a soft preference — there is no non-React entry point. Verify React and its major version *before* proposing the package. If the codebase is not React 18+, go to [Fallback](#fallback-non-react-codebases).

**2. No built-in dev gating.** `<Agentation />` renders wherever you put it, including production. The package does not check `NODE_ENV` for you. An unguarded mount ships a developer toolbar to end users.

The guard is always the caller's job:

```jsx
{process.env.NODE_ENV === 'development' && <Agentation />}
```

That specific guard is *illustrative, not universal* — the correct expression depends on the bundler. See [[dev-knw-vf-dev_mode]] for the right one per framework. Getting this wrong is the single highest-cost mistake when instrumenting, because it is invisible in dev and only shows up in production.

## Fallback: Non-React Codebases

Agentation also ships as a **Chrome extension** ("Agentation Vue" on the Chrome Web Store), which injects the toolbar into any page regardless of framework.

| | npm package | Chrome extension |
|---|---|---|
| Frameworks | React 18+ only | Any |
| Install | Per-codebase, committed | Per-browser, not committed |
| Dev gating | Your responsibility | N/A — never in the bundle |
| Output | Selectors + React context | Selectors, less framework context |

For non-React codebases the extension is the answer, and it is a genuinely reasonable one — it needs no code change and cannot leak to production. The cost is weaker component context in the output and per-developer setup that the repo cannot enforce.

## Output

Agentation copies **markdown** to the clipboard: the annotated elements with their selectors, positions, and comments. The selector is the load-bearing part — it lets an agent grep straight to the element rather than inferring it from a description.

Paste it into the agent conversation as text. It composes with an annotate PNG in the same message: the markdown says which elements, the image says what is wrong with them.

## Verify Before You Trust This File

Agentation is a young, fast-moving package. Before instrumenting, confirm the current API rather than assuming this file is still accurate:

```bash
npm view agentation version
npm view agentation description
```

If the API has moved on from what is documented here, follow the package's own docs and update this knowledge file.
