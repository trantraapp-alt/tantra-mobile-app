// Right-pane content for a selected top-level category. Resolves the category
// tree: a BUSINESS_PROFILE category (e.g. Veterinary) opens the business-profile
// form; a category with subcategories shows a picker; a leaf category renders
// its server-driven listing form via DynamicListingForm.
import { Image } from 'expo-image';
import { Clock, Store } from 'lucide-react-native';
import { memo, useCallback, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { EmptyState, ErrorState } from '@/components/empty-state';
import { Skeleton } from '@/components/loaders';
import { Card, InfoBanner, Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';
import { logger } from '@/lib';
import { useTheme, useToast } from '@/providers';
import type { ModuleCategory, PreferredLanguage } from '@/types';

import { businessProfilesApi } from '../../api';
import { ensureAddressSection } from '../../forms/address';
import { buildBusinessProfilePayload } from '../../forms/businessProfilePayload';
import { type ListingForm, localize } from '../../forms/listingForm.types';
import type {
  CreateListingPayload,
  ListingValues,
} from '../../forms/listingPayload';
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

// Business-profile form (e.g. Veterinary / vet_clinic): a BUSINESS_PROFILE
// category has no listing form, so it fetches the authenticated profile form,
// renders it with the shared engine, and submits it — landing in a "pending
// review" state on success (the backend approves it before it goes live).
function BusinessProfileForm({
  category,
  language,
}: {
  category: ModuleCategory;
  language: PreferredLanguage;
}) {
  const styles = useThemedStyles(createSellCategoryFormStyles);
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const profileType = category.linkKey ?? '';
  const [form, setForm] = useState<ListingForm | null>(null);
  const [status, setStatus] = useState<
    'loading' | 'ready' | 'error' | 'submitted'
  >('loading');
  const [pendingMessage, setPendingMessage] = useState('');

  const load = useCallback(async () => {
    if (!profileType) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      const raw = await businessProfilesApi.getForm(profileType);
      // Adapt the profile form to the listing-form shape the renderer expects,
      // and ensure it carries an address section (a no-op if it already has one)
      // so the same form drives both rendering and the submit payload.
      setForm(
        ensureAddressSection({
          ...raw,
          categoryId: category.id,
          listingType: 'BUSINESS_PROFILE',
        }),
      );
      setStatus('ready');
    } catch (error) {
      logger.warn('[BusinessProfile] Failed to load form', {
        profileType,
        error,
      });
      setStatus('error');
    }
  }, [profileType, category.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = useCallback(
    async (_payload: CreateListingPayload, values: ListingValues) => {
      if (!form) {
        return;
      }
      try {
        const result = await businessProfilesApi.create(
          buildBusinessProfilePayload(form, values, profileType),
        );
        const message =
          typeof result.message === 'string'
            ? result.message
            : result.message
              ? localize(result.message, language)
              : t('businessProfile.pendingDesc');
        setPendingMessage(message);
        setStatus('submitted');
        showSuccess(t('businessProfile.pendingTitle'));
      } catch (error) {
        logger.warn('[BusinessProfile] Submit failed', error);
        showError(t('businessProfile.submitError'));
      }
    },
    [form, profileType, language, t, showSuccess, showError],
  );

  if (status === 'loading') {
    return <FormSkeleton />;
  }
  if (status === 'error') {
    return (
      <View style={styles.center}>
        {profileType ? (
          <ErrorState
            description={t('businessProfile.loadError')}
            onRetry={load}
          />
        ) : (
          <EmptyState
            icon={Store}
            title={t('sell.businessProfileTitle')}
            description={t('businessProfile.missingType')}
          />
        )}
      </View>
    );
  }
  if (status === 'submitted') {
    return (
      <View style={styles.center}>
        <EmptyState
          icon={Clock}
          title={t('businessProfile.pendingTitle')}
          description={pendingMessage || t('businessProfile.pendingDesc')}
        />
      </View>
    );
  }
  if (!form) {
    return <FormSkeleton />;
  }
  return (
    <View style={styles.leafFormWrap}>
      <View style={styles.leafInfo}>
        <InfoBanner tone="info" message={t('businessProfile.info')} />
      </View>
      <DynamicListingForm
        form={form}
        language={language}
        categoryKey={category.categoryKey}
        submitLabel={t('businessProfile.submit')}
        onSubmit={handleSubmit}
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
  const leaf = activeSub ?? (isLeafTop ? category : null);
  if (leaf) {
    return leaf.actionType === 'BUSINESS_PROFILE' ? (
      <BusinessProfileForm category={leaf} language={language} />
    ) : (
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

// Renders the selected category's content (picker / form / handoff).
function SellCategoryFormComponent({
  category,
  language,
  activeSub,
  onActiveSubChange,
  onLeafTopChange,
}: SellCategoryFormProps) {
  if (category.actionType === 'BUSINESS_PROFILE') {
    return <BusinessProfileForm category={category} language={language} />;
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
