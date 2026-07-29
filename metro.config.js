process.env.EXPO_ROUTER_APP_ROOT = './app';
process.env.EXPO_ROUTER_IMPORT_MODE = 'sync';

const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withUniwindConfig(config, {
  cssEntryFile: './global.css',
  dtsFile: './uniwind-types.d.ts',
});
