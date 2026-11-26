# Contributing to React Native Starter Kit

Thank you for considering contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/MOHAMED-LAAGUILI/react-native-expo-starter-kit.git
cd react-native-expo-starter-kit
pnpm run setup
pnpm dev
```

Project conventions (for people and AI agents alike) live in [CLAUDE.md](CLAUDE.md); UI rules in [DESIGN.md](DESIGN.md).

## Before you open a PR

CI (`.github/workflows/ci.yml`) runs the same checks — run them locally first:

```bash
pnpm run checks        # deps → lint → types → tests → i18n → doctor (also the pre-commit hook)
```

- **Tests** — new logic gets a `node` test (`__tests__/**/*.test.ts`), new components/hooks an `rn` test (`*.test.tsx`), and user journeys a Maestro flow in `.maestro/`. See [docs/TESTING.md](docs/TESTING.md).
- **Strings** — every user-facing string through `t()`, with keys in both `en` and `fr` (`pnpm run i18n:check`).
- **Images** — run `pnpm run images:optimize` after adding assets (`pnpm run images:check` gates CI).
- **Native changes** — a new/removed/upgraded native package or config plugin needs a `version` bump in `package.json` and a dev-client rebuild.
- **Docs** — update `CLAUDE.md`, `DESIGN.md`, `README.md` or `docs/` in the same PR.

## Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/).

```
type(scope?): description
```

### Allowed Types

| Type | Purpose |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `update` | Update existing functionality |
| `docs` | Documentation only |
| `style` | Code style (formatting, semicolons, etc) |
| `refactor` | Code refactoring |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `build` | Build system or dependencies |
| `ci` | CI configuration |
| `chore` | Maintenance tasks |
| `revert` | Revert a previous commit |
| `improve` | Improvement without new feature or fix |

### Examples

```bash
fix: fixed a minor bug in btn
update: updated login screen layout
feat(auth): add biometric login
chore(deps): update dev dependencies
docs: changes in md files
```

## Pull Requests

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes following the convention above
4. Push to the branch (`git push origin feat/my-feature`)
5. Open a Pull Request


## Perfect Score
[![React Doctor](https://www.react.doctor/share/badge?p=react-native-expo-starter-kit&s=100&w=0&f=0)](https://www.react.doctor/share?p=react-native-expo-starter-kit&s=100&w=0&f=0)

<img width="592" height="759" alt="image" src="https://github.com/user-attachments/assets/f93166a4-f0d4-4fe6-8968-0de1785fd96d" />


## Reporting Bugs

Open an issue with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Device/OS/browser info

## Requesting Features

Open an issue with:
- Clear description of the feature
- Use case
- Any implementation ideas
