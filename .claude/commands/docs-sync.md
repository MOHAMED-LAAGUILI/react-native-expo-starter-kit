---
description: Bring AGENTS.md / DESIGN.md / README.md in line with the current diff
allowed-tools: Bash, Read, Edit, Glob, Grep
---

Docs are the single source of truth for agents in this repo and must never drift from the code.

Look at the current change (`git diff` plus `git diff --staged`; if both are empty, use `git show HEAD`) and update the docs it invalidates:

- **`AGENTS.md`** — conventions (imports, naming, state, UI rules), the command table, routing structure, file organization, tech stack, Important Packages.
- **`DESIGN.md`** — any component or behavior change: new or renamed props and variants, motion/physics changes, new design tokens, new components, changed API, size, or spacing.
- **`README.md`** / `docs/` — user-facing or project-level behavior: commands, setup, scripts, structure.
- **`src/i18n/locales/{en,fr}/`** — keys added or removed alongside screens and strings.

Rules:
- Edit only the sections the diff actually invalidates. Do not restructure or reformat untouched prose.
- If a doc already describes the new behavior correctly, say so and change nothing.
- Report exactly which files you changed and which you deliberately left alone.
