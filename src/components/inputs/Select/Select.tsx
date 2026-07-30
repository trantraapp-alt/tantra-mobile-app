// Dropdown select: shows the chosen value in a field and opens a bottom modal
// sheet with a scrollable option list. Works for long lists (e.g. months) and
// needs no native picker dependency.
import { Check, ChevronDown, X } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui';
import { useBottomInset, useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';

import { FieldLabel } from '../FieldLabel';
import { createSelectStyles } from './Select.styles';

// An option in a select.
export interface SelectItem {
  // Stored value.
  value: string;
  // Display label.
  label: string;
}

// Props for the Select component.
export interface SelectProps {
  // Optional label above the field.
  label?: string;
  // Marks the label with a red asterisk.
  required?: boolean;
  // Optional description shown under the title inside the dropdown sheet.
  description?: string;
  // Placeholder shown when nothing is selected.
  placeholder?: string;
  // Currently selected value.
  value?: string;
  // Available options.
  options: SelectItem[];
  // Called with the selected value.
  onChange: (value: string) => void;
  // Called when the sheet closes (drives blur validation).
  onBlur?: () => void;
  // Error message shown below the field.
  error?: string;
  // When true, the field is greyed out and cannot be opened (e.g. a cascading
  // child whose parent has no value yet).
  disabled?: boolean;
}

// Renders a themed dropdown select.
export function Select({
  label,
  required,
  description,
  placeholder = 'Select',
  value,
  options,
  onChange,
  onBlur,
  error,
  disabled = false,
}: SelectProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createSelectStyles);
  const bottomInset = useBottomInset();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  // Closes the sheet and reports blur.
  const close = useCallback(() => {
    setOpen(false);
    onBlur?.();
  }, [onBlur]);

  // Selects an option and closes the sheet.
  const select = useCallback(
    (next: string) => {
      onChange(next);
      close();
    },
    [onChange, close],
  );

  return (
    <View style={styles.container}>
      {label ? (
        <FieldLabel label={label} required={required} style={styles.label} />
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[
          styles.field,
          !!error && styles.errored,
          disabled && { opacity: theme.opacity.disabled },
        ]}
      >
        <Text
          variant="body"
          color={selected ? 'textPrimary' : 'textTertiary'}
          numberOfLines={1}
          style={styles.valueText}
        >
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDown
          size={theme.sizing.iconMd}
          color={theme.colors.textTertiary}
        />
      </Pressable>

      {error ? (
        <Text variant="caption" color="danger" style={styles.error}>
          {error}
        </Text>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={close}
        statusBarTranslucent
      >
        <Pressable style={styles.backdrop} onPress={close}>
          <Pressable
            style={[
              styles.sheet,
              { paddingBottom: bottomInset + theme.spacing.lg },
            ]}
          >
            <View style={styles.handle} />

            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text variant="h4" numberOfLines={1}>
                  {label ?? 'Select an option'}
                </Text>
                {description ? (
                  <Text variant="caption" color="textSecondary" numberOfLines={2}>
                    {description}
                  </Text>
                ) : null}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={theme.sizing.hitSlop}
                onPress={close}
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
                    onPress={() => select(option.value)}
                    style={[styles.option, active && styles.optionActive]}
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
    </View>
  );
}
