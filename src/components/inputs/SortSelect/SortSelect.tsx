// A compact, reusable sort dropdown: a small "Sort" field (label + current value
// + down chevron) that opens a bottom option sheet. Fully dynamic — the options
// are passed in — so it drops into any list screen's results header.
import { Check, ChevronDown, X } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui';
import { useBottomInset, useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';

import { createSortSelectStyles } from './SortSelect.styles';

// A selectable sort option.
export interface SortOption {
  // Stored value.
  value: string;
  // Display label.
  label: string;
}

// Props for the SortSelect component.
export interface SortSelectProps {
  // Currently selected value.
  value?: string;
  // Available options.
  options: SortOption[];
  // Called with the chosen value.
  onChange: (value: string) => void;
  // Field label (defaults to "Sort").
  label?: string;
}

// Renders a compact sort dropdown.
export function SortSelect({
  value,
  options,
  onChange,
  label = 'Sort',
}: SortSelectProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createSortSelectStyles);
  const bottomInset = useBottomInset();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => setOpen(true)}
      >
        {({ pressed }) => (
          <View style={[styles.field, pressed ? styles.pressed : null]}>
            <Text variant="caption" color="textTertiary">
              {label}
            </Text>
            {selected ? (
              <Text variant="label" numberOfLines={1}>
                {selected.label}
              </Text>
            ) : null}
            <ChevronDown
              size={theme.sizing.iconSm}
              color={theme.colors.textSecondary}
            />
          </View>
        )}
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[
              styles.sheet,
              { paddingBottom: bottomInset + theme.spacing.lg },
            ]}
          >
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text variant="h4">{label}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={theme.sizing.hitSlop}
                onPress={() => setOpen(false)}
              >
                <X size={theme.sizing.iconMd} color={theme.colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.options}
            >
              {options.map((option) => {
                const active = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    style={[styles.option, active ? styles.optionActive : null]}
                  >
                    <Text
                      variant="bodyMedium"
                      color={active ? 'primary' : 'textPrimary'}
                      numberOfLines={1}
                      style={styles.optionLabel}
                    >
                      {option.label}
                    </Text>
                    {active ? (
                      <Check
                        size={theme.sizing.iconMd}
                        color={theme.colors.primary}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
