// Babel configuration for Expo Router, NativeWind, Tamagui and Reanimated.
module.exports = function babelConfig(api) {
  api.cache(true);

  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      [
        '@tamagui/babel-plugin',
        {
          components: ['tamagui'],
          config: './tamagui.config.ts',
          logTimings: true,
          disableExtraction: process.env.NODE_ENV === 'development',
        },
      ],
      // Note: babel-preset-expo automatically appends react-native-reanimated/plugin
      // (kept last) when the package is installed, so it is not listed manually here.
    ],
  };
};
