// App header with optional back navigation, title and trailing actions.
import { ChevronLeft } from 'lucide-react-native';
import { memo } from 'react';
import { View } from 'react-native';

import { IconButton } from '@/components/buttons';
import { Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';

import { createHeaderStyles } from './Header.styles';

// Props for the Header component.
export interface HeaderProps {
  // Header title.
  title?: string;
  // Whether to show the back button.
  showBack?: boolean;
  // Called when the back button is pressed.
  onBack?: () => void;
  // Optional element rendered on the trailing side.
  rightAction?: React.ReactNode;
}

// Renders a themed screen header.
function HeaderComponent({
  title,
  showBack = false,
  onBack,
  rightAction,
}: HeaderProps) {
  const styles = useThemedStyles(createHeaderStyles);

  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {showBack && onBack ? (
          <IconButton
            icon={ChevronLeft}
            accessibilityLabel="Go back"
            onPress={onBack}
          />
        ) : null}
      </View>

      {title ? (
        <Text variant="h4" numberOfLines={1} style={styles.title}>
          {title}
        </Text>
      ) : (
        <View style={styles.title} />
      )}

      <View style={styles.sideEnd}>{rightAction}</View>
    </View>
  );
}

// Memoized themed header.
export const Header = memo(HeaderComponent);
