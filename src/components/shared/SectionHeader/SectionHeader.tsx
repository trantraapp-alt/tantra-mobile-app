// Section title row with an optional trailing action link.
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';

import { createSectionHeaderStyles } from './SectionHeader.styles';

// Props for the SectionHeader component.
export interface SectionHeaderProps {
  // Section title.
  title: string;
  // Optional supporting subtitle.
  subtitle?: string;
  // Optional trailing action label (e.g. "See all").
  actionLabel?: string;
  // Called when the action label is pressed.
  onActionPress?: () => void;
}

// Renders a titled section header with an optional action.
function SectionHeaderComponent({
  title,
  subtitle,
  actionLabel,
  onActionPress,
}: SectionHeaderProps) {
  const styles = useThemedStyles(createSectionHeaderStyles);

  return (
    <View style={styles.container}>
      <View style={styles.titles}>
        <Text variant="h4">{title}</Text>
        {subtitle ? (
          <Text variant="caption" color="textSecondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actionLabel && onActionPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onActionPress}
        >
          <Text variant="label" color="primary">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// Memoized themed section header.
export const SectionHeader = memo(SectionHeaderComponent);
