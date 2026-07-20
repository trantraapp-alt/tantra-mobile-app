// Tamagui runtime configuration built on the default v4 config.
import { defaultConfig } from '@tamagui/config/v4';
import { createTamagui } from 'tamagui';

// Tamagui design system instance shared across the app.
export const tamaguiConfig = createTamagui(defaultConfig);

export type AppTamaguiConfig = typeof tamaguiConfig;

declare module 'tamagui' {
  // Registers the app configuration type with Tamagui.
  interface TamaguiCustomConfig extends AppTamaguiConfig {}
}

export default tamaguiConfig;
