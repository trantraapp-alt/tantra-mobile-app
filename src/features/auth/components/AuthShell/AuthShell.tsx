// Shared branded layout for auth screens: a violet gradient hero (brand logo,
// wordmark and optional tagline) over an elevated, scrollable form sheet. Login,
// Register and the password screens all render through this so the auth flow
// stays visually symmetric. The `compact` mode tightens the hero and sheet for
// dense forms so they fit without scrolling on typical devices.
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/buttons';
import { BrandGradient, Logo } from '@/components/shared';
import { Text } from '@/components/ui';
import { useBottomInset, useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';
import type { TypographyVariant } from '@/theme';

import { createAuthShellStyles } from './AuthShell.styles';

// Props for the AuthShell layout.
export interface AuthShellProps {
  // Sheet heading (e.g. "Welcome back").
  title: string;
  // Supporting line under the sheet heading.
  subtitle: string;
  // Brand tagline shown in the hero (hidden in compact mode).
  tagline?: string;
  // Uses a shorter hero and tighter sheet spacing for longer forms.
  compact?: boolean;
  // When provided, renders a back button over the hero.
  onBack?: () => void;
  // Form content rendered inside the sheet, below the heading.
  children: ReactNode;
}

// Default hero tagline shared across auth screens.
const DEFAULT_TAGLINE = 'The Smart Way to Buy & Sell';

// Renders the shared auth layout with a gradient hero and a form sheet.
export function AuthShell({
  title,
  subtitle,
  tagline = DEFAULT_TAGLINE,
  compact = false,
  onBack,
  children,
}: AuthShellProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createAuthShellStyles);
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomInset();
  const { width, height } = useWindowDimensions();

  // Compact mode trades hero size and spacing for a taller form area.
  const logoSize = compact ? theme.sizing.avatarMd : theme.sizing.avatarLg;
  const tileSize = logoSize + (compact ? theme.spacing.md : theme.spacing.lg);
  const wordmarkVariant: TypographyVariant = compact ? 'h3' : 'h2';

  // The sheet is pulled up over the hero by this much; the hero must reserve it
  // as bottom padding so the logo and wordmark are never covered. In compact
  // mode the hero hugs its content, so an extra breathing gap is added here to
  // keep the wordmark clear of the sheet (the full hero gets that room from its
  // larger height instead).
  const overlap = theme.radius.xxl;
  const heroPaddingBottom = overlap + (compact ? theme.spacing.xxl : 0);
  // Generous top padding keeps the logo clear of the status bar; a comfortable
  // gap separates the logo, wordmark and tagline.
  const heroPaddingTop =
    insets.top + (compact ? theme.spacing.xl : theme.spacing.xxl);
  const heroGap = theme.spacing.md;

  // Height the hero content actually needs, so it fits above the overlap band
  // (tile + wordmark + optional tagline + the gaps between them).
  const wordmarkLine = compact
    ? theme.lineHeight.xl
    : theme.lineHeight.xxl;
  const taglineLine = compact ? 0 : theme.lineHeight.sm;
  const heroGapCount = compact ? 1 : 2;
  const heroContentHeight =
    tileSize + wordmarkLine + taglineLine + heroGap * heroGapCount;
  const heroNeededHeight =
    heroPaddingTop + heroContentHeight + heroPaddingBottom;
  // Compact hugs its content; the full hero is more expressive but never
  // shorter than what the content needs.
  const heroHeight = compact
    ? heroNeededHeight
    : Math.max(heroNeededHeight, insets.top + Math.round(height * 0.3));

  const cardPaddingTop = compact ? theme.spacing.xl : theme.spacing.xxl;
  const cardGap = compact ? theme.spacing.lg : theme.spacing.xl;

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View
            style={[
              styles.hero,
              {
                height: heroHeight,
                paddingTop: heroPaddingTop,
                paddingBottom: heroPaddingBottom,
                gap: heroGap,
              },
            ]}
          >
            <BrandGradient width={width} height={heroHeight} />

            {onBack ? (
              <IconButton
                icon={ChevronLeft}
                accessibilityLabel="Go back"
                color={theme.colors.onPrimary}
                onPress={onBack}
                style={[styles.backButton, { top: insets.top + theme.spacing.xs }]}
              />
            ) : null}

            <View
              style={[styles.logoTile, { width: tileSize, height: tileSize }]}
            >
              <Logo size={logoSize} />
            </View>

            <Text variant={wordmarkVariant} color="onPrimary">
              Tantra
            </Text>
            {compact ? null : (
              <Text variant="label" color="onPrimary" style={styles.heroTagline}>
                {tagline}
              </Text>
            )}
          </View>

          <View
            style={[
              styles.card,
              {
                paddingTop: cardPaddingTop,
                gap: cardGap,
                paddingBottom: bottomInset + theme.spacing.xl,
              },
            ]}
          >
            <View style={styles.headingBlock}>
              <Text variant="h2">{title}</Text>
              <Text variant="body" color="textSecondary">
                {subtitle}
              </Text>
            </View>

            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
