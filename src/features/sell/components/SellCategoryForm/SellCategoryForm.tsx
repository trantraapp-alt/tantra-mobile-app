// Right-pane content for a selected top-level category. Resolves the category
// tree: a BUSINESS_PROFILE category hands off to that flow (a placeholder here,
// as it is a separate workstream); a category with subcategories shows a picker;
// a leaf category renders its server-driven listing form via DynamicListingForm.
import { ChevronLeft, ChevronRight, Store } from 'lucide-react-native';
import { memo, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/buttons';
import { EmptyState, ErrorState } from '@/components/empty-state';
import { Spinner } from '@/components/loaders';
import { Card, Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';
import { logger } from '@/lib';
import { useTheme } from '@/providers';
import type { ModuleCategory, PreferredLanguage } from '@/types';

import { useListingForm, useSubcategories } from '../../hooks';
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
    return (
      <View style={styles.center}>
        <Spinner />
      </View>
    );
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
      <Text variant="overline" color="textSecondary">
        {t('sell.chooseCategory').toUpperCase()}
      </Text>
      <View style={styles.pickerGrid}>
        {subcategories.map((sub) => (
          <Card key={sub.id} radius="lg" onPress={() => onSelect(sub)}>
            <View style={styles.pickerRow}>
              <Text variant="bodyMedium" numberOfLines={2}>
                {categoryName(sub, language)}
              </Text>
              <ChevronRight
                size={theme.sizing.iconMd}
                color={theme.colors.textTertiary}
              />
            </View>
          </Card>
        ))}
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

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Spinner />
      </View>
    );
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
