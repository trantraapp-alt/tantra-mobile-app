// Displays a price with an optional struck-through original price and discount.
import { memo } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useThemedStyles } from '@/hooks';
import type { Money } from '@/types';
import { formatCurrency } from '@/utils';

import { createPriceTagStyles } from './PriceTag.styles';

// Props for the PriceTag component.
export interface PriceTagProps {
  // Current selling price.
  price: Money;
  // Optional original price shown struck through.
  compareAtPrice?: Money;
  // Optional discount percentage badge.
  discountPercentage?: number;
  // Currency ISO code.
  currency?: string;
  // Size preset controlling the primary price typography.
  size?: 'md' | 'lg';
}

// Renders a price with optional discount context.
function PriceTagComponent({
  price,
  compareAtPrice,
  discountPercentage,
  currency,
  size = 'md',
}: PriceTagProps) {
  const styles = useThemedStyles(createPriceTagStyles);
  const hasDiscount = compareAtPrice !== undefined && compareAtPrice > price;

  return (
    <View style={styles.container}>
      <Text variant={size === 'lg' ? 'h3' : 'h4'}>
        {formatCurrency(price, currency)}
      </Text>
      {hasDiscount && compareAtPrice !== undefined ? (
        <Text
          variant="caption"
          color="textTertiary"
          style={styles.compareAt}
        >
          {formatCurrency(compareAtPrice, currency)}
        </Text>
      ) : null}
      {discountPercentage ? (
        <Text variant="label" color="success" style={styles.discount}>
          {discountPercentage}% off
        </Text>
      ) : null}
    </View>
  );
}

// Memoized themed price tag.
export const PriceTag = memo(PriceTagComponent);
