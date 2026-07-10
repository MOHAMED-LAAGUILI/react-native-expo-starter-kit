module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
    ],
    plugins: [
      [
        'babel-plugin-module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@assets': './assets',
          },
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json',
          ],
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
