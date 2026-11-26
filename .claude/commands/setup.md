---
description: Bootstrap the project — pnpm dependencies, env files and a machine check
allowed-tools: Bash, Read, Glob, Grep
---

Bootstrap this project from a clean checkout.

```bash
pnpm run setup
```

That is `pnpm run install:safe && pnpm run env:create && pnpm run setup:check`. Run the steps separately if you need to isolate a failure:

```bash
pnpm run install:safe
```

```bash
pnpm run setup:check
```

```bash
pnpm run env:create
```

## What each step does

**`pnpm run install:safe`** — runs `script/guard-node-modules.ts` (`pnpm run guard`), then `pnpm install`. The guard refuses to proceed while another pnpm, this project's Metro / `expo run:*`, or a Gradle build is using `node_modules` — on Windows an overlapping install dies with `EBUSY` / `ENOTEMPTY` and leaves `node_modules` half-written — and clears idle Gradle/Kotlin daemons and the Watchman watch itself. Relay its message verbatim if it blocks; do not bypass it with `SKIP_INSTALL_GUARD=1` unless the user asks. `preinstall` enforces pnpm (`only-allow`), so npm or yarn will be rejected. `prepare` then installs the Husky hooks, which is what wires up the `pre-commit` check suite and `commit-msg` format validation. Neither hook runs when `ignore-scripts=true` is set in the user's `.npmrc` — if so, say that Husky was not installed rather than implying the git hooks are active.

**`pnpm run env:create`** (`script/create-env-files.ts`) — creates any missing `.env.{development,preview,production}` from `.env.example`; existing files are skipped.

**`pnpm run setup:check`** (`script/check-setup.ts`) — checks Node, pnpm, `node_modules`, `.env.*`, JDK 17, Android SDK, Xcode (macOS), Watchman, Maestro, ffmpeg and Docker, and prints a fix for anything missing.

## Reporting

Report what actually happened, per step:

- The installer prints how many skills came from cache versus network. Relay both numbers. Skills fetched from GitHub are **not** revision-verified — the lockfile's `computedHash` is not a plain sha256 of the file, so a cache miss means the pinned revision cannot be confirmed. Say so rather than implying a clean install.
- A non-zero exit from the installer means some skills are unavailable; list them.
- If the install was blocked by the guard, skipped or failed, say that explicitly instead of moving on.

## Skills

Agent skills are committed in `.claude/skills/` — nothing to install. Add more with `pnpm run skills:add -- <owner/repo>` (skills.sh CLI) and commit them.

