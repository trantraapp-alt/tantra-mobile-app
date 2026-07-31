// A modern, centered confirmation dialog — a tinted icon, title, message and a
// Cancel / Confirm pair. Replaces the native Alert for destructive actions
// (delete, remove) so confirmations look and feel consistent across the app.
import { AlertTriangle, type LucideIcon } from 'lucide-react-native';
import { memo } from 'react';
import { Modal, Pressable, View } from 'react-native';

import { Button } from '@/components/buttons';
import { Text } from '@/components/ui/Text';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';

import { createConfirmDialogStyles } from './ConfirmDialog.styles';

// Tone controls the accent (icon + confirm button): danger for destructive
// actions, primary for neutral confirmations.
export type ConfirmDialogTone = 'danger' | 'primary';

// Props for the ConfirmDialog component.
export interface ConfirmDialogProps {
  // Whether the dialog is shown.
  visible: boolean;
  // Heading.
  title: string;
  // Supporting message below the title.
  message?: string;
  // Label for the confirm (accent) button.
  confirmLabel: string;
  // Label for the cancel button (defaults to the shared "Cancel").
  cancelLabel?: string;
  // Accent tone for the icon and confirm button.
  tone?: ConfirmDialogTone;
  // Icon shown in the tinted circle (defaults to a warning triangle).
  icon?: LucideIcon;
  // Shows a spinner on the confirm button and blocks interaction.
  loading?: boolean;
  // Called when the confirm button is pressed.
  onConfirm: () => void;
  // Called when cancelled (button, backdrop tap or hardware back).
  onCancel: () => void;
}

// Renders a themed confirmation dialog.
function ConfirmDialogComponent({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  tone = 'danger',
  icon,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createConfirmDialogStyles);
  const { t } = useTranslation();

  const Icon = icon ?? AlertTriangle;
  const accent = tone === 'danger' ? theme.colors.danger : theme.colors.primary;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      {/* Backdrop tap cancels; the inner press is swallowed so taps on the card
          don't dismiss it. */}
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.dialog} onPress={() => {}}>
          <View
            style={[
              styles.iconCircle,
              tone === 'danger'
                ? styles.iconCircleDanger
                : styles.iconCirclePrimary,
            ]}
          >
            <Icon size={theme.sizing.iconLg} color={accent} />
          </View>

          <Text variant="h4" align="center">
            {title}
          </Text>
          {message ? (
            <Text variant="body" color="textSecondary" align="center">
              {message}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <View style={styles.actionButton}>
              <Button
                label={cancelLabel ?? t('common.cancel')}
                variant="outline"
                onPress={onCancel}
                disabled={loading}
              />
            </View>
            <View style={styles.actionButton}>
              <Button
                label={confirmLabel}
                variant={tone === 'danger' ? 'danger' : 'primary'}
                loading={loading}
                onPress={onConfirm}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Memoized confirmation dialog.
export const ConfirmDialog = memo(ConfirmDialogComponent);
