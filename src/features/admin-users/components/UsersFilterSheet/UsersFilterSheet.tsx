// Filter bottom sheet for the admin Users list: account status + subscription,
// with Reset / Apply. Edits happen on a local draft re-seeded from the applied
// value each time the sheet opens, so closing without applying discards them.
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { View } from 'react-native';

import { Button } from '@/components/buttons';
import { BottomSheet, type BottomSheetRef, Chip, Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';

import {
  STATUS_FILTERS,
  type StatusFilter,
  SUB_FILTERS,
  type SubFilter,
} from '../../utils/userFilters';
import { createUsersFilterSheetStyles } from './UsersFilterSheet.styles';

// The filter selection this sheet edits.
export interface UsersFilterValue {
  status: StatusFilter;
  sub: SubFilter;
}

// Props for the UsersFilterSheet component.
export interface UsersFilterSheetProps {
  // Currently applied filters (the draft is re-seeded from these on open).
  value: UsersFilterValue;
  // Called with the new filter set when Apply is pressed.
  onApply: (value: UsersFilterValue) => void;
}

// Renders the users-list filter sheet.
export const UsersFilterSheet = forwardRef<BottomSheetRef, UsersFilterSheetProps>(
  function UsersFilterSheet({ value, onApply }, ref) {
    const styles = useThemedStyles(createUsersFilterSheetStyles);
    const sheetRef = useRef<BottomSheetRef>(null);
    const [draft, setDraft] = useState<UsersFilterValue>(value);

    // Re-seed the draft from the applied value every time the sheet opens.
    useImperativeHandle(
      ref,
      () => ({
        present: () => {
          setDraft(value);
          sheetRef.current?.present();
        },
        dismiss: () => sheetRef.current?.dismiss(),
      }),
      [value],
    );

    const handleReset = () => setDraft({ status: 'ALL', sub: 'ALL' });

    const handleApply = () => {
      onApply(draft);
      sheetRef.current?.dismiss();
    };

    return (
      <BottomSheet
        ref={sheetRef}
        title="Filters"
        contentStyle={styles.content}
        footer={
          <View style={styles.actions}>
            <View style={styles.actionButton}>
              <Button label="Reset" variant="outline" onPress={handleReset} />
            </View>
            <View style={styles.actionButton}>
              <Button label="Apply" onPress={handleApply} />
            </View>
          </View>
        }
      >
        <View>
          <Text variant="label" color="textSecondary" style={styles.sectionLabel}>
            Account status
          </Text>
          <View style={styles.chipsRow}>
            {STATUS_FILTERS.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                selected={option.value === draft.status}
                onPress={() => setDraft((d) => ({ ...d, status: option.value }))}
              />
            ))}
          </View>
        </View>

        <View>
          <Text variant="label" color="textSecondary" style={styles.sectionLabel}>
            Subscription
          </Text>
          <View style={styles.chipsRow}>
            {SUB_FILTERS.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                selected={option.value === draft.sub}
                onPress={() => setDraft((d) => ({ ...d, sub: option.value }))}
              />
            ))}
          </View>
        </View>
      </BottomSheet>
    );
  },
);
