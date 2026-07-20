// Cart line item with image, price and a quantity stepper.
import { Image } from 'expo-image';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { memo, useCallback } from 'react';
import { View } from 'react-native';

import { IconButton } from '@/components/buttons';
import { Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';
import type { CartItem } from '@/types';
import { formatCurrency } from '@/utils';

import { createCartItemStyles } from './CartItemCard.styles';

// Props for the CartItemCard component.
export interface CartItemCardProps {
  // Cart line item to render.
  item: CartItem;
  // Called when the quantity should change to a new value.
  onChangeQuantity: (lineId: string, quantity: number) => void;
  // Called when the item should be removed.
  onRemove: (lineId: string) => void;
}

// Renders a single cart line item.
function CartItemCardComponent({
  item,
  onChangeQuantity,
  onRemove,
}: CartItemCardProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createCartItemStyles);
  const cover = item.product.images[0]?.url;

  // Increments the line item quantity by one.
  const increment = useCallback(
    () => onChangeQuantity(item.id, item.quantity + 1),
    [onChangeQuantity, item.id, item.quantity],
  );

  // Decrements the line item quantity by one.
  const decrement = useCallback(
    () => onChangeQuantity(item.id, item.quantity - 1),
    [onChangeQuantity, item.id, item.quantity],
  );

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: cover }}
        style={styles.image}
        contentFit="cover"
        transition={theme.animation.normal}
        accessibilityLabel={item.product.title}
      />

      <View style={styles.details}>
        <Text variant="bodyMedium" numberOfLines={2}>
          {item.product.title}
        </Text>
        <Text variant="h4">
          {formatCurrency(item.unitPrice, item.product.currency)}
        </Text>

        <View style={styles.controls}>
          <View style={styles.stepper}>
            <IconButton
              icon={Minus}
              size="sm"
              filled
              accessibilityLabel="Decrease quantity"
              onPress={decrement}
            />
            <Text variant="bodyMedium" style={styles.quantity}>
              {item.quantity}
            </Text>
            <IconButton
              icon={Plus}
              size="sm"
              filled
              accessibilityLabel="Increase quantity"
              onPress={increment}
            />
          </View>

          <IconButton
            icon={Trash2}
            size="sm"
            color={theme.colors.danger}
            accessibilityLabel="Remove item"
            onPress={() => onRemove(item.id)}
          />
        </View>
      </View>
    </View>
  );
}

// Memoized cart line item card.
export const CartItemCard = memo(CartItemCardComponent);
