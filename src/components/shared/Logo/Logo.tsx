// Renders the Tantra brand logo as a rounded app-icon tile.
import { Image } from 'expo-image';
import { memo } from 'react';

import { useThemedStyles } from '@/hooks';

import { createLogoStyles } from './Logo.styles';

// Static reference to the bundled brand logo asset.
const logoSource = require('../../../assets/images/logo.png');

// Props for the Logo component.
export interface LogoProps {
  // Rendered width/height of the square logo tile.
  size?: number;
}

// Renders the brand logo tile.
function LogoComponent({ size = 96 }: LogoProps) {
  const styles = useThemedStyles(createLogoStyles);

  return (
    <Image
      source={logoSource}
      style={[styles.logo, { width: size, height: size, borderRadius: size * 0.24 }]}
      contentFit="cover"
      accessibilityLabel="Tantra logo"
    />
  );
}

// Memoized brand logo tile.
export const Logo = memo(LogoComponent);
