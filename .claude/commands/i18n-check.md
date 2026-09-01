---
description: Audit EN/FR translation parity and find hardcoded user-facing strings
allowed-tools: Bash, Read, Edit, Glob, Grep
---

Audit this project's i18n.

1. **Key parity** — compare every file under `src/i18n/locales/en/` against `src/i18n/locales/fr/`. Report keys present in one but not the other, in both directions. Nested keys count.
2. **Namespace registration** — every namespace directory must appear in both the `resources` map and the `ns` array in `src/i18n/index.ts`.
3. **Untranslated FR values** — flag French values that are byte-identical to the English ones. Some are legitimately identical (proper nouns, "Email"); list them for a human to judge rather than rewriting them yourself.
4. **Hardcoded strings** — scan `src/screens/` and `src/components/` for user-facing literals rendered inside `<Text>`, or passed as `title` / `label` / `placeholder` / `accessibilityLabel`, that do not go through `t()`. Ignore dev-only demo/showcase copy in `src/components/demos/`, but say that you skipped it.

Report as a table of `namespace.key → missing in en|fr`. Fix parity gaps directly; for anything requiring a real translation judgement call, propose the French wording and ask before writing it.

RTL is not supported — do not add RTL handling or Arabic.
