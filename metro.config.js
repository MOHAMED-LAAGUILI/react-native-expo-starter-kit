process.env.EXPO_ROUTER_APP_ROOT = './app';
process.env.EXPO_ROUTER_IMPORT_MODE = 'sync';

const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

// Expo CLI defaults `useWatchman` to false, so on Windows Metro falls back to
// Node's fs.watch and dies with "EMFILE: too many open files, watch" on large
// trees. Watchman is a documented prerequisite for this template (see README).
config.resolver.useWatchman = true;

// Never crawl/watch native build output or VCS internals from the project root.
const escapeForRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const rootDir = escapeForRegExp(__dirname);
const blockedPatterns = [
  config.resolver.blockList,
  new RegExp(`^${rootDir}[\\\\/](android|ios|dist|build)[\\\\/].*`),
  new RegExp(`^${rootDir}[\\\\/]\\.git[\\\\/].*`),
].flat().filter(Boolean);
config.resolver.blockList = new RegExp(
  blockedPatterns.map(pattern => (pattern instanceof RegExp ? pattern.source : pattern)).join('|'),
);

// Metro reads/writes its transform cache with unbounded fs.promises
// concurrency; on Windows a large rebundle exhausts file handles and dies with
// "EMFILE: too many open files, open ...metro-cache...". Bound the concurrency
// and retry EMFILE bursts instead.
const MAX_CONCURRENT_CACHE_OPS = 64;

class BoundedCacheStore {
  #store;
  #active = 0;
  #queue = [];

  constructor(store) {
    this.#store = store;
  }

  get(key) {
    return this.#run(() => this.#store.get(key));
  }

  set(key, value) {
    return this.#run(() => this.#store.set(key, value));
  }

  clear() {
    return this.#store.clear();
  }

  async #run(operation) {
    if (this.#active >= MAX_CONCURRENT_CACHE_OPS) {
      await new Promise(resolve => this.#queue.push(resolve));
    }
    this.#active++;
    try {
      // Retry EMFILE within the held slot — re-acquiring here could deadlock.
      for (let attempt = 0; ; attempt++) {
        try {
          return await operation();
        }
        catch (error) {
          if (error?.code !== 'EMFILE' || attempt >= 3) {
            throw error;
          }
          await new Promise(resolve => setTimeout(resolve, 50 * (attempt + 1)));
        }
      }
    }
    finally {
      this.#active--;
      this.#queue.shift()?.();
    }
  }
}

if (Array.isArray(config.cacheStores)) {
  config.cacheStores = config.cacheStores.map(store => new BoundedCacheStore(store));
}

module.exports = withUniwindConfig(config, {
  cssEntryFile: './global.css',
  dtsFile: './uniwind-types.d.ts',
});
