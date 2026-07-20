// Star rating display with an optional review count.
import { Star } from 'lucide-react-native';
import { memo, useMemo } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';
import { formatCompactNumber } from '@/utils';

import { createRatingStyles } from './Rating.styles';

// Props for the Rating component.
export interface RatingProps {
  // Rating value between 0 and 5.
  value: number;
  // Optional number of ratings to display alongside the stars.
  count?: number;
  // Number of stars to render.
  maxStars?: number;
  // Star icon size preset.
  size?: 'sm' | 'md';
}

// Renders a row of stars representing a rating value.
function RatingComponent({
  value,
  count,
  maxStars = 5,
  size = 'sm',
}: RatingProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createRatingStyles);
  const iconSize = size === 'sm' ? theme.sizing.iconSm : theme.sizing.iconMd;

  // Precomputes which stars are filled based on the rounded rating.
  const stars = useMemo(
    () => Array.from({ length: maxStars }, (_, index) => index < Math.round(value)),
    [maxStars, value],
  );

  return (
    <View style={styles.container}>
      <View style={styles.stars}>
        {stars.map((filled, index) => (
          <Star
            key={index}
            size={iconSize}
            color={theme.colors.rating}
            fill={filled ? theme.colors.rating : theme.colors.transparent}
          />
        ))}
      </View>
      {typeof count === 'number' ? (
        <Text variant="caption" color="textSecondary" style={styles.count}>
          {value.toFixed(1)} ({formatCompactNumber(count)})
        </Text>
      ) : null}
    </View>
  );
}

// Memoized themed rating.
export const Rating = memo(RatingComponent);
