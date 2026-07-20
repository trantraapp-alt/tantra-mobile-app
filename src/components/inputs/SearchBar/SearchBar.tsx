// Search input with leading search icon and a clear-text affordance.
import { Search, X } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, TextInput } from 'react-native';

import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';

import { createSearchBarStyles } from './SearchBar.styles';

// Props for the SearchBar component.
export interface SearchBarProps {
  // Current search text value.
  value: string;
  // Called when the text value changes.
  onChangeText: (value: string) => void;
  // Placeholder text.
  placeholder?: string;
  // Called when the clear button is pressed.
  onClear?: () => void;
  // Called when the user submits the query.
  onSubmit?: () => void;
  // Whether the field should focus automatically on mount.
  autoFocus?: boolean;
  // Whether the input is editable; disable to use as a navigational trigger.
  editable?: boolean;
  // Called when the bar is pressed while non-editable.
  onPress?: () => void;
}

// Renders a themed search bar with clear and submit affordances.
function SearchBarComponent({
  value,
  onChangeText,
  placeholder = 'Search products',
  onClear,
  onSubmit,
  autoFocus = false,
  editable = true,
  onPress,
}: SearchBarProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createSearchBarStyles);

  return (
    <Pressable
      disabled={editable}
      onPress={onPress}
      style={styles.container}
      accessibilityRole={editable ? undefined : 'search'}
    >
      <Search size={theme.sizing.iconMd} color={theme.colors.textTertiary} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textTertiary}
        editable={editable}
        pointerEvents={editable ? 'auto' : 'none'}
        autoFocus={autoFocus}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        accessibilityLabel="Search"
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={theme.sizing.hitSlop}
          onPress={onClear}
        >
          <X size={theme.sizing.iconMd} color={theme.colors.textTertiary} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

// Memoized themed search bar.
export const SearchBar = memo(SearchBarComponent);
