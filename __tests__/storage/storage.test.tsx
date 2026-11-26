/**
 * StorageService on native (expo-secure-store, mocked as an in-memory
 * keychain in __tests__/setup/rn-mocks.js).
 */
import * as SecureStore from 'expo-secure-store';

type MockedSecureStore = typeof SecureStore & { __store: Map<string, string> };
const keychain = (SecureStore as MockedSecureStore).__store;

// A fresh module per test: the wrapper caches reads in memory.
function loadStorage() {
  let service!: typeof import('@/storage').StorageService;
  jest.isolateModules(() => {
    service = require('@/storage').StorageService;
  });
  return service;
}

describe('StorageService (secure-store)', () => {
  beforeEach(() => {
    keychain.clear();
    jest.clearAllMocks();
  });

  it('round-trips JSON values under a namespaced key', () => {
    const storage = loadStorage();
    storage.auth.setItem('auth.user', { id: '1', name: 'Demo' });
    expect(storage.auth.getItem('auth.user')).toEqual({ id: '1', name: 'Demo' });
    expect(keychain.get('app-auth.auth.user')).toBe(JSON.stringify({ id: '1', name: 'Demo' }));
  });

  it('writes asynchronously, never with the blocking setItem', () => {
    const storage = loadStorage();
    storage.theme.setItem('theme.mode', 'dark');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('app-theme.theme.mode', '"dark"');
    expect(SecureStore.setItem).not.toHaveBeenCalled();
  });

  it('reads what a previous launch persisted', () => {
    keychain.set('app-onboarding.onboarding.complete', 'true');
    expect(loadStorage().onboarding.getItem('onboarding.complete')).toBe(true);
  });

  it('caches reads: one keychain read per key per launch', () => {
    const storage = loadStorage();
    storage.i18n.getItem('i18n.language');
    storage.i18n.getItem('i18n.language');
    expect(SecureStore.getItem).toHaveBeenCalledTimes(1);
  });

  it('skips the write when the value is unchanged', () => {
    const storage = loadStorage();
    storage.theme.setItem('theme.mode', 'light');
    (SecureStore.setItemAsync as jest.Mock).mockClear();
    storage.theme.setItem('theme.mode', 'light');
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it('removes values and keeps them gone', () => {
    const storage = loadStorage();
    storage.auth.setItem('auth.token', 'abc');
    storage.auth.removeItem('auth.token');
    expect(storage.auth.getItem('auth.token')).toBeNull();
    expect(keychain.has('app-auth.auth.token')).toBe(false);
  });

  it('tracks keys for getAllKeys / clearAll, which SecureStore cannot enumerate', () => {
    const storage = loadStorage();
    storage.auth.setItem('auth.token', 'abc');
    storage.auth.setItem('auth.refresh_token', 'def');
    expect(storage.auth.getAllKeys()).toEqual(['auth.refresh_token', 'auth.token']);
    expect(storage.auth.status).toEqual(expect.objectContaining({ driver: 'secure-store', keyCount: 2 }));

    storage.auth.clearAll();
    expect(storage.auth.getAllKeys()).toEqual([]);
    expect(storage.auth.getItem('auth.token')).toBeNull();
  });

  it('rejects keys SecureStore would refuse', () => {
    expect(() => loadStorage().auth.setItem('bad key!', 1)).toThrow(/invalid key/);
  });

  describe('fresh iOS install (Keychain outlives the app)', () => {
    // eslint-disable-next-line ts/no-require-imports -- the mock's test handle
    const files: Set<string> = require('expo-file-system').__files;
    const MARKER = 'document/.secure-store-installed';

    afterEach(() => {
      files.add(MARKER);
    });

    it('drops values a previous install left behind', () => {
      keychain.set('app-auth.__keys', JSON.stringify(['auth.token']));
      keychain.set('app-auth.auth.token', '"stale-token"');
      files.delete(MARKER);

      const storage = loadStorage();
      expect(storage.auth.getItem('auth.token')).toBeNull();
      expect(keychain.has('app-auth.auth.token')).toBe(false);
      expect(files.has(MARKER)).toBe(true);
    });

    it('keeps values on a normal relaunch', () => {
      keychain.set('app-auth.__keys', JSON.stringify(['auth.token']));
      keychain.set('app-auth.auth.token', '"live-token"');
      expect(loadStorage().auth.getItem('auth.token')).toBe('live-token');
    });
  });

  it('degrades to "no value" when the keychain read fails', () => {
    (SecureStore.getItem as jest.Mock).mockImplementationOnce(() => {
      throw new Error('keychain locked');
    });
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(loadStorage().auth.getItem('auth.token')).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
