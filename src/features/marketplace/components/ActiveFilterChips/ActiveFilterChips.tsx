// Row of dismissible chips summarizing the applied filters. Tapping a chip's ×
// clears that facet. Renders nothing when no filters are active.
import { X } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui';
import { appConstants } from '@/constants';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';
import { formatCurrency } from '@/utils';

import type { ListingFilters } from '../../types';
import { createActiveFilterChipsStyles } from './ActiveFilterChips.styles';

// Props for the ActiveFilterChips component.
export interface ActiveFilterChipsProps {
  // Applied filters.
  filters: ListingFilters;
  // Called with the next filter set after a chip is dismissed.
  onChange: (filters: ListingFilters) => void;
}

// A rendered chip: its label and what removing it clears.
interface Chip {
  key: string;
  label: string;
  next: ListingFilters;
}

// Renders the active-filter chip row.
function ActiveFilterChipsComponent({
  filters,
  onChange,
}: ActiveFilterChipsProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createActiveFilterChipsStyles);
  const { t } = useTranslation();

  const chips: Chip[] = [];

  if (filters.listingType) {
    chips.push({
      key: 'listingType',
      label:
        filters.listingType === 'RENT'
          ? t('market.type.rent')
          : t('market.type.sell'),
      next: { ...filters, listingType: undefined },
    });
  }

  if (filters.minPrice != null || filters.maxPrice != null) {
    const currency = appConstants.currencyCode;
    const min = filters.minPrice;
    const max = filters.maxPrice;
    const label =
      min != null && max != null
        ? `${formatCurrency(min, currency)} – ${formatCurrency(max, currency)}`
        : min != null
          ? `≥ ${formatCurrency(min, currency)}`
          : `≤ ${formatCurrency(max ?? 0, currency)}`;
    chips.push({
      key: 'price',
      label,
      next: { ...filters, minPrice: undefined, maxPrice: undefined },
    });
  }

  if (filters.radius != null) {
    chips.push({
      key: 'radius',
      label: `${filters.radius} km`,
      next: { ...filters, radius: undefined },
    });
  }

  if (filters.sellerType === 'SUBSCRIBED') {
    chips.push({
      key: 'sellerType',
      label: t('market.seller.premium'),
      next: { ...filters, sellerType: undefined },
    });
  }

  if (filters.postedWithin && filters.postedWithin !== 'ALL') {
    const map = {
      TODAY: t('market.posted.today'),
      WEEK: t('market.posted.week'),
      MONTH: t('market.posted.month'),
    } as const;
    chips.push({
      key: 'postedWithin',
      label: map[filters.postedWithin],
      next: { ...filters, postedWithin: undefined },
    });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.railContent}
    >
      {chips.map((chip) => (
        <Pressable
          key={chip.key}
          accessibilityRole="button"
          accessibilityLabel={`${chip.label}, ${t('common.remove')}`}
          onPress={() => onChange(chip.next)}
        >
          {({ pressed }) => (
            <View style={[styles.chip, pressed ? styles.pressed : null]}>
              <Text variant="label" color="primary" numberOfLines={1}>
                {chip.label}
              </Text>
              <X size={theme.sizing.iconXs} color={theme.colors.primary} />
            </View>
          )}
        </Pressable>
      ))}
    </ScrollView>
  );
}

// Memoized active-filter chip row.
export const ActiveFilterChips = memo(ActiveFilterChipsComponent);
