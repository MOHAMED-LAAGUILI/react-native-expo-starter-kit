import { File, Paths } from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import { isIOS, isWeb } from '@/utils/platform';

/**
 * Persistent key/value storage.
 *
 *   iOS / Android  expo-secure-store — iOS Keychain / Android Keystore-backed
 *                  encrypted SharedPreferences. Every value is encrypted at rest.
 *   Web            localStorage (SecureStore has no web implementation).
 *
 * The API stays synchronous so stores can hydrate in a lazy `useState`
 * initializer and the Axios interceptor can read the token inline:
 *   - reads go through an in-memory cache, filled on first access with the
 *     synchronous `SecureStore.getItem` (one keychain read per key per launch);
 *   - writes update the cache immediately and persist with `setItemAsync`
 *     (non-blocking — the sync `setItem` would block the JS thread).
 *
 * SecureStore cannot enumerate its keys, so each namespace also keeps a small
 * key index (`<namespace>.__keys`) for `getAllKeys()` / `clearAll()`.
 *
 * Limits to keep in mind: keys may only contain `[A-Za-z0-9._-]`, and some iOS
 * versions reject values larger than ~2 KB — store tokens and small settings
 * here, not caches or lists (use the TanStack Query cache or the file system).
 *
 * iOS reinstalls: the Keychain survives uninstalling the app, so a reinstall
 * would resurrect the previous user's tokens and skip onboarding. A marker
 * file in the app's document directory (wiped on uninstall) detects the first
 * launch of a fresh install, and that launch starts from empty storage.
 */

type Backend = {
  read: (key: string) => string | null;
  write: (key: string, value: string) => void;
  remove: (key: string) => void;
};

const KEY_PATTERN = /^[\w.-]+$/;

function warn(action: string, key: string, error: unknown) {
  console.warn(`[storage] ${action} "${key}" failed:`, error);
}

function createSecureStoreBackend(): Backend {
  return {
    read: (key) => {
      try {
        return SecureStore.getItem(key);
      }
      catch (error) {
        warn('read', key, error);
        return null;
      }
    },
    write: (key, value) => {
      SecureStore.setItemAsync(key, value).catch(error => warn('write', key, error));
    },
    remove: (key) => {
      SecureStore.deleteItemAsync(key).catch(error => warn('delete', key, error));
    },
  };
}

function createWebBackend(): Backend {
  const available = typeof localStorage !== 'undefined';
  return {
    read: key => (available ? localStorage.getItem(key) : null),
    write: (key, value) => {
      if (available)
        localStorage.setItem(key, value);
    },
    remove: (key) => {
      if (available)
        localStorage.removeItem(key);
    },
  };
}

let sharedBackend: Backend | null = null;
let freshInstall: boolean | null = null;

/** Created on first use, so importing this module never touches native code (SSR / tests). */
function backend(): Backend {
  sharedBackend ??= isWeb ? createWebBackend() : createSecureStoreBackend();
  return sharedBackend;
}

/** iOS only: true on the first launch after (re)installing — see the note at the top. */
function isFreshInstall(): boolean {
  if (freshInstall !== null)
    return freshInstall;
  freshInstall = false;
  if (!isIOS)
    return freshInstall;
  try {
    const marker = new File(Paths.document, '.secure-store-installed');
    if (!marker.exists) {
      freshInstall = true;
      marker.create();
    }
  }
  catch (error) {
    warn('install-marker', '.secure-store-installed', error);
  }
  return freshInstall;
}

function parseKeyList(raw: string | null | undefined): string[] {
  try {
    return raw ? (JSON.parse(raw) as string[]) : [];
  }
  catch {
    return [];
  }
}

/** Per-namespace plumbing: read cache, key validation, key index, fresh-install cleanup. */
function createNamespace(namespace: string) {
  const cache = new Map<string, string | null>();
  const indexKey = `${namespace}.__keys`;
  let initialized = false;
  const fullKey = (key: string) => {
    if (!KEY_PATTERN.test(key))
      throw new Error(`[storage] invalid key "${key}": only letters, digits, ".", "-" and "_" are allowed`);
    return `${namespace}.${key}`;
  };

  /** On a fresh iOS install, drop whatever a previous install left in the Keychain. */
  function init() {
    if (initialized)
      return;
    initialized = true;
    if (!isFreshInstall())
      return;
    const raw = backend().read(indexKey);
    for (const key of parseKeyList(raw).filter(k => KEY_PATTERN.test(k))) {
      cache.set(`${namespace}.${key}`, null);
      backend().remove(`${namespace}.${key}`);
    }
    cache.set(indexKey, null);
    if (raw != null)
      backend().remove(indexKey);
  }

  function readRaw(key: string): string | null {
    init();
    const full = fullKey(key);
    if (!cache.has(full))
      cache.set(full, backend().read(full));
    return cache.get(full) ?? null;
  }

  function readIndex(): string[] {
    init();
    if (!cache.has(indexKey))
      cache.set(indexKey, backend().read(indexKey));
    return parseKeyList(cache.get(indexKey));
  }

  function writeIndex(keys: string[]) {
    const json = JSON.stringify([...new Set(keys)].sort());
    cache.set(indexKey, json);
    backend().write(indexKey, json);
  }

  return { cache, fullKey, readRaw, readIndex, writeIndex };
}

function createStore(namespace: string) {
  const { cache, fullKey, readRaw, readIndex, writeIndex } = createNamespace(namespace);

  const store = {
    getItem<T>(key: string): T | null {
      const raw = readRaw(key);
      if (raw == null)
        return null;
      try {
        return JSON.parse(raw) as T;
      }
      catch {
        return raw as unknown as T;
      }
    },

    setItem<T>(key: string, value: T): void {
      const json = JSON.stringify(value);
      if (readRaw(key) === json)
        return;
      const full = fullKey(key);
      cache.set(full, json);
      backend().write(full, json);
      const keys = readIndex();
      if (!keys.includes(key))
        writeIndex([...keys, key]);
    },

    removeItem(key: string): void {
      const full = fullKey(key);
      cache.set(full, null);
      backend().remove(full);
      const keys = readIndex();
      if (keys.includes(key))
        writeIndex(keys.filter(k => k !== key));
    },

    getAllKeys(): string[] {
      return readIndex().filter(key => readRaw(key) != null);
    },

    clearAll(): void {
      for (const key of readIndex()) {
        const full = fullKey(key);
        cache.set(full, null);
        backend().remove(full);
      }
      writeIndex([]);
    },

    get status() {
      return {
        alive: true,
        driver: isWeb ? 'web' : 'secure-store',
        id: namespace,
        keyCount: store.getAllKeys().length,
      };
    },
  };

  return store;
}

export const StorageService = {
  auth: createStore('app-auth'),

  contains(key: string): boolean {
    return (
      this.auth.getItem(key) !== null
      || this.theme.getItem(key) !== null
      || this.i18n.getItem(key) !== null
      || this.onboarding.getItem(key) !== null
    );
  },

  getAllStores(): Array<{ id: string; status: ReturnType<typeof createStore>['status'] }> {
    return [
      { id: 'app-auth', status: this.auth.status },
      { id: 'app-theme', status: this.theme.status },
      { id: 'app-i18n', status: this.i18n.status },
      { id: 'app-onboarding', status: this.onboarding.status },
    ];
  },

  getItem<T>(key: string): T | null {
    return (
      this.auth.getItem<T>(key)
      ?? this.theme.getItem<T>(key)
      ?? this.i18n.getItem<T>(key)
      ?? this.onboarding.getItem<T>(key)
    );
  },
  i18n: createStore('app-i18n'),
  onboarding: createStore('app-onboarding'),
  theme: createStore('app-theme'),
};
