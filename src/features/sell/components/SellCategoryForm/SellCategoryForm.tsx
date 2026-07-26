// Right-pane content for a selected top-level category. Resolves the category
// tree: a BUSINESS_PROFILE category hands off to that flow (a placeholder here,
// as it is a separate workstream); a category with subcategories shows a picker;
// a leaf category renders its server-driven listing form via DynamicListingForm.
import { Image } from 'expo-image';
import { ChevronLeft, Store } from 'lucide-react-native';
import { memo, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/buttons';
import { EmptyState, ErrorState } from '@/components/empty-state';
import { Skeleton } from '@/components/loaders';
import { Card, Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';
import { logger } from '@/lib';
import { useTheme } from '@/providers';
import type { ModuleCategory, PreferredLanguage } from '@/types';

import { useListingForm, useSubcategories } from '../../hooks';
import { getCategoryImageSource, getCategoryVisual } from '../../utils';
import { DynamicListingForm } from '../DynamicListingForm';
import { createSellCategoryFormStyles } from './SellCategoryForm.styles';

// Props for the SellCategoryForm component.
export interface SellCategoryFormProps {
  // Selected top-level category.
  category: ModuleCategory;
  // Active app language controlling labels.
  language: PreferredLanguage;
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

// Whether a top-level category is expected to contain subcategories (so its
// loading skeleton shows boxes) rather than open a listing form directly.
function expectsSubcategories(category: ModuleCategory): boolean {
  const key = `${category.categoryKey} ${category.categoryNameEn}`.toLowerCase();
  return /market|bazaar|bazar/.test(key);
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
  return <DynamicListingForm form={form} language={language} />;
}

// Placeholder for BUSINESS_PROFILE categories (handled by a separate workstream).
function BusinessProfilePlaceholder() {
  const styles = useThemedStyles(createSellCategoryFormStyles);
  const { t } = useTranslation();
  return (
    <View style={styles.center}>
      <EmptyState
        icon={Store}
        title={t('sell.businessProfileTitle')}
        description={t('sell.businessProfileDesc')}
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
function CategoryResolver({ category, language }: SellCategoryFormProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createSellCategoryFormStyles);
  const { t } = useTranslation();
  const { subcategories, isLoading, isError, refetch } = useSubcategories(
    category.id,
  );
  const [activeLeaf, setActiveLeaf] = useState<ModuleCategory | null>(null);

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
  // No children — the selected category is itself a leaf.
  if (subcategories.length === 0) {
    return <LeafForm category={category} language={language} />;
  }
  // A subcategory was chosen — show its form (or hand off a business profile).
  if (activeLeaf) {
    if (activeLeaf.actionType === 'BUSINESS_PROFILE') {
      return <BusinessProfilePlaceholder />;
    }
    return (
      <View style={styles.leafWrap}>
        <View style={styles.leafHeader}>
          <Button
            label={t('sell.back')}
            variant="ghost"
            size="sm"
            fullWidth={false}
            leftIcon={
              <ChevronLeft
                size={theme.sizing.iconSm}
                color={theme.colors.primary}
              />
            }
            onPress={() => setActiveLeaf(null)}
          />
          <Text variant="label" numberOfLines={1}>
            {categoryName(activeLeaf, language)}
          </Text>
        </View>
        <LeafForm category={activeLeaf} language={language} />
      </View>
    );
  }
  return (
    <SubcategoryPicker
      subcategories={subcategories}
      language={language}
      onSelect={setActiveLeaf}
    />
  );
}

// Renders the selected category's content (picker / form / handoff).
function SellCategoryFormComponent({ category, language }: SellCategoryFormProps) {
  if (category.actionType === 'BUSINESS_PROFILE') {
    return <BusinessProfilePlaceholder />;
  }
  return <CategoryResolver category={category} language={language} />;
}

// Memoized category resolver.
export const SellCategoryForm = memo(SellCategoryFormComponent);
