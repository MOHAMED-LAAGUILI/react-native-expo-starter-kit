/**
 * Mocks for native modules the `rn` project would otherwise try to load.
 * Keep this list to libraries the app actually uses; prefer jest-expo's
 * built-in Expo module mocks and the libraries' own Jest setups.
 */

// Reanimated 4 / Worklets run their JS implementations under Jest via the
// `resolver` in jest.config.js — no mock module needed here.

// Uniwind resolves `className` at bundle time through Metro, which Jest does
// not run. Components still render; only the theme hook needs a value.
jest.mock('uniwind', () => {
  const actual = jest.requireActual('uniwind');
  return {
    ...actual,
    useUniwind: () => ({ theme: 'light', hasAdaptiveThemes: true }),
    Uniwind: { ...actual.Uniwind, setTheme: jest.fn(), updateCSSVariables: jest.fn() },
  };
});

// expo-file-system (new File API): an in-memory set of existing paths.
// `__files` lets a test simulate a fresh install by clearing it.
jest.mock('expo-file-system', () => {
  const files = new Set(['document/.secure-store-installed']);
  class File {
    constructor(dir, name) {
      this.uri = `${dir?.uri ?? dir}/${name}`;
    }

    get exists() {
      return files.has(this.uri);
    }

    create() {
      files.add(this.uri);
    }
  }
  return { __files: files, File, Paths: { document: { uri: 'document' }, cache: { uri: 'cache' } } };
});

// expo-secure-store: an in-memory keychain shared by sync and async calls.
// Tests can inspect or reset it through `require('expo-secure-store').__store`.
jest.mock('expo-secure-store', () => {
  const store = new Map();
  return {
    __store: store,
    AFTER_FIRST_UNLOCK: 0,
    WHEN_UNLOCKED: 2,
    isAvailableAsync: jest.fn(async () => true),
    getItem: jest.fn(key => (store.has(key) ? store.get(key) : null)),
    setItem: jest.fn((key, value) => {
      store.set(key, value);
    }),
    getItemAsync: jest.fn(async key => (store.has(key) ? store.get(key) : null)),
    setItemAsync: jest.fn(async (key, value) => {
      store.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key) => {
      store.delete(key);
    }),
  };
});
