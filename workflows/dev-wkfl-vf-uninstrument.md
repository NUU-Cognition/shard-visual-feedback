---
description: "Remove Agentation from a codebase — every mount, its imports, and the dependency"
---

> [!important] THIS FILE IS AN INSTRUCTION. WHEN REFERENCED IT IS MEANT TO BE TAKEN AS AN ACTION.

Run `flint shard start vf` if you haven't already.

# Workflow: Uninstrument

Remove Agentation from a codebase, leaving no dangling import and no unused dependency.

Staged because removal touches application code and because the number of mount sites is not known up front — a monorepo may have several, and a wrapper client component may exist solely to host one. What gets deleted is confirmed before it is deleted.

# Input

- Target codebase path

# Actions

## Stage 1: Find Every Reference

Search the source tree — there may be more than one mount point:

```bash
grep -rn "agentation" --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js" src/ app/ pages/ 2>/dev/null
```

Also check `package.json` for the dependency entry.

Present the full list: every mount site, every import, any wrapper component that exists only to host the toolbar, and the dependency. Flag anything ambiguous — a wrapper component that also does something else must not be deleted wholesale.

Once the user confirms the removal list, progress to the next stage.

## Stage 2: Remove

1. Remove the guarded render at each confirmed site.
2. Remove any wrapper component that existed only to host it.
3. Remove the import at each site — leaving it behind breaks lint and, in some configs, the build.
4. Remove the dependency, using the package manager the lockfile indicates:

   ```bash
   npm uninstall agentation
   ```

Once the edits are in, progress to the next stage.

## Stage 3: Verify Clean

1. **Grep the tree again** — expect no matches:

   ```bash
   grep -rn "agentation" --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js" src/ app/ pages/ 2>/dev/null
   ```

2. **Run the project's typecheck and lint** to confirm nothing dangles.

3. Confirm the app still starts.

Report the actual results. Once they pass, the workflow is complete.

# Output

- No references to the package in source, none in `package.json`, lockfile updated
- Typecheck, lint, and app start confirmed, with actual results reported
