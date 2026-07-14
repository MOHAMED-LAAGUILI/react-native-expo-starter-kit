# Contributing to React Native Starter Kit

Thank you for considering contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/MOHAMED-LAAGUILI/react-native-starter-kit.git
cd react-native-starter-kit
bun install
bun dev
```

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
```

## Pull Requests

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes following the convention above
4. Push to the branch (`git push origin feat/my-feature`)
5. Open a Pull Request

## Code Style

- Use `bun run lint:fix` to auto-fix lint issues
- Use `bun run type:check` to verify types
- Use `bun run doctor` to check for dependency issues
- All PRs must pass the pre-commit hooks

## perfect score 
Use `bun run checks` to verify everything
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
