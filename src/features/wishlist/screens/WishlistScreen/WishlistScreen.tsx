// Wishlist screen: grid of saved products backed by the Redux wishlist.
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { HeartOff } from 'lucide-react-native';
import { useCallback } from 'react';
import { View } from 'react-native';

import { ProductCard } from '@/components/cards';
import { EmptyState } from '@/components/empty-state';
import { Header } from '@/components/shared';
import { Screen } from '@/components/ui';
import { routes } from '@/constants';
import { useThemedStyles, useTranslation } from '@/hooks';
import type { Product } from '@/types';
import { commonStyles } from '@/utils';

import { useWishlist } from '../../hooks';
import { createWishlistStyles } from './WishlistScreen.styles';

// Renders the wishlist screen.
export function WishlistScreen() {
  const styles = useThemedStyles(createWishlistStyles);
  const { t } = useTranslation();
  const router = useRouter();
  const { items, toggle, isWishlisted } = useWishlist();

  // Navigates to a product's detail screen.
  const handlePress = useCallback(
    (product: Product) => router.push(routes.product(product.id)),
    [router],
  );

  // Renders a single wishlist product cell.
  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <View style={styles.cell}>
        <ProductCard
          product={item}
          isWishlisted={isWishlisted(item.id)}
          onPress={handlePress}
          onToggleWishlist={toggle}
        />
      </View>
    ),
    [styles.cell, isWishlisted, handlePress, toggle],
  );

  return (
    <Screen padded={false}>
      <Header title={t('wishlist.title')} />
      {items.length === 0 ? (
        <EmptyState
          icon={HeartOff}
          title={t('wishlist.emptyTitle')}
          description={t('wishlist.emptyDesc')}
          actionLabel={t('wishlist.browse')}
          onAction={() => router.replace(routes.tabs.home)}
        />
      ) : (
        // The flex wrapper bounds the grid below the header so FlashList
        // scrolls internally rather than growing to its full content height.
        <View style={commonStyles.flexOne}>
          <FlashList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            numColumns={2}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </Screen>
  );
}
