// Presentational product card showing image, price, rating and wishlist toggle.
import { Image } from 'expo-image';
import { Heart } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Badge, PriceTag, Rating, Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';
import type { Product } from '@/types';

import { createProductCardStyles } from './ProductCard.styles';

// Props for the ProductCard component.
export interface ProductCardProps {
  // Product information to display.
  product: Product;
  // Whether the product is currently wishlisted.
  isWishlisted: boolean;
  // Called when the card is pressed.
  onPress: (product: Product) => void;
  // Called when the wishlist toggle is pressed.
  onToggleWishlist: (product: Product) => void;
}

// Renders a single product card.
function ProductCardComponent({
  product,
  isWishlisted,
  onPress,
  onToggleWishlist,
}: ProductCardProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createProductCardStyles);
  const coverImage = product.images[0]?.url;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={product.title}
      onPress={() => onPress(product)}
      style={styles.container}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: coverImage }}
          style={styles.image}
          contentFit="cover"
          transition={theme.animation.normal}
          accessibilityLabel={product.title}
        />
        {product.discountPercentage ? (
          <View style={styles.badge}>
            <Badge label={`${product.discountPercentage}% OFF`} tone="danger" />
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'
          }
          hitSlop={theme.sizing.hitSlop}
          onPress={() => onToggleWishlist(product)}
          style={styles.wishlist}
        >
          <Heart
            size={theme.sizing.iconMd}
            color={isWishlisted ? theme.colors.danger : theme.colors.textSecondary}
            fill={isWishlisted ? theme.colors.danger : theme.colors.transparent}
          />
        </Pressable>
        {!product.inStock ? (
          <View style={styles.outOfStock}>
            <Text variant="label" color="onPrimary">
              Out of stock
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        {product.brand ? (
          <Text variant="overline" color="textTertiary" numberOfLines={1}>
            {product.brand}
          </Text>
        ) : null}
        <Text variant="bodyMedium" numberOfLines={2} style={styles.title}>
          {product.title}
        </Text>
        <Rating value={product.rating} count={product.ratingCount} />
        <PriceTag
          price={product.price}
          compareAtPrice={product.compareAtPrice}
          currency={product.currency}
        />
      </View>
    </Pressable>
  );
}

// Memoized presentational product card.
export const ProductCard = memo(ProductCardComponent);
