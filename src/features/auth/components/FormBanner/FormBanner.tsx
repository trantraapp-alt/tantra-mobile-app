// Inline status banner for auth forms: a tinted row with an icon and message,
// accented on the left by the variant color (error or success).
import { AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { memo } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';

import { createFormBannerStyles } from './FormBanner.styles';

// Visual tone of the banner.
export type FormBannerVariant = 'error' | 'success';

// Props for the FormBanner component.
export interface FormBannerProps {
  // Banner tone controlling the icon and accent color.
  variant: FormBannerVariant;
  // Message text shown in the banner.
  message: string;
}

// Renders an accented inline form banner.
function FormBannerComponent({ variant, message }: FormBannerProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createFormBannerStyles);
  const isError = variant === 'error';
  const Icon = isError ? AlertCircle : CheckCircle2;
  const accent = isError ? theme.colors.danger : theme.colors.success;

  return (
    <View style={[styles.base, { borderLeftColor: accent }]}>
      <Icon size={theme.sizing.iconMd} color={accent} />
      <Text variant="caption" color="textSecondary" style={styles.text}>
        {message}
      </Text>
    </View>
  );
}

// Memoized inline form banner.
export const FormBanner = memo(FormBannerComponent);
