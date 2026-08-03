// Categories screen for a marketplace module (opened from the Sell sheet).
// Split layout: a 30% vertical category rail on the left drives a 70% listing
// form on the right.
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { PackageX } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, Platform, View } from 'react-native';

import { EmptyState, ErrorState } from '@/components/empty-state';
import { Spinner } from '@/components/loaders';
import { Header } from '@/components/shared';
import { Screen } from '@/components/ui';
import { useGoBack, useThemedStyles } from '@/hooks';
import type { ModuleCategory } from '@/types';

import { SellCategoryForm, SellCategoryRail } from '../../components';
import { useModuleCategories } from '../../hooks';
import { expectsSubcategories, getCategoryName } from '../../utils';
import { createSellCategoriesStyles } from './SellCategoriesScreen.styles';

// Renders the split category rail + listing form for a module.
export function SellCategoriesScreen() {
  const styles = useThemedStyles(createSellCategoriesStyles);
  const goBack = useGoBack();
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

  // Whether selecting a category opens a full-screen form (a listing leaf or a
  // business profile like Veterinary) versus showing the rail with a grid (a
  // marketplace grouping). Guessed from the category so the layout — and its
  // skeleton — is right the instant it's selected, before children load.
  const opensFullScreen = useCallback(
    (category: ModuleCategory) => !expectsSubcategories(category),
    [],
  );

  // Default to the first browse (grid) category so we land on a rail view rather
  // than straight into a full-screen form; fall back to the first category.
  useEffect(() => {
    if (selectedId !== null) {
      return;
    }
    const first =
      categories.find((category) => !opensFullScreen(category)) ?? categories[0];
    if (first) {
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

  // Backing out of a full-screen top category (leaf or business profile) has no
  // grid to return to, so switch to a browse (grid) category — bringing the rail
  // back — preferring one that isn't the current category.
  const exitToBrowse = useCallback(() => {
    const target =
      categories.find(
        (category) => category.id !== selectedId && !opensFullScreen(category),
      ) ??
      categories.find((category) => category.id !== selectedId) ??
      categories[0];
    setActiveSub(null);
    if (target) {
      setSelectedId(target.id);
      setIsLeafTop(opensFullScreen(target));
    }
  }, [categories, selectedId, opensFullScreen]);

  // Single header back: leave the module when browsing; step up one level when
  // drilled — a subcategory returns to its grid, a leaf top to the browser.
  const handleBack = useCallback(() => {
    if (!drilled) {
      goBack();
      return;
    }
    if (activeSub) {
      setActiveSub(null);
      return;
    }
    exitToBrowse();
  }, [drilled, activeSub, exitToBrowse, goBack]);

  // Android hardware back must follow the same in-screen hierarchy as the
  // header chevron. Without this it pops the whole sell flow from inside a
  // drilled-in form, silently discarding a half-filled listing. The handler is
  // registered only while drilled, so at the top level the default pop stands.
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android' || !drilled) {
        return;
      }
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          handleBack();
          // Consume the press: we stepped up one level in-screen.
          return true;
        },
      );
      return () => subscription.remove();
    }, [drilled, handleBack]),
  );

  // After a listing is posted, reset back to the module's category browse (the
  // module screen) — a subcategory returns to its grid, a leaf top to the rail.
  const handleListingCreated = useCallback(() => {
    if (activeSub) {
      setActiveSub(null);
    } else {
      exitToBrowse();
    }
  }, [activeSub, exitToBrowse]);

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
                onListingCreated={handleListingCreated}
              />
            ) : null}
          </View>
        </View>
      )}
    </Screen>
  );
}
