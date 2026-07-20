// Right-pane listing form for a selected category. Fetches the category's
// server-driven form schema from the API and renders it via DynamicListingForm,
// with loading and error states.
import { memo, useEffect } from 'react';
import { View } from 'react-native';

import { ErrorState } from '@/components/empty-state';
import { Spinner } from '@/components/loaders';
import { useThemedStyles } from '@/hooks';
import { logger } from '@/lib';
import type { ModuleCategory, PreferredLanguage } from '@/types';

import { useListingForm } from '../../hooks';
import { DynamicListingForm } from '../DynamicListingForm';
import { createSellCategoryFormStyles } from './SellCategoryForm.styles';

// Props for the SellCategoryForm component.
export interface SellCategoryFormProps {
  // Category whose listing form is being filled.
  category: ModuleCategory;
  // Active app language controlling labels.
  language: PreferredLanguage;
}

// Renders the selected category's listing form from the API.
function SellCategoryFormComponent({
  category,
  language,
}: SellCategoryFormProps) {
  const styles = useThemedStyles(createSellCategoryFormStyles);
  const { form, isError, refetch } = useListingForm(category.id);

  // Log which category's form is being requested, to verify the API call.
  useEffect(() => {
    logger.info('[Sell] Category selected', {
      category: category.categoryKey,
      name: category.categoryNameEn,
      categoryId: category.id,
      endpoint: `/categories/${category.id}/form?listingType=SELL`,
    });
  }, [category.categoryKey, category.categoryNameEn, category.id]);

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

// Memoized category listing form.
export const SellCategoryForm = memo(SellCategoryFormComponent);
