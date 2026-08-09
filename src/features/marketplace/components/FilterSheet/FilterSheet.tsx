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
import { RangeSlider, Slider } from '@/components/inputs';
import { BottomSheet, type BottomSheetRef, Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';

import type { ListingFilters } from '../../types';
import { AttributeFilters } from './AttributeFilters';
import { createFilterSheetStyles } from './FilterSheet.styles';

// Distance slider bounds (km). The maximum doubles as "All India" (no radius
// filter), so at the far end the browse shows every listing.
const DISTANCE_MIN = 1;
const DISTANCE_MAX = 500;

// Price-range slider bounds (₹). A fixed 0 – ₹20 lakh range so the slider covers
// everything from cheap produce to high-value equipment / land.
const PRICE_MIN = 0;
const PRICE_MAX = 2_000_000;
const PRICE_STEP = 1000;

// Formats a rupee amount compactly for the price read-out (₹0, ₹50k, ₹1.5L,
// ₹20L) so the range pill stays short and legible.
function formatMoney(value: number): string {
  const amount = Math.round(value);
  if (amount >= 100_000) {
    const lakh = amount / 100_000;
    return `₹${Number.isInteger(lakh) ? lakh : lakh.toFixed(1)}L`;
  }
  if (amount >= 1000) {
    const thousand = amount / 1000;
    return `₹${Number.isInteger(thousand) ? thousand : thousand.toFixed(1)}k`;
  }
  return `₹${amount}`;
}

// A single-choice option value (undefined represents the "all / any" choice).
type ChoiceValue = string | number | undefined;

// One selectable option in a choice row.
interface Choice {
  label: string;
  value: ChoiceValue;
}

// Which group of filters a chip-driven open should focus on. 'category' covers
// the listing-type / seller / freshness / attribute rows; 'price' the price
// range; 'distance' the radius. Undefined shows every section.
export type FilterSection = 'category' | 'price' | 'distance';

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
  // When set, the sheet shows ONLY that section (opened from a filter chip);
  // undefined shows every section (opened from the Filters button).
  focusSection?: FilterSection;
}

// Renders the filter bottom sheet.
export const FilterSheet = forwardRef<BottomSheetRef, FilterSheetProps>(
  function FilterSheet(
    { filters, onApply, showRadius = false, categoryId, focusSection },
    ref,
  ) {
    const styles = useThemedStyles(createFilterSheetStyles);
    const { t } = useTranslation();
    // A section is shown when nothing is focused, or it is the focused one.
    const shows = (section: FilterSection) =>
      focusSection == null || focusSection === section;
    // The sheet title reflects the focused section (or the generic "Filters").
    const sheetTitle =
      focusSection === 'price'
        ? t('market.filters.price')
        : focusSection === 'distance'
          ? t('market.filters.radius')
          : t('market.filters.title');
    const sheetRef = useRef<BottomSheetRef>(null);
    const [draft, setDraft] = useState<ListingFilters>(filters);
    // Live distance read-out (km); the slider maximum means "any distance".
    const [radiusKm, setRadiusKm] = useState<number>(
      filters.radius ?? DISTANCE_MAX,
    );
    // Re-seed the draft from the applied filters every time the sheet opens.
    useImperativeHandle(
      ref,
      () => ({
        present: () => {
          setDraft(filters);
          setRadiusKm(filters.radius ?? DISTANCE_MAX);
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

    const handleReset = () => {
      // Keep the module context (browse scope); clear only the user filters.
      setDraft({ sort: draft.sort, moduleId: draft.moduleId });
      setRadiusKm(DISTANCE_MAX);
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
        title={sheetTitle}
        enableContentPanningGesture={false}
        contentStyle={styles.content}
        footer={
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
        }
      >
        {shows('category')
          ? renderChoiceRow(
              t('market.filters.listingType'),
              typeOptions,
              draft.listingType,
              (value) =>
                setDraft((d) => ({
                  ...d,
                  listingType: value as ListingFilters['listingType'],
                })),
            )
          : null}

        {shows('price') ? (
          <View>
            <View style={styles.rowHeader}>
              <Text variant="label">{t('market.filters.price')}</Text>
            <View style={styles.valueBadge}>
              <Text variant="caption" color="primary">
                {`${formatMoney(draft.minPrice ?? PRICE_MIN)} – ${formatMoney(
                  draft.maxPrice ?? PRICE_MAX,
                )}${draft.maxPrice == null ? '+' : ''}`}
              </Text>
            </View>
          </View>
          <RangeSlider
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={PRICE_STEP}
            low={draft.minPrice ?? PRICE_MIN}
            high={draft.maxPrice ?? PRICE_MAX}
            onValueChange={(lo, hi) =>
              setDraft((d) => {
                const nextMin = lo <= PRICE_MIN ? undefined : lo;
                const nextMax = hi >= PRICE_MAX ? undefined : hi;
                // Return the SAME object when nothing changed — otherwise the
                // controlled slider re-fires and the sheet loops.
                if (d.minPrice === nextMin && d.maxPrice === nextMax) {
                  return d;
                }
                return { ...d, minPrice: nextMin, maxPrice: nextMax };
              })
            }
          />
          <View style={styles.sliderScale}>
            <Text variant="caption" color="textTertiary">
              {formatMoney(PRICE_MIN)}
            </Text>
            <Text variant="caption" color="textTertiary">
              {`${formatMoney(PRICE_MAX)}+`}
            </Text>
          </View>
          </View>
        ) : null}

        {showRadius && shows('distance') ? (
          <View>
            <View style={styles.rowHeader}>
              <Text variant="label">{t('market.filters.radius')}</Text>
              <View style={styles.valueBadge}>
                <Text variant="caption" color="primary">
                  {radiusKm >= DISTANCE_MAX
                    ? t('market.radius.all')
                    : `${radiusKm} km`}
                </Text>
              </View>
            </View>
            <Slider
              min={DISTANCE_MIN}
              max={DISTANCE_MAX}
              step={1}
              value={draft.radius ?? DISTANCE_MAX}
              onValueChange={(v) => {
                setRadiusKm(v);
                setDraft((d) => ({
                  ...d,
                  radius: v >= DISTANCE_MAX ? undefined : v,
                }));
              }}
            />
            <View style={styles.sliderScale}>
              <Text variant="caption" color="textTertiary">
                {`${DISTANCE_MIN} km`}
              </Text>
              <Text variant="caption" color="textTertiary">
                {t('market.radius.all')}
              </Text>
            </View>
          </View>
        ) : null}

        {shows('category') ? (
          <>
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
              <View style={styles.attrSection}>
                <AttributeFilters
                  categoryId={categoryId}
                  attributes={draft.attributes ?? {}}
                  onChange={setAttr}
                />
              </View>
            ) : (
              // No attribute (Crop Type) section — keep the last row off the
              // sticky footer with a little tail spacing.
              <View style={styles.tailSpacing} />
            )}
          </>
        ) : null}
      </BottomSheet>
    );
  },
);
