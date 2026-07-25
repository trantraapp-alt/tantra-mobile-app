// Cascading Country -> State -> District dropdowns backed by seeded geo
// option-sets. Selecting a parent loads its children and clears the now-stale
// child selections. Districts are only fetched once a state is chosen (the set
// is large).
import { memo, useMemo } from 'react';
import { View } from 'react-native';

import { Select, type SelectItem } from '@/components/inputs';
import { localize } from '@/features/sell';
import { useThemedStyles, useTranslation } from '@/hooks';
import type { PreferredLanguage } from '@/types';

import { useOptionSet } from '../../hooks';
import type { OptionSetItem } from '../../types';
import { createGeoCascadeStyles } from './GeoCascade.styles';

// The geo selection this component controls.
export interface GeoSelection {
  // Selected country value.
  country: string;
  // Selected state value.
  state: string;
  // Selected district value.
  district: string;
}

// Props for the GeoCascade component.
export interface GeoCascadeProps {
  // Current selection.
  value: GeoSelection;
  // Called with the next selection when any level changes.
  onChange: (value: GeoSelection) => void;
  // Active language for option labels.
  language: PreferredLanguage;
  // Per-level validation errors.
  errors?: Partial<Record<keyof GeoSelection, string>>;
}

// Finds an item's id by its stored value.
function itemIdOf(
  items: OptionSetItem[],
  value: string,
): number | string | undefined {
  return items.find((item) => item.value === value)?.itemId;
}

// Maps option-set items to Select options in the active language.
function toItems(items: OptionSetItem[], language: PreferredLanguage): SelectItem[] {
  return items.map((item) => ({
    value: item.value,
    label: localize(item.label, language),
  }));
}

// Renders the three cascading geo dropdowns.
function GeoCascadeComponent({
  value,
  onChange,
  language,
  errors,
}: GeoCascadeProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createGeoCascadeStyles);

  const countrySet = useOptionSet('country');
  const countryItemId = itemIdOf(countrySet.items, value.country);

  // States: scoped to the country when one is chosen; the whole set otherwise
  // (India has a single country, so an absent country still yields states).
  const stateSet = useOptionSet('state', countryItemId);
  const stateItemId = itemIdOf(stateSet.items, value.state);

  // Districts are large — only fetch them once a state is selected.
  const districtSet = useOptionSet('district', stateItemId, !value.state);

  const countryOptions = useMemo(
    () => toItems(countrySet.items, language),
    [countrySet.items, language],
  );
  const stateOptions = useMemo(
    () => toItems(stateSet.items, language),
    [stateSet.items, language],
  );
  const districtOptions = useMemo(
    () => toItems(districtSet.items, language),
    [districtSet.items, language],
  );

  return (
    <View style={styles.container}>
      {countryOptions.length > 0 ? (
        <Select
          label={t('address.country')}
          placeholder={t('address.selectCountry')}
          value={value.country}
          options={countryOptions}
          onChange={(country) =>
            onChange({ country, state: '', district: '' })
          }
          error={errors?.country}
        />
      ) : null}

      <Select
        label={t('address.state')}
        placeholder={t('address.selectState')}
        value={value.state}
        options={stateOptions}
        onChange={(state) =>
          onChange({ country: value.country, state, district: '' })
        }
        error={errors?.state}
      />

      <Select
        label={t('address.district')}
        placeholder={
          value.state
            ? t('address.selectDistrict')
            : t('address.selectStateFirst')
        }
        value={value.district}
        options={districtOptions}
        onChange={(district) =>
          onChange({ country: value.country, state: value.state, district })
        }
        error={errors?.district}
      />
    </View>
  );
}

// Memoized cascading geo dropdowns.
export const GeoCascade = memo(GeoCascadeComponent);
