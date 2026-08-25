// Bottom sheet collecting a mandatory reason (+ optional notes) before
// blocking a user account. The reason picker doubles as the confirmation
// gate — there's no separate "are you sure" step, since choosing a reason and
// pressing the danger-colored submit button already requires deliberate intent.
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/buttons';
import { TextField } from '@/components/inputs';
import { BottomSheet, type BottomSheetRef, Chip, Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';

import type { BlockReasonCode } from '../../types/adminUser.types';
import { createBlockUserSheetStyles } from './BlockUserSheet.styles';

// Reason options, in the exact casing the API expects.
const REASONS: { value: BlockReasonCode; label: string }[] = [
  { value: 'SPAM_LISTINGS', label: 'Spam listings' },
  { value: 'FAKE_PROFILE', label: 'Fake profile' },
  { value: 'ABUSIVE_BEHAVIOR', label: 'Abusive behavior' },
  { value: 'OTHER', label: 'Other' },
];

// Props for the BlockUserSheet component.
export interface BlockUserSheetProps {
  // The account's display name, shown in the warning line.
  userName: string;
  // Shows a spinner on the submit button and blocks interaction.
  submitting: boolean;
  // Called with the chosen reason and any notes when confirmed.
  onSubmit: (reason: BlockReasonCode, notes: string) => void;
}

// Renders the block-user bottom sheet.
export const BlockUserSheet = forwardRef<BottomSheetRef, BlockUserSheetProps>(
  function BlockUserSheet({ userName, submitting, onSubmit }, ref) {
    const styles = useThemedStyles(createBlockUserSheetStyles);
    const sheetRef = useRef<BottomSheetRef>(null);
    const [reason, setReason] = useState<BlockReasonCode | null>(null);
    const [notes, setNotes] = useState('');

    // Resets the draft every time the sheet opens.
    useImperativeHandle(
      ref,
      () => ({
        present: () => {
          setReason(null);
          setNotes('');
          sheetRef.current?.present();
        },
        dismiss: () => sheetRef.current?.dismiss(),
      }),
      [],
    );

    return (
      <BottomSheet
        ref={sheetRef}
        title="Block user"
        subtitle={`${userName} won't be able to sign in, and their active listings are hidden immediately.`}
        footer={
          <Button
            label="Block user"
            variant="danger"
            loading={submitting}
            disabled={!reason}
            onPress={() => {
              if (reason) {
                onSubmit(reason, notes);
              }
            }}
          />
        }
      >
        <View style={styles.content}>
          <Text variant="label" color="textSecondary" style={styles.sectionLabel}>
            Reason
          </Text>
          <View style={styles.chipsRow}>
            {REASONS.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                selected={option.value === reason}
                onPress={() => setReason(option.value)}
              />
            ))}
          </View>

          <TextField
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            size="sm"
          />
        </View>
      </BottomSheet>
    );
  },
);
