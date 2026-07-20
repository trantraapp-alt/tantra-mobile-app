// Themed text primitive mapping typography variants and semantic colors.
import { memo } from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useThemedStyles } from '@/hooks';
import type { ColorScheme } from '@/theme';
import type { TypographyVariant } from '@/theme';

import { createTextStyles } from './Text.styles';

// Semantic text color keys resolvable from the theme color scheme.
type TextColor = Extract<
  keyof ColorScheme,
  | 'textPrimary'
  | 'textSecondary'
  | 'textTertiary'
  | 'textInverse'
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success'
  | 'warning'
  | 'onPrimary'
>;

// Props for the themed Text component.
export interface TextProps extends RNTextProps {
  // Typography variant controlling size, weight and line height.
  variant?: TypographyVariant;
  // Semantic color key resolved from the theme.
  color?: TextColor;
  // Text alignment.
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  // Text content.
  children: React.ReactNode;
}

// Renders themed text using a typography variant and semantic color.
function TextComponent({
  variant = 'body',
  color = 'textPrimary',
  align = 'left',
  style,
  children,
  ...rest
}: TextProps) {
  const styles = useThemedStyles(createTextStyles);

  return (
    <RNText
      style={[
        styles.base,
        styles[variant],
        styles[color],
        styles[align],
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

// Memoized themed text primitive.
export const Text = memo(TextComponent);
