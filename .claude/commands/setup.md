---
description: Bootstrap the project — install skills from skills-lock.json and pnpm dependencies
allowed-tools: Bash, Read, Glob, Grep
---

Bootstrap this project from a clean checkout.

```bash
pnpm run setup
```

That is `pnpm install && pnpm run skills:install`. Run the steps separately if you need to isolate a failure:

```bash
pnpm install
```

```bash
pnpm run skills:install
```

## What each step does

**`pnpm install`** — installs dependencies. `preinstall` enforces pnpm (`only-allow`), so npm or yarn will be rejected. `prepare` then installs the Husky hooks, which is what wires up the `pre-commit` check suite and `commit-msg` format validation.

**`pnpm run skills:install`** (`script/install-skills.ts`) — installs every skill pinned in `skills-lock.json` into `.claude/skills/`, preferring autoskills' local cache (where the lockfile hash is the cache key, so a hit is the exact pinned revision) and falling back to `raw.githubusercontent.com` for `sourceType: "github"` entries.

Use `pnpm run skills:check` to preview without writing.

## Reporting

Report what actually happened, per step:

- The installer prints how many skills came from cache versus network. Relay both numbers. Skills fetched from GitHub are **not** revision-verified — the lockfile's `computedHash` is not a plain sha256 of the file, so a cache miss means the pinned revision cannot be confirmed. Say so rather than implying a clean install.
- A non-zero exit from the installer means some skills are unavailable; list them.
- If `pnpm install` was skipped or failed, say that explicitly instead of moving on.

## Do not run `npx autoskills`

`pnpm skills` (`npx autoskills`) re-detects skills from the dependency tree and installs **globally** to `~/.agents/skills/`, not into this project — a different set in a different place, and it rewrites `skills-lock.json`. `skills-lock.json` is the source of truth; `skills:install` reads it. Only run `pnpm skills` when the user explicitly wants to re-detect and re-pin.
