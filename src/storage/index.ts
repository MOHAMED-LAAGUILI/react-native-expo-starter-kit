import { createMMKV, existsMMKV } from 'react-native-mmkv';
import { isWeb } from '@/utils/platform';

type StorageBackend = ReturnType<typeof createMMKVBackend> | ReturnType<typeof createWebBackend> | null;

function createMMKVBackend(id: string) {
  try {
    if (!existsMMKV?.(id))
      createMMKV({ id });

    const instance = createMMKV({ id });

    return {
      clearAll: () => instance.clearAll(),
      contains: (key: string) => instance.contains(key),
      getAllKeys: () => instance.getAllKeys() as string[],
      getString: (key: string) => instance.getString(key) as string | undefined,
      remove: (key: string) => instance.remove(key),
      set: (key: string, value: string) => instance.set(key, value),
    };
  }
  catch {
    return null;
  }
}

function createWebBackend(id: string) {
  if (!isWeb)
    return null;
  try {
    const prefix = `${id}.`;
    return {
      clearAll: () => {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
        for (const k of keys) localStorage.removeItem(k);
      },
      contains: (key: string) => localStorage.getItem(prefix + key) !== null,
      getAllKeys: () =>
        Object.keys(localStorage)
          .filter(k => k.startsWith(prefix))
          .map(k => k.slice(prefix.length)),
      getString: (key: string) => localStorage.getItem(prefix + key) ?? undefined,
      remove: (key: string) => localStorage.removeItem(prefix + key),
      set: (key: string, value: string) => localStorage.setItem(prefix + key, value),
    };
  }
  catch {
    return null;
  }
}

function createStorageBackend(id: string): StorageBackend {
  if (isWeb)
    return createWebBackend(id);
  return createMMKVBackend(id);
}

function createStore(id: string) {
  const backend = createStorageBackend(id);

  return {
    clearAll(): void {
      backend?.clearAll();
    },

    getAllKeys(): string[] {
      return backend?.getAllKeys() ?? [];
    },

    getItem<T>(key: string): T | null {
      if (!backend)
        return null;
      const raw = backend.getString(key);
      if (raw == null)
        return null;
      try {
        return JSON.parse(raw) as T;
      }
      catch {
        return raw as unknown as T;
      }
    },

    removeItem(key: string): void {
      backend?.remove(key);
    },

    setItem<T>(key: string, value: T): void {
      if (!backend)
        return;
      const json = JSON.stringify(value);
      if (!backend.contains(key) || backend.getString(key) !== json) {
        backend.set(key, json);
      }
    },
    get status() {
      const alive = backend !== null;
      return {
        alive,
        driver: isWeb ? 'web' : alive ? 'mmkv' : 'none',
        id,
        keyCount: backend?.getAllKeys().length ?? 0,
      };
    },
  };
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
