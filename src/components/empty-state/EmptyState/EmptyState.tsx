// Generic empty-state view with an icon, message and optional action.
import type { LucideIcon } from 'lucide-react-native';
import { memo } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/buttons';
import { Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';

import { createEmptyStateStyles } from './EmptyState.styles';

// Props for the EmptyState component.
export interface EmptyStateProps {
  // Icon illustrating the empty context.
  icon: LucideIcon;
  // Primary title text.
  title: string;
  // Supporting description text.
  description?: string;
  // Optional action button label.
  actionLabel?: string;
  // Optional action button handler.
  onAction?: () => void;
}

// Renders a centered empty-state message with an optional call to action.
function EmptyStateComponent({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createEmptyStateStyles);

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Icon size={theme.sizing.iconXxl} color={theme.colors.textTertiary} />
      </View>
      <Text variant="h4" align="center" style={styles.title}>
        {title}
      </Text>
      {description ? (
        <Text variant="body" color="textSecondary" align="center">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button label={actionLabel} onPress={onAction} fullWidth={false} />
        </View>
      ) : null}
    </View>
  );
}

// Memoized empty-state view.
export const EmptyState = memo(EmptyStateComponent);
