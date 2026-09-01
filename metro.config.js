process.env.EXPO_ROUTER_APP_ROOT = './app';
process.env.EXPO_ROUTER_IMPORT_MODE = 'sync';

const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

// Expo CLI defaults `useWatchman` to false, so on Windows Metro falls back to
// Node's fs.watch and dies with "EMFILE: too many open files, watch" on large
// trees. Watchman is a documented prerequisite for this template.
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

module.exports = withUniwindConfig(config, {
  cssEntryFile: './global.css',
  dtsFile: './uniwind-types.d.ts',
});
