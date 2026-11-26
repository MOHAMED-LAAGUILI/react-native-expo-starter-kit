# `.claude/`

Claude Code configuration for this repo.

The behavioural rules Claude follows live in **[`CLAUDE.md`](../CLAUDE.md)** (the single source of truth — `AGENTS.md` only points to it) and **[`DESIGN.md`](../DESIGN.md)**. This folder holds only the harness config: permissions, slash commands, and subagents. Conventions go in `CLAUDE.md`, not here.

## Layout

```
.claude/
├── settings.json     — shared permissions (checked-in, team-wide)
├── commands/         — /slash commands
├── agents/           — subagent definitions
└── skills/           — agent skills, committed (added with `pnpm run skills:add -- <owner/repo>`)
```

`settings.local.json` (git-ignored by Claude Code convention) is the place for personal overrides — put machine-specific paths and your own permission grants there, not in `settings.json`.

## Commands

| Command | Purpose |
|---|---|
| `/setup` | Bootstrap the project — guarded `pnpm install` (`install:safe`) + env files + machine check |
| `/checks` | Run `pnpm run checks` (the pre-commit suite) and fix what fails |
| `/new-screen <name> [tab\|drawer]` | Scaffold a screen: component, route, nav entry, i18n keys, docs |
| `/new-component <name>` | Scaffold a `src/components/ui/` component + barrel export + `DESIGN.md` entry |
| `/i18n-check` | Audit EN/FR key parity and find hardcoded user-facing strings |
| `/docs-sync` | Bring `CLAUDE.md` / `DESIGN.md` / `README.md` in line with the current diff |
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

`settings.json`, `commands/` and `agents/` are committed and shared with the team. Everything here is committed, including `skills/`.

Personal overrides belong in `settings.local.json`, which Claude Code ignores by convention.

## Skills

`skills/` holds the project's agent skills, committed so every clone has them. Add them from GitHub or [skills.sh](https://skills.sh) with `pnpm run skills:add -- <owner/repo>` (copies into `.claude/skills/`), find them with `pnpm run skills:find -- <query>`, update them with `pnpm run skills:update`, then commit the changed files. There is no lockfile — see CLAUDE.md § Skills for the recommended sources.
