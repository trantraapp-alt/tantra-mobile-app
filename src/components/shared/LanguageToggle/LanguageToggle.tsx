// Compact pill that switches the app language between English and Hindi.
import { Globe } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable } from 'react-native';

import { Text } from '@/components/ui';
import { useLanguage, useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';

import { createLanguageToggleStyles } from './LanguageToggle.styles';

// Short display label for each supported language.
const LANGUAGE_LABEL = { EN: 'EN', HI: 'हिं' } as const;

// Renders the header language switcher.
function LanguageToggleComponent() {
  const theme = useTheme();
  const styles = useThemedStyles(createLanguageToggleStyles);
  const { language, toggle } = useLanguage();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Switch language, currently ${language}`}
      onPress={toggle}
      style={styles.container}
    >
      <Globe size={theme.sizing.iconSm} color={theme.colors.primary} />
      <Text variant="label" color="primary">
        {LANGUAGE_LABEL[language]}
      </Text>
    </Pressable>
  );
}

// Memoized language toggle.
export const LanguageToggle = memo(LanguageToggleComponent);
