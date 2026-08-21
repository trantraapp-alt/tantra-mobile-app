// Shared listing-screen header: the brand gradient bar (same design as the
// listing-detail header) filling the status bar, carrying a round back button,
// a title + result-count block, and search / filter actions. Only the chrome is
// shared — each screen supplies its own title, count and handlers.
//
// The search icon opens an in-place search field (no navigation) bound to the
// caller's controlled query; the back button closes it first. Set
// `searchAlwaysOpen` on the search screen, where the field replaces the title.
// A fixed content height keeps the bar from jumping when search toggles.
import { ArrowLeft, Search, SlidersHorizontal } from 'lucide-react-native';
import { memo, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconButton } from '@/components/buttons';
import { SearchBar } from '@/components/inputs';
import { BrandHeaderBackdrop } from '@/components/shared';
import { Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';

import { createListingHeaderStyles } from './ListingHeader.styles';

// Props for the ListingHeader.
export interface ListingHeaderProps {
  // Group / screen title shown when search is closed.
  title: string;
  // Optional result-count line under the title (e.g. "128 results").
  resultLabel?: string;
  // Whether to show the back button (false when used as a bottom tab).
  showBack?: boolean;
  // Called when back is pressed (only when search is not open to close).
  onBack: () => void;
  // Controlled search text.
  query: string;
  // Called as the search text changes.
  onQueryChange: (query: string) => void;
  // Called when the query is submitted (optional).
  onSubmitQuery?: () => void;
  // Search field placeholder.
  searchPlaceholder?: string;
  // Opens the filter sheet.
  onOpenFilters: () => void;
  // Keep the search field always visible (search screen) instead of a title.
  searchAlwaysOpen?: boolean;
}

// Renders the shared listing header.
function ListingHeaderComponent({
  title,
  resultLabel,
  showBack = true,
  onBack,
  query,
  onQueryChange,
  onSubmitQuery,
  searchPlaceholder,
  onOpenFilters,
  searchAlwaysOpen = false,
}: ListingHeaderProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createListingHeaderStyles);
  const { t } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();
  const [searchOpen, setSearchOpen] = useState(false);

  const showSearch = searchAlwaysOpen || searchOpen;
  // Show the leading button to navigate back, OR to close an open in-place
  // search — the latter even on tab screens that otherwise hide the back button.
  const showLeading = showBack || (searchOpen && !searchAlwaysOpen);
  const handleBack = () => {
    if (searchOpen && !searchAlwaysOpen) {
      setSearchOpen(false);
      onQueryChange('');
      return;
    }
    onBack();
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeWrap}>
      <BrandHeaderBackdrop width={windowWidth} />
    <View style={styles.header}>
      {showLeading ? (
        <IconButton
          icon={ArrowLeft}
          accessibilityLabel={t('common.back')}
          onPress={handleBack}
          style={styles.iconBtn}
          color={theme.colors.textPrimary}
        />
      ) : null}

      {showSearch ? (
        <View style={styles.searchWrap}>
          <SearchBar
            value={query}
            onChangeText={onQueryChange}
            onClear={() => onQueryChange('')}
            onSubmit={onSubmitQuery}
            placeholder={searchPlaceholder ?? t('market.searchPlaceholder')}
            autoFocus={!searchAlwaysOpen}
          />
        </View>
      ) : (
        <>
          <View style={styles.titleBlock}>
            <Text variant="h4" color="onPrimary" numberOfLines={1}>
              {title}
            </Text>
            {resultLabel ? (
              <Text
                variant="caption"
                color="onPrimary"
                style={styles.resultLabel}
                numberOfLines={1}
              >
                {resultLabel}
              </Text>
            ) : null}
          </View>
          <IconButton
            icon={Search}
            accessibilityLabel={t('market.searchPlaceholder')}
            onPress={() => setSearchOpen(true)}
            color={theme.colors.onPrimary}
          />
        </>
      )}

      <IconButton
        icon={SlidersHorizontal}
        accessibilityLabel={t('market.filtersButton')}
        onPress={onOpenFilters}
        color={theme.colors.onPrimary}
      />
    </View>
    </SafeAreaView>
  );
}

// Memoized shared listing header.
export const ListingHeader = memo(ListingHeaderComponent);
