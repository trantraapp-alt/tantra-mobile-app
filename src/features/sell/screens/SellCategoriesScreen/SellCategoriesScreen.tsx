// Categories screen for a marketplace module (opened from the Sell sheet).
//
// One scrolling page: a header naming the module and what it is for, the
// module's top-level categories as selectable tab cards, and the grid of
// categories to list in. Picking a category that has no children swaps the
// whole page for that category's listing form.
//
// The screen takes its accent from the module's own visual (agriculture is
// green, livestock blue, services orange), so the tabs, section heading and
// support card all sit in the same family as the module they belong to.
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { PackageX } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  Platform,
  useWindowDimensions,
  View,
} from 'react-native';

import { EmptyState, ErrorState } from '@/components/empty-state';
import { Spinner } from '@/components/loaders';
import { Screen } from '@/components/ui';
import { routes } from '@/constants';
import { useGoBack, useThemedStyles, useTranslation } from '@/hooks';
import type { ModuleCategory } from '@/types';

import {
  SellCategoryForm,
  SellModuleGlow,
  SellModuleHeader,
  SellModuleTabs,
} from '../../components';
import { useModuleCategories, useModules } from '../../hooks';
import {
  expectsSubcategories,
  getCategoryName,
  getModuleBlurbKey,
  getModuleName,
  getModuleVisual,
} from '../../utils';
import { createSellCategoriesStyles } from './SellCategoriesScreen.styles';

// How far down the page the header's accent bloom reaches, and how much of the
// width it spans — enough to sit behind the header, the tabs and the top of the
// first card row.
const GLOW_HEIGHT = 340;
const GLOW_WIDTH_RATIO = 0.6;

// Renders the module's category browse page and the listing form it opens.
export function SellCategoriesScreen() {
  const styles = useThemedStyles(createSellCategoriesStyles);
  const goBack = useGoBack();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ moduleId: string; title?: string }>();
  const moduleId = Number(params.moduleId);
  const { categories, language, isLoading, isError, refetch } =
    useModuleCategories(moduleId);
  // The module itself, for its name, description and accent. Already in the
  // store by the time the sell sheet has opened this screen; the hook refetches
  // it when the screen is reached some other way (a deep link, say).
  const { modules } = useModules();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  // The subcategory the user has drilled into (owned here so the single header
  // drives back navigation), and whether the selected top category is itself a
  // leaf. Either makes us "drilled": the tabs hide and the form goes full-screen.
  const [activeSub, setActiveSub] = useState<ModuleCategory | null>(null);
  const [isLeafTop, setIsLeafTop] = useState(false);

  const module = useMemo(
    () => modules.find((entry) => entry.id === moduleId) ?? null,
    [modules, moduleId],
  );
  const moduleVisual = module ? getModuleVisual(module.moduleKey) : null;
  const accent = moduleVisual?.accent ?? 'primary';

  // Whether selecting a category opens a full-screen form (a listing leaf or a
  // business profile like Veterinary) versus showing the tabs with a grid (a
  // marketplace grouping). Guessed from the category so the layout — and its
  // skeleton — is right the instant it's selected, before children load.
  const opensFullScreen = useCallback(
    (category: ModuleCategory) => !expectsSubcategories(category),
    [],
  );

  // Default to the first browse (grid) category so we land on the category page
  // rather than straight into a full-screen form; fall back to the first one.
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
  // tabs hide and the form is full-screen; the header names the open category.
  const drilled = activeSub !== null || isLeafTop;
  const openLeaf = drilled ? (activeSub ?? selectedCategory) : null;

  // Selecting a top category from the tabs resets any drilled subcategory and
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
  // grid to return to, so switch to a browse (grid) category — bringing the tabs
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
  // module screen) — a subcategory returns to its grid, a leaf top to the tabs.
  const handleListingCreated = useCallback(() => {
    if (activeSub) {
      setActiveSub(null);
    } else {
      exitToBrowse();
    }
  }, [activeSub, exitToBrowse]);

  // The support card's action opens the app's messaging surface.
  const handleSupport = useCallback(() => {
    router.push(routes.tabs.chat);
  }, [router]);

  // Header title: the open category when drilled, else the module name (from
  // the store, falling back to the name the sell sheet passed through).
  const moduleName = module
    ? getModuleName(module, language)
    : (params.title ?? t('sell.categoriesTitle'));
  const headerTitle = openLeaf
    ? getCategoryName(openLeaf, language)
    : moduleName;

  // The top-category tabs ride at the top of the browse page's scroll, so they
  // are handed to the form as its header rather than pinned above it. A
  // full-screen form covers the page, so it gets none.
  const tabs = drilled ? undefined : (
    <SellModuleTabs
      categories={categories}
      selectedId={selectedId}
      language={language}
      accent={accent}
      onSelect={selectTop}
    />
  );

  return (
    // The header carries the brand gradient up through the status bar, so it
    // owns the top inset and the screen only insets the bottom.
    <Screen padded={false} edges={['bottom']}>
      <View
        style={[styles.glow, { width: width * GLOW_WIDTH_RATIO }]}
        pointerEvents="none"
      >
        <SellModuleGlow
          width={width * GLOW_WIDTH_RATIO}
          height={GLOW_HEIGHT}
          accent={accent}
        />
      </View>

      <SellModuleHeader
        title={headerTitle}
        subtitle={
          drilled || !module ? undefined : t(getModuleBlurbKey(module.moduleKey))
        }
        emoji={drilled ? undefined : moduleVisual?.emoji}
        onBack={handleBack}
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
        <View style={styles.body}>
          {selectedCategory ? (
            <SellCategoryForm
              key={selectedCategory.id}
              category={selectedCategory}
              language={language}
              accent={accent}
              header={tabs}
              activeSub={activeSub}
              onActiveSubChange={setActiveSub}
              onLeafTopChange={setIsLeafTop}
              onListingCreated={handleListingCreated}
              onSupportPress={handleSupport}
            />
          ) : null}
        </View>
      )}
    </Screen>
  );
}
