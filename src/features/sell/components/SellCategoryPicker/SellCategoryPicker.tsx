// The module screen's browse body: the top-category tabs, a titled section, the
// grid of categories to list in, and the support card that closes the page.
//
// It owns the scroll for the whole page rather than just the grid, so the tabs
// scroll away with the content instead of pinning a strip to the top — the
// screen passes them in as `header`.
//
// The loading state renders the same chrome with placeholder cards in place of
// the grid, so nothing shifts around when the categories arrive.
import type { ReactNode } from 'react';
import { memo } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';

import { Skeleton } from '@/components/loaders';
import { Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';
import type { ModuleCategory, PreferredLanguage } from '@/types';

import { type AccentKey, getAccentColors } from '../../utils';
import { SellCategoryDecor } from '../SellCategoryDecor';
import { SellCategoryTile } from '../SellCategoryTile';
import { SellSupportCard } from '../SellSupportCard';
import { createSellCategoryPickerStyles } from './SellCategoryPicker.styles';

// The field motif scales with the screen so it keeps the same proportion to
// the heading everywhere, inside bounds that stop it crowding a small phone or
// getting lost on a tablet.
const DECOR_WIDTH_RATIO = 0.31;
const DECOR_MIN_WIDTH = 92;
const DECOR_MAX_WIDTH = 138;

// Narrowest screen that still has room for the motif beside the heading. Below
// this the two would overlap, so the motif steps out rather than sitting behind
// the title.
const DECOR_MIN_SCREEN = 350;

// Placeholder cards shown while the categories load.
const PLACEHOLDERS = [0, 1, 2, 3];

// Height of one placeholder card, matching a real card's minimum.
const PLACEHOLDER_HEIGHT = 150;

// Props for the SellCategoryPicker component.
export interface SellCategoryPickerProps {
  // Categories to offer, in display order.
  subcategories: ModuleCategory[];
  // Active app language controlling labels.
  language: PreferredLanguage;
  // Accent for the heading and support card (the owning module's colour).
  accent?: AccentKey;
  // Content rendered above the section heading — the top-category tabs.
  header?: ReactNode;
  // Whether the categories are still loading.
  loading?: boolean;
  // Called with the category the user picked.
  onSelect: (category: ModuleCategory) => void;
  // Called when the support action is pressed; the card is hidden without it.
  onSupportPress?: () => void;
}

// Renders the module's category browse page.
function SellCategoryPickerComponent({
  subcategories,
  language,
  accent = 'primary',
  header,
  loading = false,
  onSelect,
  onSupportPress,
}: SellCategoryPickerProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createSellCategoryPickerStyles);
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const colors = getAccentColors(theme, accent);
  const decorWidth = Math.min(
    DECOR_MAX_WIDTH,
    Math.max(DECOR_MIN_WIDTH, Math.round(width * DECOR_WIDTH_RATIO)),
  );
  const showDecor = width >= DECOR_MIN_SCREEN;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {header}

      <View style={styles.section}>
        {showDecor ? (
          <View style={styles.decor}>
            <SellCategoryDecor
              width={decorWidth}
              color={colors.solid}
              leafFill={colors.soft}
            />
          </View>
        ) : null}

        <View style={styles.titleRow}>
          <View style={[styles.bar, { backgroundColor: colors.solid }]} />
          <Text variant="h3">{t('sell.chooseCategory')}</Text>
        </View>
        <Text variant="caption" color="textSecondary" style={styles.sectionSub}>
          {t('sell.chooseCategorySub')}
        </Text>
      </View>

      <View style={styles.grid}>
        {loading
          ? PLACEHOLDERS.map((placeholder) => (
              <View key={placeholder} style={styles.placeholderSlot}>
                <Skeleton
                  height={PLACEHOLDER_HEIGHT}
                  radius={theme.radius.lg}
                />
              </View>
            ))
          : subcategories.map((subcategory, index) => (
              <SellCategoryTile
                key={subcategory.id}
                category={subcategory}
                language={language}
                // An odd count would leave the last card alone on a half-empty
                // row, so it spans the full width instead.
                wide={
                  subcategories.length % 2 === 1 &&
                  index === subcategories.length - 1
                }
                onPress={onSelect}
              />
            ))}
      </View>

      {onSupportPress ? (
        <View style={styles.support}>
          <SellSupportCard accent={accent} onPress={onSupportPress} />
        </View>
      ) : null}
    </ScrollView>
  );
}

// Memoized category browse page.
export const SellCategoryPicker = memo(SellCategoryPickerComponent);
