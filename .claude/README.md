# `.claude/`

Claude Code configuration for this repo.

The behavioural rules Claude follows live in **[`AGENTS.md`](../AGENTS.md)** (loaded via `CLAUDE.md` → `@AGENTS.md`) and **[`DESIGN.md`](../DESIGN.md)**. This folder holds only the harness config: permissions, slash commands, and subagents. Conventions go in `AGENTS.md`, not here.

## Layout

```
.claude/
├── settings.json     — shared permissions (checked-in, team-wide)
├── commands/         — /slash commands
├── agents/           — subagent definitions
└── skills/           — skills installed from ../skills-lock.json (git-ignored)
```

`settings.local.json` (git-ignored by Claude Code convention) is the place for personal overrides — put machine-specific paths and your own permission grants there, not in `settings.json`.

## Commands

| Command | Purpose |
|---|---|
| `/setup` | Bootstrap the project — `pnpm install` + install skills from `skills-lock.json` |
| `/checks` | Run `pnpm run checks` (the pre-commit suite) and fix what fails |
| `/new-screen <name> [tab\|drawer]` | Scaffold a screen: component, route, nav entry, i18n keys, docs |
| `/new-component <name>` | Scaffold a `src/components/ui/` component + barrel export + `DESIGN.md` entry |
| `/i18n-check` | Audit EN/FR key parity and find hardcoded user-facing strings |
| `/docs-sync` | Bring `AGENTS.md` / `DESIGN.md` / `README.md` in line with the current diff |
| `/ship [ios\|android] [preview\|production]` | Verify release readiness and print the EAS commands to run |

## Agents

| Agent | Purpose |
|---|---|
| `rn-reviewer` | Reviews the current diff against this repo's conventions — theme reactivity, cross-platform correctness, ESLint limits, i18n, doc sync |

## Permissions

`settings.json` allows the read-only and local-only commands (type check, lint, doctor, `git` reads, `ctx7` doc lookups) so they run without a prompt.

It **denies** everything that costs money or is outward-facing: all `eas-cli` builds, submits, OTA updates and web deploys, plus the destructive `clean:app` / `clean:all` scripts and edits to generated or native output (`android/`, `ios/`, `expo-env.d.ts`, `.expo/`, `pnpm-lock.yaml`). Those stay the user's to run.

Dev servers, prebuilds, `git commit` and `git push` are set to **ask**.

## Optional: auto-lint edited files

Not enabled by default, since it runs on every edit. To turn it on, add to `settings.json`:

```json
"hooks": {
  "PostToolUse": [
    {
      "matcher": "Edit|Write",
      "hooks": [{ "type": "command", "command": "pnpm exec eslint --fix --cache" }]
    }
  ]
}
```

## Version control

`settings.json`, `commands/` and `agents/` are committed and shared with the team. The root `.gitignore` excludes only `.claude/skills` (vendored skill markdown, restored from `skills-lock.json`) and `.agents/skills`.

Personal overrides belong in `settings.local.json`, which Claude Code ignores by convention.

## Skills

`skills/` holds the skills pinned in [`skills-lock.json`](../skills-lock.json), installed project-locally so they are scoped to this repo rather than to your machine. The directory is git-ignored — the lockfile is what gets committed.

Install or restore them with:

```bash
pnpm run skills:install
```

or as part of `pnpm run setup`. Use `pnpm run skills:check` for a dry run.

The installer resolves each entry from autoskills' local cache first (the lockfile's `computedHash` is that cache's key, so a hit is the exact pinned revision), then falls back to `raw.githubusercontent.com` for `sourceType: "github"` entries. **Skills fetched from GitHub are not revision-verified** — `computedHash` is not a plain sha256 of `SKILL.md`, so on a cache miss the pinned revision cannot be confirmed.

`pnpm skills` (`npx autoskills`) is a different operation and does not read the lockfile as input: it re-detects skills from the dependency tree, installs **globally** to `~/.agents/skills/`, and rewrites `skills-lock.json` with whatever it detected. Run it only when you intend to re-pin.
