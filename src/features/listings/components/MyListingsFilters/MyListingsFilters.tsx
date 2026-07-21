// Filter bar for My Listings: a SELL/RENT segmented control plus a row of
// status chips (All / Active / Sold / Inactive).
import { memo } from 'react';
import { View } from 'react-native';

import { SegmentedControl } from '@/components/inputs';
import { Chip } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';
import type { TranslationKey } from '@/i18n';

import type { ListingStatusFilter, ListingType } from '../../types';
import { createMyListingsFiltersStyles } from './MyListingsFilters.styles';

// Props for the MyListingsFilters component.
export interface MyListingsFiltersProps {
  // Selected listing type.
  listingType: ListingType;
  // Called when the listing type changes.
  onListingTypeChange: (value: ListingType) => void;
  // Selected status filter.
  status: ListingStatusFilter;
  // Called when the status filter changes.
  onStatusChange: (value: ListingStatusFilter) => void;
}

// Status filter options with their i18n label keys.
const STATUS_OPTIONS: { value: ListingStatusFilter; labelKey: TranslationKey }[] =
  [
    { value: 'ALL', labelKey: 'listing.status.all' },
    { value: 'ACTIVE', labelKey: 'listing.status.active' },
    { value: 'SOLD', labelKey: 'listing.status.sold' },
    { value: 'INACTIVE', labelKey: 'listing.status.inactive' },
  ];

// Renders the My Listings filter bar.
function MyListingsFiltersComponent({
  listingType,
  onListingTypeChange,
  status,
  onStatusChange,
}: MyListingsFiltersProps) {
  const styles = useThemedStyles(createMyListingsFiltersStyles);
  const { t } = useTranslation();

  const typeOptions: { value: ListingType; label: string }[] = [
    { value: 'SELL', label: t('listing.type.sell') },
    { value: 'RENT', label: t('listing.type.rent') },
  ];

  return (
    <View style={styles.container}>
      <SegmentedControl
        options={typeOptions}
        value={listingType}
        onChange={onListingTypeChange}
      />
      <View style={styles.chips}>
        {STATUS_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={t(option.labelKey)}
            selected={status === option.value}
            onPress={() => onStatusChange(option.value)}
          />
        ))}
      </View>
    </View>
  );
}

// Memoized My Listings filter bar.
export const MyListingsFilters = memo(MyListingsFiltersComponent);
