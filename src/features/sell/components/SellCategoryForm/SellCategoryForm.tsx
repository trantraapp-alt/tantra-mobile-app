// Right-pane content for a selected top-level category. Resolves the category
// tree: a BUSINESS_PROFILE category hands off to the Business Profile create
// flow; a category with subcategories shows the category browse page; a leaf
// category renders its server-driven listing form via DynamicListingForm.
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { memo, useEffect } from 'react';
import { ScrollView, View } from 'react-native';

import { ErrorState } from '@/components/empty-state';
import { Skeleton } from '@/components/loaders';
import { InfoBanner } from '@/components/ui';
import { routes } from '@/constants';
import { useThemedStyles, useTranslation } from '@/hooks';
import { logger } from '@/lib';
import { useTheme } from '@/providers';
import type { ModuleCategory, PreferredLanguage } from '@/types';

import { useListingForm, useSubcategories } from '../../hooks';
import { type AccentKey, expectsSubcategories } from '../../utils';
import { DynamicListingForm } from '../DynamicListingForm';
import { SellCategoryPicker } from '../SellCategoryPicker';
import { createSellCategoryFormStyles } from './SellCategoryForm.styles';

// Props for the SellCategoryForm component.
export interface SellCategoryFormProps {
  // Selected top-level category.
  category: ModuleCategory;
  // Active app language controlling labels.
  language: PreferredLanguage;
  // Accent for the browse page's heading and support card (the module's).
  accent?: AccentKey;
  // Content rendered above the browse page's heading — the module tabs. Only
  // the grid shows them; a full-screen form covers the whole pane.
  header?: ReactNode;
  // The subcategory the user has drilled into (screen-owned), or null on the
  // grid. Lifting it up lets the single screen header drive the back navigation.
  activeSub?: ModuleCategory | null;
  // Called when a subcategory is chosen (or cleared) from the grid.
  onActiveSubChange?: (sub: ModuleCategory | null) => void;
  // Reports whether the selected category is itself a leaf (no subcategories),
  // so the screen can hide the tabs and show the form full-screen.
  onLeafTopChange?: (isLeafTop: boolean) => void;
  // Called after a listing is created, so the screen can reset back to the
  // module's category browse.
  onListingCreated?: () => void;
  // Called when the browse page's support action is pressed.
  onSupportPress?: () => void;
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

// Renders the listing form for a leaf category.
function LeafForm({
  category,
  language,
  onSubmitSuccess,
}: {
  category: ModuleCategory;
  language: PreferredLanguage;
  onSubmitSuccess?: () => void;
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
        onSubmitSuccess={onSubmitSuccess}
      />
    </View>
  );
}

// Resolves a top-level category into the category browse page or a leaf form.
function CategoryResolver({
  category,
  language,
  accent,
  header,
  activeSub,
  onActiveSubChange,
  onLeafTopChange,
  onListingCreated,
  onSupportPress,
}: SellCategoryFormProps) {
  const styles = useThemedStyles(createSellCategoryFormStyles);
  const router = useRouter();
  const { subcategories, isLoading, isError, refetch } = useSubcategories(
    category.id,
  );

  // A leaf top category (no children, e.g. Services / Repair) opens its form
  // full-screen just like a chosen subcategory. Report it so the screen hides
  // the tabs and drives the back navigation from its single header. During load
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
  // a grouping category (marketplace) shows the browse page with placeholder
  // cards; a leaf category (services, repair) shows a form placeholder.
  if (isLoading) {
    return expectsSubcategories(category) ? (
      <SellCategoryPicker
        loading
        subcategories={[]}
        language={language}
        accent={accent}
        header={header}
        onSelect={() => undefined}
      />
    ) : (
      <FormSkeleton />
    );
  }
  // Keep the tabs above a failed load: the categories that failed are one
  // branch of the module, and the user should still be able to switch to
  // another rather than backing out of the screen entirely.
  if (isError) {
    return (
      <View style={styles.errorWrap}>
        {header}
        <View style={styles.center}>
          <ErrorState onRetry={refetch} />
        </View>
      </View>
    );
  }
  // Full-screen leaf form: a chosen subcategory or a leaf top category. The
  // screen header owns the back navigation, so no in-form back row is needed.
  if (leaf) {
    return leaf.actionType === 'BUSINESS_PROFILE' ? null : (
      <LeafForm
        category={leaf}
        language={language}
        onSubmitSuccess={onListingCreated}
      />
    );
  }
  return (
    <SellCategoryPicker
      subcategories={subcategories}
      language={language}
      accent={accent}
      header={header}
      onSelect={(sub) => onActiveSubChange?.(sub)}
      onSupportPress={onSupportPress}
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

// Renders the selected category's content (browse / form / business-profile handoff).
function SellCategoryFormComponent({
  category,
  language,
  accent,
  header,
  activeSub,
  onActiveSubChange,
  onLeafTopChange,
  onListingCreated,
  onSupportPress,
}: SellCategoryFormProps) {
  if (category.actionType === 'BUSINESS_PROFILE') {
    return <BusinessProfileNavigator category={category} />;
  }
  return (
    <CategoryResolver
      category={category}
      language={language}
      accent={accent}
      header={header}
      activeSub={activeSub}
      onActiveSubChange={onActiveSubChange}
      onLeafTopChange={onLeafTopChange}
      onListingCreated={onListingCreated}
      onSupportPress={onSupportPress}
    />
  );
}

// Memoized category resolver.
export const SellCategoryForm = memo(SellCategoryFormComponent);
