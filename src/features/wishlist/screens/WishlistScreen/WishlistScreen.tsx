// Wishlist screen: a two-column grid of the user's saved listings, fetched from
// the backend and rendered with the shared marketplace ListingCard. Unsaving a
// card (its heart) removes it from the grid live; a deleted listing shows a
// "no longer available" placeholder.
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect, useRouter } from 'expo-router';
import { HeartOff, PackageX } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { RefreshControl, View } from 'react-native';

import { EmptyState, ErrorState } from '@/components/empty-state';
import { Spinner } from '@/components/loaders';
import { Header } from '@/components/shared';
import { Screen, Text } from '@/components/ui';
import { routes } from '@/constants';
import type { FeedListing } from '@/features/home/types';
import { ListingCard } from '@/features/marketplace/components/ListingCard';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSavedIds } from '@/store/slices';
import { commonStyles } from '@/utils';

import { wishlistApi } from '../../api';
import type { WishlistItem } from '../../types';
import { createWishlistStyles } from './WishlistScreen.styles';

// Fetch phase of the wishlist screen.
type Phase = 'loading' | 'idle' | 'error' | 'refreshing';

// Renders the wishlist screen.
export function WishlistScreen() {
  const theme = useTheme();
  const styles = useThemedStyles(createWishlistStyles);
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const savedMap = useAppSelector((state) => state.saved.map);

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [phase, setPhase] = useState<Phase>('loading');
  // Whether a first successful fetch has completed (drives spinner vs silent).
  const hasLoaded = useRef(false);

  const load = useCallback(
    (mode: 'initial' | 'refresh' | 'silent') => {
      if (mode === 'initial') {
        setPhase('loading');
      } else if (mode === 'refresh') {
        setPhase('refreshing');
      }
      wishlistApi
        .getAll()
        .then((data) => {
          setItems(data);
          dispatch(setSavedIds(data.map((item) => item.listingId)));
          setPhase('idle');
          hasLoaded.current = true;
        })
        .catch(() => {
          if (mode !== 'silent') {
            setPhase('error');
          }
        });
    },
    [dispatch],
  );

  // Re-fetch every time the tab gains focus so the page always reflects hearts
  // toggled elsewhere (add/remove). The first focus shows a spinner; later ones
  // refresh silently in the background while the current list stays visible.
  useFocusEffect(
    useCallback(() => {
      load(hasLoaded.current ? 'silent' : 'initial');
    }, [load]),
  );

  const openListing = useCallback(
    (listing: FeedListing) => {
      const id = listing.listingId ? String(listing.listingId) : '';
      if (id) {
        router.push(routes.marketListing(id));
      }
    },
    [router],
  );

  // Only keep entries still in the wishlist, so unsaving a card removes it live.
  const visible = items.filter((item) => savedMap[item.listingId]);

  const renderItem = useCallback(
    ({ item }: { item: WishlistItem }) => (
      <View style={styles.cell}>
        {item.listing ? (
          <ListingCard listing={item.listing} onPress={openListing} />
        ) : (
          <View style={styles.unavailable}>
            <PackageX
              size={theme.sizing.iconXl}
              color={theme.colors.textTertiary}
            />
            <Text variant="caption" color="textSecondary" align="center">
              {t('wishlist.unavailable')}
            </Text>
          </View>
        )}
      </View>
    ),
    [styles.cell, styles.unavailable, openListing, theme, t],
  );

  const renderBody = () => {
    if (phase === 'loading') {
      return (
        <View style={styles.center}>
          <Spinner />
        </View>
      );
    }
    if (phase === 'error') {
      return (
        <View style={styles.center}>
          <ErrorState
            onRetry={() => load('initial')}
            retryLabel={t('common.retry')}
          />
        </View>
      );
    }
    if (visible.length === 0) {
      return (
        <EmptyState
          icon={HeartOff}
          title={t('wishlist.emptyTitle')}
          description={t('wishlist.emptyDesc')}
          actionLabel={t('wishlist.browse')}
          onAction={() => router.replace(routes.tabs.home)}
        />
      );
    }
    return (
      <View style={commonStyles.flexOne}>
        <FlashList
          data={visible}
          keyExtractor={(item) => item.listingId}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={phase === 'refreshing'}
              onRefresh={() => load('refresh')}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
        />
      </View>
    );
  };

  return (
    <Screen padded={false}>
      <Header title={t('wishlist.title')} />
      {renderBody()}
    </Screen>
  );
}
