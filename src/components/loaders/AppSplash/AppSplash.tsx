// Full-screen loading state shown during store rehydration and bootstrap.
// Resolves the theme independently since it renders outside ThemeProvider.
import { Image } from 'expo-image';
import { useMemo } from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';

import { themes } from '@/theme';

import { createSplashStyles } from './AppSplash.styles';

// Static reference to the bundled brand logo asset.
const logoSource = require('../../../assets/images/logo.png');

// Renders the brand logo and a spinner on a theme-appropriate background.
export function AppSplash() {
  const scheme = useColorScheme();
  const theme = themes[scheme === 'dark' ? 'dark' : 'light'];
  const styles = useMemo(() => createSplashStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Image
        source={logoSource}
        style={styles.logo}
        contentFit="cover"
        accessibilityLabel="Tantra"
      />
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}
