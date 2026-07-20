// Custom bottom-sheet action picker: a themed alternative to the native action
// dialog. Renders a list of icon actions plus a Cancel button, on top of the
// shared BottomSheet.
import type { LucideIcon } from 'lucide-react-native';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { Pressable, View } from 'react-native';

import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';

import { BottomSheet, type BottomSheetRef } from '../BottomSheet';
import { Text } from '../Text';
import { createActionSheetStyles } from './ActionSheet.styles';

// A single action shown in the sheet.
export interface ActionSheetAction {
  // Stable key.
  key: string;
  // Row label.
  label: string;
  // Optional leading icon.
  icon?: LucideIcon;
  // Called when the action is chosen (after the sheet closes).
  onPress: () => void;
  // Renders the action in a destructive (danger) tone.
  destructive?: boolean;
}

// Props for the ActionSheet component.
export interface ActionSheetProps {
  // Optional heading.
  title?: string;
  // Optional supporting line under the heading.
  subtitle?: string;
  // Actions to present.
  actions: ActionSheetAction[];
  // Cancel button label.
  cancelLabel?: string;
}

// Imperative handle to open and close the action sheet.
export type ActionSheetRef = BottomSheetRef;

// Renders a themed bottom-sheet action picker.
export const ActionSheet = forwardRef<ActionSheetRef, ActionSheetProps>(
  function ActionSheet({ title, subtitle, actions, cancelLabel = 'Cancel' }, ref) {
    const theme = useTheme();
    const styles = useThemedStyles(createActionSheetStyles);
    const sheetRef = useRef<BottomSheetRef>(null);

    useImperativeHandle(
      ref,
      () => ({
        present: () => sheetRef.current?.present(),
        dismiss: () => sheetRef.current?.dismiss(),
      }),
      [],
    );

    // Closes the sheet, then runs the chosen action.
    const handleAction = useCallback((action: ActionSheetAction) => {
      sheetRef.current?.dismiss();
      action.onPress();
    }, []);

    return (
      <BottomSheet ref={sheetRef} title={title} subtitle={subtitle}>
        <View style={styles.actions}>
          {actions.map((action) => {
            const Icon = action.icon;
            const accent = action.destructive
              ? theme.colors.danger
              : theme.colors.primary;
            return (
              <Pressable
                key={action.key}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                onPress={() => handleAction(action)}
                style={styles.action}
              >
                {Icon ? (
                  <View
                    style={[
                      styles.iconWrap,
                      { backgroundColor: theme.colors.primaryLight },
                    ]}
                  >
                    <Icon size={theme.sizing.iconMd} color={accent} />
                  </View>
                ) : null}
                <Text
                  variant="bodyMedium"
                  color={action.destructive ? 'danger' : 'textPrimary'}
                >
                  {action.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}
          onPress={() => sheetRef.current?.dismiss()}
          style={styles.cancel}
        >
          <Text variant="button" color="textSecondary">
            {cancelLabel}
          </Text>
        </Pressable>
      </BottomSheet>
    );
  },
);
