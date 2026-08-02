// Category-specific attribute filter groups (variety, breed, brand…) rendered
// from GET /filter-form?categoryId. Only groups with an `attributeKey` are shown
// here — the 5 system filters come from the hardcoded rows in FilterSheet. Values
// are keyed by attributeKey and sent to the listings API as attr_{key}=value.
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Select } from '@/components/inputs';
import { Text } from '@/components/ui';
import { useFilterForm } from '@/features/home/hooks';
import type { FilterGroup } from '@/features/home/types';
import { localize } from '@/features/sell';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';

import { createFilterSheetStyles } from './FilterSheet.styles';

// Props for the AttributeFilters component.
export interface AttributeFiltersProps {
  // The category whose attribute filters to load.
  categoryId: number;
  // Current attribute selections (attributeKey -> value).
  attributes: Record<string, string>;
  // Sets or clears a single attribute value.
  onChange: (key: string, value: string | undefined) => void;
}

// Renders the dynamic attribute filter groups for a category.
export function AttributeFilters({
  categoryId,
  attributes,
  onChange,
}: AttributeFiltersProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createFilterSheetStyles);
  const { t, language } = useTranslation();
  const { form, isLoading } = useFilterForm(categoryId);

  const attrGroups = (form?.groups ?? [])
    .filter((group) => group.attributeKey)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  if (isLoading) {
    return (
      <View style={styles.attrLoading}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }
  if (attrGroups.length === 0) {
    return null;
  }

  const renderGroup = (group: FilterGroup) => {
    const key = group.attributeKey as string;
    const label = localize(group.label, language);
    const current = attributes[key];
    const options = (group.options ?? []).map((option) => ({
      value: option.value,
      label: localize(option.label, language),
    }));

    // DROPDOWN → a Select with an "Any" reset option.
    if (group.inputType === 'DROPDOWN') {
      return (
        <View key={group.groupKey}>
          <Select
            label={label}
            placeholder={t('market.filters.any')}
            value={current}
            options={[{ value: '', label: t('market.filters.any') }, ...options]}
            onChange={(value) => onChange(key, value || undefined)}
          />
        </View>
      );
    }

    // RADIO / MULTISELECT → single-select chips (tap the active chip to clear).
    return (
      <View key={group.groupKey}>
        <Text variant="label" style={styles.rowLabel}>
          {label}
        </Text>
        <View style={styles.chipsRow}>
          {options.map((option) => {
            const active = current === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => onChange(key, active ? undefined : option.value)}
              >
                {({ pressed }) => (
                  <View
                    style={[
                      styles.chip,
                      active ? styles.chipActive : null,
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    <Text
                      variant="label"
                      color={active ? 'onPrimary' : 'textPrimary'}
                    >
                      {option.label}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  return <>{attrGroups.map(renderGroup)}</>;
}
