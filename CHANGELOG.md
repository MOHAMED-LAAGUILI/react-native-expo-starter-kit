# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-07-11

### Added
- Husky git hooks (pre-commit, commit-msg)
- Conventional commit validation
- EAS workflow scripts for iOS and Android builds
- APK and IPA generation scripts
- App icon badge plugin
- Toast notification system
- Accent color system with 7 palettes

### Changed
- Updated to Expo SDK 57
- Updated to React Native 0.86
- Updated to React 19
- Migrated to Tailwind CSS v4 with Uniwind
- Migrated to Zustand 5 with MMKV persistence
- Migrated to TanStack Query 5

### Fixed
- Type errors from react-navigation-header-buttons
- Prebuild failures with missing PNG assets
- Settings screen i18n support
