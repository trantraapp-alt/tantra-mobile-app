// Metro bundler configuration wired for NativeWind and Tamagui.
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

module.exports = withNativeWind(config, {
  input: './src/theme/global.css',
  inlineRem: 16,
});
