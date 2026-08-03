// Cart screen: line items, order summary and checkout entry point.
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { ShoppingBag } from 'lucide-react-native';
import { useCallback } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/buttons';
import { EmptyState } from '@/components/empty-state';
import { Header } from '@/components/shared';
import { Divider, Screen, Text } from '@/components/ui';
import { routes } from '@/constants';
import { useGoBack, useThemedStyles } from '@/hooks';
import type { CartItem } from '@/types';
import { commonStyles, formatCurrency } from '@/utils';

import { CartItemCard } from '../../components';
import { useCart } from '../../hooks';
import { createCartStyles } from './CartScreen.styles';

// Renders the cart screen.
export function CartScreen() {
  const styles = useThemedStyles(createCartStyles);
  const router = useRouter();
  const goBack = useGoBack();
  const { items, summary, setQuantity, remove } = useCart();

  // Renders a single cart line item.
  const renderItem = useCallback(
    ({ item }: { item: CartItem }) => (
      <CartItemCard item={item} onChangeQuantity={setQuantity} onRemove={remove} />
    ),
    [setQuantity, remove],
  );

  if (items.length === 0) {
    return (
      <Screen padded={false}>
        <Header title="Cart" showBack onBack={goBack} />
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Add products to your cart to see them here."
          actionLabel="Start shopping"
          onAction={() => router.replace(routes.tabs.home)}
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false} edges={['top']}>
      <Header title="Cart" showBack onBack={goBack} />

      {/* The flex wrapper bounds the list between the header and the order
          summary. Without it the list grows to its content height and pushes
          the summary — including the checkout button — off the screen. */}
      <View style={commonStyles.flexOne}>
        <FlashList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text variant="body" color="textSecondary">
            Subtotal
          </Text>
          <Text variant="bodyMedium">{formatCurrency(summary.subtotal)}</Text>
        </View>
        {summary.discount > 0 ? (
          <View style={styles.summaryRow}>
            <Text variant="body" color="textSecondary">
              Discount
            </Text>
            <Text variant="bodyMedium" color="success">
              -{formatCurrency(summary.discount)}
            </Text>
          </View>
        ) : null}
        <View style={styles.summaryRow}>
          <Text variant="body" color="textSecondary">
            Shipping
          </Text>
          <Text variant="bodyMedium">
            {summary.shipping === 0 ? 'Free' : formatCurrency(summary.shipping)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text variant="body" color="textSecondary">
            Tax
          </Text>
          <Text variant="bodyMedium">{formatCurrency(summary.tax)}</Text>
        </View>

        <Divider spaced />

        <View style={styles.summaryRow}>
          <Text variant="h4">Total</Text>
          <Text variant="h4">{formatCurrency(summary.total)}</Text>
        </View>

        <Button
          label="Proceed to checkout"
          style={styles.checkout}
          onPress={() => router.push(routes.checkout)}
        />
      </View>
    </Screen>
  );
}
