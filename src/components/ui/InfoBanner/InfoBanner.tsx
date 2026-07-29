// A reusable inline alert / info callout: a tinted, left-accented row with a
// tone icon and an optional title above the message. Use it for non-blocking
// guidance and status notes inside a screen or form.
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  type LucideIcon,
} from 'lucide-react-native';
import { memo } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';
import type { AppTheme } from '@/theme';

import { createInfoBannerStyles } from './InfoBanner.styles';

// Visual tone controlling the icon and accent color.
export type InfoBannerTone = 'info' | 'success' | 'warning' | 'danger';

// Props for the InfoBanner component.
export interface InfoBannerProps {
  // Tone controlling the icon and accent color (defaults to info).
  tone?: InfoBannerTone;
  // Optional bold heading shown above the message.
  title?: string;
  // The message body.
  message: string;
}

// Resolves the icon and accent color for a tone.
function resolveTone(
  theme: AppTheme,
  tone: InfoBannerTone,
): { icon: LucideIcon; color: string } {
  switch (tone) {
    case 'success':
      return { icon: CheckCircle2, color: theme.colors.success };
    case 'warning':
      return { icon: AlertTriangle, color: theme.colors.warning };
    case 'danger':
      return { icon: AlertCircle, color: theme.colors.danger };
    default:
      return { icon: Info, color: theme.colors.info };
  }
}

// Renders an inline info/alert banner.
function InfoBannerComponent({ tone = 'info', title, message }: InfoBannerProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createInfoBannerStyles);
  const { icon: Icon, color } = resolveTone(theme, tone);

  return (
    <View style={[styles.base, { borderLeftColor: color }]}>
      <Icon size={theme.sizing.iconMd} color={color} />
      <View style={styles.text}>
        {title ? (
          <Text variant="label" color="textPrimary">
            {title}
          </Text>
        ) : null}
        <Text variant="caption" color="textSecondary">
          {message}
        </Text>
      </View>
    </View>
  );
}

// Memoized inline info banner.
export const InfoBanner = memo(InfoBannerComponent);
