// Categories screen for a marketplace module (opened from the Sell sheet).
// Split layout: a 30% vertical category rail on the left drives a 70% listing
// form on the right.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PackageX } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { EmptyState, ErrorState } from '@/components/empty-state';
import { Spinner } from '@/components/loaders';
import { Header } from '@/components/shared';
import { Screen } from '@/components/ui';
import { useThemedStyles } from '@/hooks';

import { SellCategoryForm, SellCategoryRail } from '../../components';
import { useModuleCategories } from '../../hooks';
import { createSellCategoriesStyles } from './SellCategoriesScreen.styles';

// Renders the split category rail + listing form for a module.
export function SellCategoriesScreen() {
  const styles = useThemedStyles(createSellCategoriesStyles);
  const router = useRouter();
  const params = useLocalSearchParams<{ moduleId: string; title?: string }>();
  const moduleId = Number(params.moduleId);
  const { categories, language, isLoading, isError, refetch } =
    useModuleCategories(moduleId);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Default to the first category once the list has loaded.
  useEffect(() => {
    const first = categories[0];
    if (selectedId === null && first) {
      setSelectedId(first.id);
    }
  }, [categories, selectedId]);

  // Currently selected category, resolved from the loaded list.
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedId) ?? null,
    [categories, selectedId],
  );

  return (
    <Screen padded={false}>
      <Header
        showBack
        onBack={() => router.back()}
        title={params.title ?? 'Categories'}
      />

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={PackageX}
          title="No categories yet"
          description="Categories for this module will appear here."
        />
      ) : (
        <View style={styles.split}>
          <View style={styles.rail}>
            <SellCategoryRail
              categories={categories}
              selectedId={selectedId}
              language={language}
              onSelect={(category) => setSelectedId(category.id)}
            />
          </View>

          <View style={styles.form}>
            {selectedCategory ? (
              <SellCategoryForm
                key={selectedCategory.id}
                category={selectedCategory}
                language={language}
              />
            ) : null}
          </View>
        </View>
      )}
    </Screen>
  );
}
