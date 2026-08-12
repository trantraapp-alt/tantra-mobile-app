// A horizontal row of filter entry chips shown above a listing grid, matching
// the browse design: a Sort dropdown, then Category / Price / Distance chips that
// open the shared FilterSheet, and a Reset that clears the applied filters. The
// chips only *present* the shared filter UI (via onOpenFilters) — they are not a
// second filter implementation; each highlights when its filter is active.
import { ChevronDown, RotateCcw } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { SortSelect } from '@/components/inputs';
import { Text } from '@/components/ui';
import { localize, type LocalizedText } from '@/features/sell';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';

import type { ListingFilters, ListingSort } from '../../types';
import { hasActiveFilters } from '../../utils/filterState';
import type { FilterSection } from '../FilterSheet';
import type { SortOptionItem } from '../SortBar';
import { createFilterChipsBarStyles } from './FilterChipsBar.styles';

// Chip labels (kept out of the global i18n catalog).
const LABELS = {
  sort: { en: 'Sort', hi: 'क्रम' },
  category: { en: 'Category', hi: 'श्रेणी' },
  price: { en: 'Price', hi: 'कीमत' },
  distance: { en: 'Distance', hi: 'दूरी' },
  reset: { en: 'Reset', hi: 'रीसेट' },
} satisfies Record<string, LocalizedText>;

// Props for the FilterChipsBar.
export interface FilterChipsBarProps {
  // Currently applied filters (drives sort + each chip's active state).
  filters: ListingFilters;
  // Called with the next filter set (sort changes + reset).
  onFiltersChange: (filters: ListingFilters) => void;
  // Opens the shared FilterSheet focused on the tapped chip's section.
  onOpenFilters: (section: FilterSection) => void;
  // Sort options offered by the Sort dropdown; omit / empty to hide the Sort
  // chip (e.g. Nearby, which is server-sorted).
  sortOptions?: SortOptionItem[];
  // Whether to show the Distance chip (needs a known GPS point).
  showDistance?: boolean;
  // Whether to show the Category chip (default true). Deal groups already scope
  // to a single category, so Fresh Deals hides it.
  showCategory?: boolean;
  // Optional result-count label rendered above the chips (e.g. "128 results").
  resultLabel?: string;
}

// Renders the filter chips row.
function FilterChipsBarComponent({
  filters,
  onFiltersChange,
  onOpenFilters,
  sortOptions,
  showDistance = false,
  showCategory = true,
  resultLabel,
}: FilterChipsBarProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createFilterChipsBarStyles);
  const { language } = useTranslation();

  const hasSort = Boolean(sortOptions && sortOptions.length > 0);
  const hasPrice = filters.minPrice != null || filters.maxPrice != null;
  const hasDistance = filters.radius != null;
  const hasCategory =
    Boolean(filters.listingType) ||
    (filters.attributes != null &&
      Object.keys(filters.attributes).length > 0);
  const showReset = hasActiveFilters(filters);

  // Category / Price / Distance each open the shared FilterSheet on their
  // section.
  const chips: {
    key: FilterSection;
    label: LocalizedText;
    active: boolean;
  }[] = [];
  if (showCategory) {
    chips.push({ key: 'category', label: LABELS.category, active: hasCategory });
  }
  chips.push({ key: 'price', label: LABELS.price, active: hasPrice });
  if (showDistance) {
    chips.push({ key: 'distance', label: LABELS.distance, active: hasDistance });
  }

  return (
    <View style={styles.container}>
      {resultLabel ? (
        <Text
          variant="caption"
          color="textSecondary"
          numberOfLines={1}
          style={styles.count}
        >
          {resultLabel}
        </Text>
      ) : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
      >
        {hasSort ? (
          <SortSelect
            value={filters.sort}
            options={sortOptions ?? []}
            onChange={(value) =>
              onFiltersChange({ ...filters, sort: value as ListingSort })
            }
            label={localize(LABELS.sort, language)}
          />
        ) : null}

        {chips.map((chip) => (
          <Pressable
            key={chip.key}
            accessibilityRole="button"
            accessibilityLabel={localize(chip.label, language)}
            onPress={() => onOpenFilters(chip.key)}
          >
            {({ pressed }) => (
              <View
                style={[
                  styles.chip,
                  chip.active ? styles.chipActive : null,
                  pressed ? styles.pressed : null,
                ]}
              >
                <Text
                  variant="label"
                  color={chip.active ? 'primary' : 'textPrimary'}
                >
                  {localize(chip.label, language)}
                </Text>
                <ChevronDown
                  size={theme.sizing.iconXs}
                  color={
                    chip.active
                      ? theme.colors.primary
                      : theme.colors.textSecondary
                  }
                />
              </View>
            )}
          </Pressable>
        ))}

        {showReset ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={localize(LABELS.reset, language)}
            onPress={() =>
              onFiltersChange({
                sort: filters.sort,
                moduleId: filters.moduleId,
              })
            }
          >
            {({ pressed }) => (
              <View style={[styles.reset, pressed ? styles.pressed : null]}>
                <RotateCcw
                  size={theme.sizing.iconXs}
                  color={theme.colors.primary}
                />
                <Text variant="label" color="primary">
                  {localize(LABELS.reset, language)}
                </Text>
              </View>
            )}
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

// Memoized filter chips row.
export const FilterChipsBar = memo(FilterChipsBarComponent);
