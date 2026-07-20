// Small status/label badge with semantic tones.
import { memo } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useThemedStyles } from '@/hooks';

import { createBadgeStyles } from './Badge.styles';

// Semantic tone of the badge.
export type BadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

// Props for the Badge component.
export interface BadgeProps {
  // Text label shown inside the badge.
  label: string;
  // Semantic tone controlling background and text color.
  tone?: BadgeTone;
}

// Renders a compact themed badge.
function BadgeComponent({ label, tone = 'primary' }: BadgeProps) {
  const styles = useThemedStyles(createBadgeStyles);

  return (
    <View style={[styles.base, styles[`tone_${tone}`]]}>
      <Text variant="overline" style={styles[`text_${tone}`]}>
        {label}
      </Text>
    </View>
  );
}

// Memoized themed badge.
export const Badge = memo(BadgeComponent);
