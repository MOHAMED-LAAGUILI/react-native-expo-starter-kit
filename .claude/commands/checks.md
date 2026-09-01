---
description: Run the full pre-commit check suite and fix what fails
allowed-tools: Bash, Read, Edit, Glob, Grep
---

Run the project's full check suite, exactly as the Husky `pre-commit` hook does:

```bash
pnpm run checks
```

That chains `deps:fix` → `lint:fix` → `type:check` → `doctor`.

Then:

1. If any step fails, fix the underlying cause — never suppress with `eslint-disable`, `@ts-ignore`, or `any` unless there is genuinely no alternative, and say so explicitly if you use one.
2. Re-run only the step that failed while iterating; run the full suite once at the end to confirm.
3. Report each step's real outcome. If a step was skipped (e.g. `node_modules` missing), say so rather than implying it passed.

Common failure modes in this repo:
- `max-lines-per-function` (110) — extract sub-components, don't raise the limit.
- `max-params` (3) — switch to an options object.
- `unicorn/filename-case` — filenames are kebab-case.
- `ts/consistent-type-imports` — use inline `import { type Foo }`.
- `perfectionist/sort-imports` — let `--fix` reorder.
