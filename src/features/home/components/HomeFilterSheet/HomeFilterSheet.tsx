// Home filter drawer, opened from the header's filter button. The backend
// decides which filters exist and how to render them (GET /filter-form); we loop
// over the groups and render each by its inputType — no hardcoded filter lists.
// Apply builds a flat param set and hands it to the search screen, which browses
// the filtered listings. Styled with the app's own theme tokens.
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Button } from '@/components/buttons';
import { Select } from '@/components/inputs';
import { BottomSheet, type BottomSheetRef, Text } from '@/components/ui';
import { routes } from '@/constants';
import { localize } from '@/features/sell';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';

import { useFilterForm } from '../../hooks';
import type { FilterFormState, FilterGroup } from '../../types';
import { createHomeFilterSheetStyles } from './HomeFilterSheet.styles';

// Props for the HomeFilterSheet component.
export type HomeFilterSheetProps = object;

// Digits-only sanitizer for the price inputs.
function digits(text: string): string {
  return text.replace(/[^0-9]/g, '');
}

// Renders the dynamic filter bottom sheet.
export const HomeFilterSheet = forwardRef<BottomSheetRef, HomeFilterSheetProps>(
  function HomeFilterSheet(_props, ref) {
    const theme = useTheme();
    const styles = useThemedStyles(createHomeFilterSheetStyles);
    const { t, language } = useTranslation();
    const router = useRouter();
    const sheetRef = useRef<BottomSheetRef>(null);

    const { form, isLoading, isError } = useFilterForm();
    const [draft, setDraft] = useState<FilterFormState>({});

    useImperativeHandle(
      ref,
      () => ({
        present: () => sheetRef.current?.present(),
        dismiss: () => sheetRef.current?.dismiss(),
      }),
      [],
    );

    // Sets or clears a single filter value.
    const setValue = useCallback((key: string, value: string | null) => {
      setDraft((prev) => {
        const next = { ...prev };
        if (value == null || value === '') {
          delete next[key];
        } else {
          next[key] = value;
        }
        return next;
      });
    }, []);

    const clearAll = useCallback(() => setDraft({}), []);
    const activeCount = Object.values(draft).filter(Boolean).length;

    // Collect the applied params (system groups only — attribute DROPDOWN and
    // GEO_RADIUS are not filtered by the browse endpoint yet) and hand them to
    // the search screen for a filtered browse.
    const onApply = useCallback(() => {
      const applied: Record<string, string> = {};
      form?.groups.forEach((group) => {
        if (group.inputType === 'DROPDOWN' || group.inputType === 'GEO_RADIUS') {
          return;
        }
        const keys = group.queryParam
          ? [group.queryParam]
          : (group.queryParams ?? []);
        keys.forEach((key) => {
          if (draft[key]) {
            applied[key] = draft[key];
          }
        });
      });
      sheetRef.current?.dismiss();
      router.push({
        pathname: routes.search,
        params: { filters: JSON.stringify(applied) },
      });
    }, [form, draft, router]);

    // RADIO / DROPDOWN store under their queryParam (falling back to groupKey).
    const keyOf = (group: FilterGroup) => group.queryParam ?? group.groupKey;

    const renderRadio = (group: FilterGroup) => {
      const key = keyOf(group);
      const selected = draft[key];
      return (
        <View key={group.groupKey} style={styles.group}>
          <Text variant="label" style={styles.groupLabel}>
            {localize(group.label, language)}
          </Text>
          <View style={styles.chipsRow}>
            {(group.options ?? []).map((option) => {
              const active = selected === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setValue(key, active ? null : option.value)}
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
                        {localize(option.label, language)}
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

    const renderPriceRange = (group: FilterGroup) => {
      const [minKey, maxKey] = group.queryParams ?? [];
      if (!minKey || !maxKey) {
        return null;
      }
      return (
        <View key={group.groupKey} style={styles.group}>
          <Text variant="label" style={styles.groupLabel}>
            {localize(group.label, language)}
          </Text>
          <View style={styles.rangeRow}>
            <BottomSheetTextInput
              style={styles.input}
              placeholder={t('market.filters.minPrice')}
              placeholderTextColor={theme.colors.textTertiary}
              keyboardType="number-pad"
              value={draft[minKey] ?? ''}
              onChangeText={(text) => setValue(minKey, digits(text))}
            />
            <BottomSheetTextInput
              style={styles.input}
              placeholder={t('market.filters.maxPrice')}
              placeholderTextColor={theme.colors.textTertiary}
              keyboardType="number-pad"
              value={draft[maxKey] ?? ''}
              onChangeText={(text) => setValue(maxKey, digits(text))}
            />
          </View>
        </View>
      );
    };

    const renderLocation = (group: FilterGroup) => {
      const [districtKey, stateKey] = group.queryParams ?? [];
      if (!districtKey || !stateKey) {
        return null;
      }
      return (
        <View key={group.groupKey} style={styles.group}>
          <Text variant="label" style={styles.groupLabel}>
            {localize(group.label, language)}
          </Text>
          <View style={styles.rangeRow}>
            <BottomSheetTextInput
              style={styles.input}
              placeholder={t('home.filters.district')}
              placeholderTextColor={theme.colors.textTertiary}
              value={draft[districtKey] ?? ''}
              onChangeText={(text) => setValue(districtKey, text)}
            />
            <BottomSheetTextInput
              style={styles.input}
              placeholder={t('home.filters.state')}
              placeholderTextColor={theme.colors.textTertiary}
              value={draft[stateKey] ?? ''}
              onChangeText={(text) => setValue(stateKey, text)}
            />
          </View>
        </View>
      );
    };

    const renderDropdown = (group: FilterGroup) => {
      const key = keyOf(group);
      return (
        <View key={group.groupKey} style={styles.group}>
          <Select
            label={localize(group.label, language)}
            placeholder={localize(group.label, language)}
            value={draft[key]}
            options={(group.options ?? []).map((option) => ({
              value: option.value,
              label: localize(option.label, language),
            }))}
            onChange={(value) => setValue(key, value)}
          />
        </View>
      );
    };

    const renderGroup = (group: FilterGroup) => {
      switch (group.inputType) {
        case 'RADIO':
          return renderRadio(group);
        case 'PRICE_RANGE':
          return renderPriceRange(group);
        case 'LOCATION':
          return renderLocation(group);
        case 'DROPDOWN':
          return renderDropdown(group);
        default:
          // GEO_RADIUS (Nearby-only) and any unknown types are skipped here.
          return null;
      }
    };

    const renderBody = () => {
      if (isLoading) {
        return (
          <View style={styles.state}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        );
      }
      if (isError || !form) {
        return (
          <Text variant="body" color="textSecondary" style={styles.state}>
            {t('home.filters.loadError')}
          </Text>
        );
      }
      return <>{form.groups.map(renderGroup)}</>;
    };

    const footer =
      !isLoading && !isError && form ? (
        <View style={styles.footerRow}>
          <View style={styles.footerBtn}>
            <Button
              label={t('home.filters.clearAll')}
              variant="outline"
              disabled={activeCount === 0}
              onPress={clearAll}
            />
          </View>
          <View style={styles.footerBtn}>
            <Button
              label={
                activeCount > 0
                  ? `${t('market.filters.apply')} (${activeCount})`
                  : t('market.filters.apply')
              }
              onPress={onApply}
            />
          </View>
        </View>
      ) : undefined;

    return (
      <BottomSheet
        ref={sheetRef}
        title={t('home.filters.title')}
        scrollable
        footer={footer}
        contentStyle={styles.content}
      >
        {renderBody()}
      </BottomSheet>
    );
  },
);
