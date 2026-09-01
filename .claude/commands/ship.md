---
description: Walk the EAS release lifecycle for this app
argument-hint: [ios|android] [preview|production]
allowed-tools: Bash, Read, Grep
---

Guide the release of `$1` on the `$2` profile.

The build, submit, update, and deploy scripts are **denied** to you in `.claude/settings.json` — they cost money, are outward-facing, and are the user's to run. Your job is to verify readiness and hand over the exact commands.

**Verify first, and report what actually passed:**
1. `pnpm run checks` — must be green.
2. Working tree clean, on the intended branch, pushed to origin.
3. `package.json` version bumped if this is a store release (the GitHub Actions release workflow tags `v{version}` on push to `main`).
4. The right `.env.$2` values and the matching `eas.json` profile / channel.

**Then print the commands for the user to run themselves:**

First release to the stores:
```bash
pnpm run flow:build-$1:main
```
then
```bash
pnpm run submit:$1
```

Subsequent OTA update (no resubmission):
```bash
pnpm run eas:update:prod
```

Note the profile mapping: `development` → internal APK, `preview` → store APK for QA, `production` → AAB. `preview` and `production` auto-increment build numbers (`appVersionSource: "remote"`).
