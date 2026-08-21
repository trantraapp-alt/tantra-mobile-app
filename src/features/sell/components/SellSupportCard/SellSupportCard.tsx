// Closing card of a sell surface: a quiet offer of help for a seller who isn't
// sure where their listing belongs, with a single call to action. Tinted in the
// surface's accent so it reads as part of the page rather than an advert bolted
// to the end of it.
//
// Two shapes, one card. `button` ends in a solid accent pill and closes the
// module's category screen. `link` turns the whole card into one tap that ends
// in a round chevron — on the sell sheet the module cards are what the eye
// should land on, and a filled button below them competes for that.
//
// The icon and copy are overridable so the sheet can ask its own question
// ("Not sure what to sell?") without a second component.
import {
  ChevronRight,
  Headphones,
  type LucideIcon,
  MessageCircle,
} from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';

import { type AccentKey, getAccentColors } from '../../utils';
import { createSellSupportCardStyles } from './SellSupportCard.styles';

// How the card's call to action is drawn.
export type SellSupportCardVariant = 'button' | 'link';

// Props for the SellSupportCard component.
export interface SellSupportCardProps {
  // Accent tinting the card and its action (the owning module's colour).
  accent?: AccentKey;
  // Icon in the round tile (defaults to the support headset).
  icon?: LucideIcon;
  // Heading (defaults to "Need help choosing?").
  title?: string;
  // Supporting line under the heading.
  description?: string;
  // Label on the call to action.
  actionLabel?: string;
  // Whether the action is a solid pill or the whole card (defaults to the pill).
  variant?: SellSupportCardVariant;
  // Called when the support action is pressed.
  onPress: () => void;
}

// Renders the "need help?" support card.
function SellSupportCardComponent({
  accent = 'primary',
  icon: Icon = Headphones,
  title,
  description,
  actionLabel,
  variant = 'button',
  onPress,
}: SellSupportCardProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createSellSupportCardStyles);
  const { t } = useTranslation();
  const colors = getAccentColors(theme, accent);
  const label = actionLabel ?? t('sell.supportAction');

  // The accent's pale ground, edged in its firmer tint.
  const surface = {
    backgroundColor: colors.surface,
    borderColor: colors.soft,
  };

  // Icon and copy, shared by both shapes.
  const body = (
    <>
      <View style={[styles.iconTile, { backgroundColor: colors.soft }]}>
        <Icon size={theme.sizing.iconMd} color={colors.strong} />
      </View>

      <View style={styles.labels}>
        <Text variant="label">{title ?? t('sell.supportTitle')}</Text>
        <Text variant="caption" color="textSecondary">
          {description ?? t('sell.supportDesc')}
        </Text>
      </View>
    </>
  );

  if (variant === 'link') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
      >
        {({ pressed }) => (
          // Styling lives on this inner View (a static array), not the
          // Pressable's function `style`, which NativeWind's cssInterop would
          // drop along with the card's tint.
          <View
            style={[styles.card, surface, pressed ? styles.pressed : null]}
          >
            {body}
            <View style={[styles.chevron, { backgroundColor: colors.soft }]}>
              <ChevronRight
                size={theme.sizing.iconSm}
                color={colors.strong}
              />
            </View>
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, surface]}>
      {body}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
      >
        {({ pressed }) => (
          <View
            style={[
              styles.action,
              // The deep shade rather than the saturated fill: this pill
              // carries white text, and only the deep shade is dark enough
              // to hold it on every accent.
              { backgroundColor: colors.strong },
              pressed ? styles.pressed : null,
            ]}
          >
            <MessageCircle
              size={theme.sizing.iconSm}
              color={theme.colors.onPrimary}
            />
            <Text
              variant="label"
              numberOfLines={1}
              style={{ color: theme.colors.onPrimary }}
            >
              {label}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

// Memoized support card.
export const SellSupportCard = memo(SellSupportCardComponent);
