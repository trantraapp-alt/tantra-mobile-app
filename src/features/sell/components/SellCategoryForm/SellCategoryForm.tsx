// Right-pane content for a selected top-level category. Resolves the category
// tree: a BUSINESS_PROFILE category hands off to the Business Profile create
// flow; a category with subcategories shows a picker; a leaf category renders
// its server-driven listing form via DynamicListingForm.
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { memo, useEffect } from 'react';
import { ScrollView, View } from 'react-native';

import { ErrorState } from '@/components/empty-state';
import { Skeleton } from '@/components/loaders';
import { Card, InfoBanner, Text } from '@/components/ui';
import { routes } from '@/constants';
import { useThemedStyles, useTranslation } from '@/hooks';
import { logger } from '@/lib';
import { useTheme } from '@/providers';
import type { ModuleCategory, PreferredLanguage } from '@/types';

import { useListingForm, useSubcategories } from '../../hooks';
import {
  expectsSubcategories,
  getCategoryImageSource,
  getCategoryVisual,
} from '../../utils';
import { DynamicListingForm } from '../DynamicListingForm';
import { createSellCategoryFormStyles } from './SellCategoryForm.styles';

// Props for the SellCategoryForm component.
export interface SellCategoryFormProps {
  // Selected top-level category.
  category: ModuleCategory;
  // Active app language controlling labels.
  language: PreferredLanguage;
  // The subcategory the user has drilled into (screen-owned), or null on the
  // grid. Lifting it up lets the single screen header drive the back navigation.
  activeSub?: ModuleCategory | null;
  // Called when a subcategory is chosen (or cleared) from the grid.
  onActiveSubChange?: (sub: ModuleCategory | null) => void;
  // Reports whether the selected category is itself a leaf (no subcategories),
  // so the screen can hide the rail and show the form full-screen.
  onLeafTopChange?: (isLeafTop: boolean) => void;
}

// Resolves a category's display name for the active language.
function categoryName(
  category: ModuleCategory,
  language: PreferredLanguage,
): string {
  return language === 'HI'
    ? category.categoryNameHi
    : category.categoryNameEn;
}

// A form-shaped loading placeholder (a title + a few labeled input rows), shown
// while a category's listing form is being fetched.
function FormSkeleton() {
  const theme = useTheme();
  const styles = useThemedStyles(createSellCategoryFormStyles);
  return (
    <ScrollView
      contentContainerStyle={styles.formSkeleton}
      showsVerticalScrollIndicator={false}
    >
      <Skeleton width="55%" height={theme.spacing.xl} radius={theme.radius.sm} />
      {[0, 1, 2, 3, 4].map((row) => (
        <View key={row} style={styles.fieldSkeleton}>
          <Skeleton
            width="35%"
            height={theme.spacing.md}
            radius={theme.radius.xs}
          />
          <Skeleton
            width="100%"
            height={theme.sizing.inputHeightSm}
            radius={theme.radius.md}
          />
        </View>
      ))}
    </ScrollView>
  );
}

// A box-grid loading placeholder (title + six icon-box placeholders), shown
// while a parent category's subcategories load.
function BoxSkeleton() {
  const theme = useTheme();
  const styles = useThemedStyles(createSellCategoryFormStyles);
  const { t } = useTranslation();
  return (
    <ScrollView
      contentContainerStyle={styles.pickerContent}
      showsVerticalScrollIndicator={false}
    >
      <Text variant="h4">{t('sell.chooseCategory')}</Text>
      <View style={styles.pickerGrid}>
        {[0, 1, 2, 3, 4, 5].map((placeholder) => (
          <View key={placeholder} style={styles.pickerBox}>
            <View style={styles.pickerBoxInner}>
              <Skeleton
                width={theme.sizing.avatarXl}
                height={theme.sizing.avatarXl}
                radius={theme.radius.lg}
              />
              <Skeleton width="70%" height={theme.spacing.lg} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// Renders the listing form for a leaf category.
function LeafForm({
  category,
  language,
}: {
  category: ModuleCategory;
  language: PreferredLanguage;
}) {
  const styles = useThemedStyles(createSellCategoryFormStyles);
  const { t } = useTranslation();
  const { form, isError, refetch } = useListingForm(category.id);

  useEffect(() => {
    logger.info('[Sell] Leaf category form', {
      categoryId: category.id,
      key: category.categoryKey,
      endpoint: `/categories/${category.id}/form?listingType=SELL`,
    });
  }, [category.id, category.categoryKey]);

  if (isError) {
    return (
      <View style={styles.center}>
        <ErrorState onRetry={refetch} />
      </View>
    );
  }
  if (!form) {
    return <FormSkeleton />;
  }
  return (
    <View style={styles.leafFormWrap}>
      <View style={styles.leafInfo}>
        <InfoBanner tone="info" message={t('sell.formInfo')} />
      </View>
      <DynamicListingForm
        form={form}
        language={language}
        categoryKey={category.categoryKey}
      />
    </View>
  );
}

// Lets the user pick a leaf subcategory before the form opens.
function SubcategoryPicker({
  subcategories,
  language,
  onSelect,
}: {
  subcategories: ModuleCategory[];
  language: PreferredLanguage;
  onSelect: (category: ModuleCategory) => void;
}) {
  const theme = useTheme();
  const styles = useThemedStyles(createSellCategoryFormStyles);
  const { t } = useTranslation();
  return (
    <ScrollView
      contentContainerStyle={styles.pickerContent}
      showsVerticalScrollIndicator={false}
    >
      <Text variant="h4">{t('sell.chooseCategory')}</Text>
      <View style={styles.pickerGrid}>
        {subcategories.map((sub) => {
          const name = categoryName(sub, language);
          const imageSource = getCategoryImageSource(sub.categoryKey);
          const visual = getCategoryVisual(sub.categoryKey);
          const Icon = visual.icon;
          return (
            <Card
              key={sub.id}
              radius="lg"
              onPress={() => onSelect(sub)}
              style={styles.pickerBox}
            >
              <View style={styles.pickerBoxInner}>
                <View style={styles.pickerTile}>
                  {imageSource ? (
                    <Image
                      source={imageSource}
                      style={styles.pickerTileImage}
                      contentFit="contain"
                      transition={theme.animation.normal}
                      accessibilityLabel={name}
                    />
                  ) : (
                    <Icon
                      size={theme.sizing.avatarMd}
                      color={theme.colors[visual.accent]}
                    />
                  )}
                </View>
                <Text variant="bodyMedium" align="center" numberOfLines={2}>
                  {name}
                </Text>
              </View>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

// Resolves a top-level category into a subcategory picker or a leaf form.
function CategoryResolver({
  category,
  language,
  activeSub,
  onActiveSubChange,
  onLeafTopChange,
}: SellCategoryFormProps) {
  const styles = useThemedStyles(createSellCategoryFormStyles);
  const router = useRouter();
  const { subcategories, isLoading, isError, refetch } = useSubcategories(
    category.id,
  );

  // A leaf top category (no children, e.g. Services / Repair) opens its form
  // full-screen just like a chosen subcategory. Report it so the screen hides
  // the rail and drives the back navigation from its single header. During load
  // we don't yet know if there are children, so guess from the category (a
  // "marketplace" groups; everything else is a leaf) — this keeps the layout,
  // and its skeleton, correct instead of flashing the browse layout then jumping.
  const isLeafTop = isLoading
    ? !expectsSubcategories(category)
    : !isError && subcategories.length === 0;
  useEffect(() => {
    onLeafTopChange?.(isLeafTop);
  }, [isLeafTop, onLeafTopChange]);

  // Full-screen leaf: a chosen subcategory, or a leaf top category itself.
  const leaf = activeSub ?? (isLeafTop ? category : null);

  // A BUSINESS_PROFILE leaf has no listing form of its own — hand off to the
  // Business Profile create flow with its profileType pre-selected, then clear
  // the local selection so this resolver stops trying to render a form for it.
  useEffect(() => {
    if (leaf?.actionType === 'BUSINESS_PROFILE') {
      const linkKey = leaf.linkKey;
      const url = linkKey
        ? `${routes.businessProfile.create}?profileType=${linkKey}`
        : routes.businessProfile.create;
      router.push(url as Parameters<typeof router.push>[0]);
      onActiveSubChange?.(null);
    }
  }, [leaf, router, onActiveSubChange]);

  // The children aren't loaded yet, so pick the skeleton from the category type:
  // a grouping category (marketplace) shows box placeholders; a leaf category
  // (services, repair) shows a form placeholder.
  if (isLoading) {
    return expectsSubcategories(category) ? <BoxSkeleton /> : <FormSkeleton />;
  }
  if (isError) {
    return (
      <View style={styles.center}>
        <ErrorState onRetry={refetch} />
      </View>
    );
  }
  // Full-screen leaf form: a chosen subcategory or a leaf top category. The
  // screen header owns the back navigation, so no in-form back row is needed.
  if (leaf) {
    return leaf.actionType === 'BUSINESS_PROFILE' ? null : (
      <LeafForm category={leaf} language={language} />
    );
  }
  return (
    <SubcategoryPicker
      subcategories={subcategories}
      language={language}
      onSelect={(sub) => onActiveSubChange?.(sub)}
    />
  );
}

// Handles a top-level BUSINESS_PROFILE category (navigates immediately).
function BusinessProfileNavigator({
  category,
}: {
  category: ModuleCategory;
}) {
  const router = useRouter();

  useEffect(() => {
    const linkKey = category.linkKey;
    const url = linkKey
      ? `${routes.businessProfile.create}?profileType=${linkKey}`
      : routes.businessProfile.create;
    router.push(url as Parameters<typeof router.push>[0]);
  }, [category.linkKey, router]);

  return null;
}

// Renders the selected category's content (picker / form / business-profile handoff).
function SellCategoryFormComponent({
  category,
  language,
  activeSub,
  onActiveSubChange,
  onLeafTopChange,
}: SellCategoryFormProps) {
  if (category.actionType === 'BUSINESS_PROFILE') {
    return <BusinessProfileNavigator category={category} />;
  }
  return (
    <CategoryResolver
      category={category}
      language={language}
      activeSub={activeSub}
      onActiveSubChange={onActiveSubChange}
      onLeafTopChange={onLeafTopChange}
    />
  );
}

// Memoized category resolver.
export const SellCategoryForm = memo(SellCategoryFormComponent);
