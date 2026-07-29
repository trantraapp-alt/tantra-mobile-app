// Categories screen for a marketplace module (opened from the Sell sheet).
// Split layout: a 30% vertical category rail on the left drives a 70% listing
// form on the right.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PackageX } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { EmptyState, ErrorState } from '@/components/empty-state';
import { Spinner } from '@/components/loaders';
import { Header } from '@/components/shared';
import { Screen } from '@/components/ui';
import { useThemedStyles } from '@/hooks';
import type { ModuleCategory } from '@/types';

import { SellCategoryForm, SellCategoryRail } from '../../components';
import { useModuleCategories } from '../../hooks';
import { expectsSubcategories, getCategoryName } from '../../utils';
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
  // The subcategory the user has drilled into (owned here so the single header
  // drives back navigation), and whether the selected top category is itself a
  // leaf. Either makes us "drilled": the rail hides and the form goes full-screen.
  const [activeSub, setActiveSub] = useState<ModuleCategory | null>(null);
  const [isLeafTop, setIsLeafTop] = useState(false);

  // Whether selecting a category opens a full-screen leaf form (a listing leaf),
  // versus showing the rail with a grid (marketplace) or a business-profile
  // placeholder. Guessed from the category so the layout — and its skeleton — is
  // right the instant it's selected, before children load.
  const opensFullScreen = useCallback(
    (category: ModuleCategory) =>
      category.actionType !== 'BUSINESS_PROFILE' &&
      !expectsSubcategories(category),
    [],
  );

  // Default to the first category once the list has loaded.
  useEffect(() => {
    const first = categories[0];
    if (selectedId === null && first) {
      setSelectedId(first.id);
      setIsLeafTop(opensFullScreen(first));
    }
  }, [categories, selectedId, opensFullScreen]);

  // Currently selected category, resolved from the loaded list.
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedId) ?? null,
    [categories, selectedId],
  );

  // "Drilled" = a subcategory chosen, or the top category is itself a leaf. The
  // rail hides and the form is full-screen; the header names the open category.
  const drilled = activeSub !== null || isLeafTop;
  const openLeaf = drilled ? (activeSub ?? selectedCategory) : null;

  // Selecting a top category from the rail resets any drilled subcategory and
  // guesses the layout up-front so the correct skeleton shows immediately, with
  // no flash of the wrong layout while children load.
  const selectTop = useCallback(
    (category: ModuleCategory) => {
      setActiveSub(null);
      setIsLeafTop(opensFullScreen(category));
      setSelectedId(category.id);
    },
    [opensFullScreen],
  );

  // Backing out of a leaf top category's full-screen form has no grid to return
  // to, so switch to another category (the first that isn't the current one) —
  // typically the marketplace grid — bringing the rail back.
  const exitToBrowse = useCallback(() => {
    const fallback =
      categories.find((category) => category.id !== selectedId) ?? categories[0];
    setActiveSub(null);
    setIsLeafTop(false);
    if (fallback) {
      setSelectedId(fallback.id);
    }
  }, [categories, selectedId]);

  // Single header back: leave the module when browsing; step up one level when
  // drilled — a subcategory returns to its grid, a leaf top to the browser.
  const handleBack = useCallback(() => {
    if (!drilled) {
      router.back();
      return;
    }
    if (activeSub) {
      setActiveSub(null);
      return;
    }
    exitToBrowse();
  }, [drilled, activeSub, exitToBrowse, router]);

  // Header title: the open category when drilled, else the module name.
  const headerTitle = openLeaf
    ? getCategoryName(openLeaf, language)
    : (params.title ?? 'Categories');

  return (
    <Screen padded={false}>
      <Header showBack onBack={handleBack} title={headerTitle} />

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
          {!drilled ? (
            <View style={styles.rail}>
              <SellCategoryRail
                categories={categories}
                selectedId={selectedId}
                language={language}
                onSelect={selectTop}
              />
            </View>
          ) : null}

          <View style={styles.form}>
            {selectedCategory ? (
              <SellCategoryForm
                key={selectedCategory.id}
                category={selectedCategory}
                language={language}
                activeSub={activeSub}
                onActiveSubChange={setActiveSub}
                onLeafTopChange={setIsLeafTop}
              />
            ) : null}
          </View>
        </View>
      )}
    </Screen>
  );
}
