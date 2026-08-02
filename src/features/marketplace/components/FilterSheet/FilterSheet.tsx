// Bottom-sheet filter panel shared by the buyer list screens: listing type,
// price range, distance radius, seller type and freshness, with Reset / Apply.
// Edits happen on a local draft that is re-seeded from the applied filters each
// time the sheet opens, so closing without applying discards the changes.
import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/buttons';
import { TextField } from '@/components/inputs';
import { BottomSheet, type BottomSheetRef, Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';

import type { ListingFilters } from '../../types';
import { AttributeFilters } from './AttributeFilters';
import { createFilterSheetStyles } from './FilterSheet.styles';

// A single-choice option value (undefined represents the "all / any" choice).
type ChoiceValue = string | number | undefined;

// One selectable option in a choice row.
interface Choice {
  label: string;
  value: ChoiceValue;
}

// Props for the FilterSheet component.
export interface FilterSheetProps {
  // Currently applied filters (the draft is re-seeded from these on open).
  filters: ListingFilters;
  // Called with the new filter set when Apply is pressed.
  onApply: (filters: ListingFilters) => void;
  // Whether to show the distance-radius row (needs a known GPS point).
  showRadius?: boolean;
  // When set, loads and shows this category's attribute filters (variety,
  // breed, brand…) below the system filters.
  categoryId?: number;
}

// Renders the filter bottom sheet.
export const FilterSheet = forwardRef<BottomSheetRef, FilterSheetProps>(
  function FilterSheet(
    { filters, onApply, showRadius = false, categoryId },
    ref,
  ) {
    const styles = useThemedStyles(createFilterSheetStyles);
    const { t } = useTranslation();
    const sheetRef = useRef<BottomSheetRef>(null);
    const [draft, setDraft] = useState<ListingFilters>(filters);

    // Re-seed the draft from the applied filters every time the sheet opens.
    useImperativeHandle(
      ref,
      () => ({
        present: () => {
          setDraft(filters);
          sheetRef.current?.present();
        },
        dismiss: () => sheetRef.current?.dismiss(),
      }),
      [filters],
    );

    const typeOptions = useMemo<Choice[]>(
      () => [
        { label: t('market.type.all'), value: undefined },
        { label: t('market.type.sell'), value: 'SELL' },
        { label: t('market.type.rent'), value: 'RENT' },
      ],
      [t],
    );

    const radiusOptions = useMemo<Choice[]>(
      () => [
        { label: '5 km', value: 5 },
        { label: '10 km', value: 10 },
        { label: '25 km', value: 25 },
        { label: '50 km', value: 50 },
        { label: '100 km', value: 100 },
        { label: t('market.radius.all'), value: undefined },
      ],
      [t],
    );

    const sellerOptions = useMemo<Choice[]>(
      () => [
        { label: t('market.seller.all'), value: undefined },
        { label: t('market.seller.premium'), value: 'SUBSCRIBED' },
      ],
      [t],
    );

    const postedOptions = useMemo<Choice[]>(
      () => [
        { label: t('market.posted.any'), value: undefined },
        { label: t('market.posted.today'), value: 'TODAY' },
        { label: t('market.posted.week'), value: 'WEEK' },
        { label: t('market.posted.month'), value: 'MONTH' },
      ],
      [t],
    );

    // Renders a labelled row of single-choice pills.
    const renderChoiceRow = (
      label: string,
      options: Choice[],
      selected: ChoiceValue,
      onSelect: (value: ChoiceValue) => void,
    ) => (
      <View>
        <Text variant="label" style={styles.rowLabel}>
          {label}
        </Text>
        <View style={styles.chipsRow}>
          {options.map((option) => {
            const active = option.value === selected;
            return (
              <Pressable
                key={String(option.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => onSelect(option.value)}
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

    // Parses a price input into a number (or undefined when blank).
    const parsePrice = (text: string): number | undefined => {
      const digits = text.replace(/[^0-9]/g, '');
      return digits === '' ? undefined : Number(digits);
    };

    const handleReset = () => {
      // Keep the module context (browse scope); clear only the user filters.
      setDraft({ sort: draft.sort, moduleId: draft.moduleId });
    };

    const handleApply = () => {
      onApply(draft);
      sheetRef.current?.dismiss();
    };

    // Sets or clears a single attribute filter value (by attributeKey).
    const setAttr = (key: string, value: string | undefined) => {
      setDraft((d) => {
        const attributes = { ...(d.attributes ?? {}) };
        if (value) {
          attributes[key] = value;
        } else {
          delete attributes[key];
        }
        return {
          ...d,
          attributes:
            Object.keys(attributes).length > 0 ? attributes : undefined,
        };
      });
    };

    return (
      <BottomSheet
        ref={sheetRef}
        title={t('market.filters.title')}
        scrollable
        contentStyle={styles.content}
      >
        {renderChoiceRow(
          t('market.filters.listingType'),
          typeOptions,
          draft.listingType,
          (value) =>
            setDraft((d) => ({
              ...d,
              listingType: value as ListingFilters['listingType'],
            })),
        )}

        <View>
          <Text variant="label" style={styles.rowLabel}>
            {t('market.filters.price')}
          </Text>
          <View style={styles.priceRow}>
            <View style={styles.priceField}>
              <TextField
                placeholder={t('market.filters.minPrice')}
                keyboardType="number-pad"
                value={draft.minPrice != null ? String(draft.minPrice) : ''}
                onChangeText={(text) =>
                  setDraft((d) => ({ ...d, minPrice: parsePrice(text) }))
                }
              />
            </View>
            <View style={styles.priceField}>
              <TextField
                placeholder={t('market.filters.maxPrice')}
                keyboardType="number-pad"
                value={draft.maxPrice != null ? String(draft.maxPrice) : ''}
                onChangeText={(text) =>
                  setDraft((d) => ({ ...d, maxPrice: parsePrice(text) }))
                }
              />
            </View>
          </View>
        </View>

        {showRadius
          ? renderChoiceRow(
              t('market.filters.radius'),
              radiusOptions,
              draft.radius,
              (value) =>
                setDraft((d) => ({ ...d, radius: value as number | undefined })),
            )
          : null}

        {renderChoiceRow(
          t('market.filters.sellerType'),
          sellerOptions,
          draft.sellerType,
          (value) =>
            setDraft((d) => ({
              ...d,
              sellerType: value as ListingFilters['sellerType'],
            })),
        )}

        {renderChoiceRow(
          t('market.filters.postedWithin'),
          postedOptions,
          draft.postedWithin,
          (value) =>
            setDraft((d) => ({
              ...d,
              postedWithin: value as ListingFilters['postedWithin'],
            })),
        )}

        {categoryId != null ? (
          <AttributeFilters
            categoryId={categoryId}
            attributes={draft.attributes ?? {}}
            onChange={setAttr}
          />
        ) : null}

        <View style={styles.actions}>
          <View style={styles.actionButton}>
            <Button
              label={t('market.filters.reset')}
              variant="outline"
              onPress={handleReset}
            />
          </View>
          <View style={styles.actionButton}>
            <Button label={t('market.filters.apply')} onPress={handleApply} />
          </View>
        </View>
      </BottomSheet>
    );
  },
);
