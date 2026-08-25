// Bottom sheet for granting (or changing) a user's subscription: a plan
// picker (lazy-loaded from the plan catalog on first open), a duration
// preset, and optional notes. Submitting always replaces whatever
// subscription the user currently has — the backend's own rule, surfaced in
// the subtitle so it's never a surprise.
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/buttons';
import { TextField } from '@/components/inputs';
import { Spinner } from '@/components/loaders';
import { BottomSheet, type BottomSheetRef, Chip, Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';
import { logger } from '@/lib';

import { adminUsersApi } from '../../api/adminUsersApi';
import type { SubscriptionPlan } from '../../types/adminUser.types';
import { createGrantSubscriptionSheetStyles } from './GrantSubscriptionSheet.styles';

// Duration presets (days) — covers the common grants without needing a
// numeric input for every case.
const DURATION_PRESETS: { days: number; label: string }[] = [
  { days: 30, label: '1 month' },
  { days: 90, label: '3 months' },
  { days: 180, label: '6 months' },
  { days: 365, label: '1 year' },
];

// The plan catalog's display-name field isn't documented, so read it with a
// fallback chain rather than assume one exact key.
function planLabel(plan: SubscriptionPlan): string {
  if (typeof plan.name === 'string' && plan.name.trim()) {
    return plan.name;
  }
  if (typeof plan.planKey === 'string' && plan.planKey.trim()) {
    return plan.planKey;
  }
  return `Plan #${plan.id}`;
}

// Props for the GrantSubscriptionSheet component.
export interface GrantSubscriptionSheetProps {
  // Shows a spinner on the submit button and blocks interaction.
  submitting: boolean;
  // Called with the chosen plan id, duration (days) and notes when confirmed.
  onSubmit: (planId: number, durationDays: number, notes: string) => void;
}

// Renders the grant-subscription bottom sheet.
export const GrantSubscriptionSheet = forwardRef<BottomSheetRef, GrantSubscriptionSheetProps>(
  function GrantSubscriptionSheet({ submitting, onSubmit }, ref) {
    const styles = useThemedStyles(createGrantSubscriptionSheetStyles);
    const sheetRef = useRef<BottomSheetRef>(null);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [plansLoading, setPlansLoading] = useState(false);
    const [plansError, setPlansError] = useState(false);
    const [planId, setPlanId] = useState<number | null>(null);
    const [durationDays, setDurationDays] = useState<number | null>(null);
    const [notes, setNotes] = useState('');
    // Fetches once — reused across opens rather than refetching every time.
    const loadedRef = useRef(false);

    const loadPlans = useCallback(async () => {
      setPlansLoading(true);
      setPlansError(false);
      try {
        const res = await adminUsersApi.getPlans();
        setPlans(res);
      } catch (error) {
        logger.warn('[AdminUsers] Failed to load subscription plans', error);
        setPlansError(true);
      } finally {
        setPlansLoading(false);
      }
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        present: () => {
          setPlanId(null);
          setDurationDays(null);
          setNotes('');
          if (!loadedRef.current) {
            loadedRef.current = true;
            void loadPlans();
          }
          sheetRef.current?.present();
        },
        dismiss: () => sheetRef.current?.dismiss(),
      }),
      [loadPlans],
    );

    const canSubmit = planId != null && durationDays != null;

    return (
      <BottomSheet
        ref={sheetRef}
        title="Grant subscription"
        subtitle="Replaces any subscription the user currently has."
        footer={
          <Button
            label="Grant subscription"
            loading={submitting}
            disabled={!canSubmit}
            onPress={() => {
              if (planId != null && durationDays != null) {
                onSubmit(planId, durationDays, notes);
              }
            }}
          />
        }
      >
        <View style={styles.content}>
          <Text variant="label" color="textSecondary" style={styles.sectionLabel}>
            Plan
          </Text>
          {plansLoading ? (
            <View style={styles.plansLoading}>
              <Spinner />
            </View>
          ) : plansError ? (
            <View style={styles.plansError}>
              <Text variant="caption" color="danger">
                Couldn&apos;t load plans.
              </Text>
              <Button
                label="Retry"
                variant="outline"
                size="sm"
                fullWidth={false}
                onPress={() => void loadPlans()}
              />
            </View>
          ) : plans.length === 0 ? (
            <Text variant="caption" color="textSecondary">
              No plans available.
            </Text>
          ) : (
            <View style={styles.chipsRow}>
              {plans.map((plan) => (
                <Chip
                  key={plan.id}
                  label={planLabel(plan)}
                  selected={plan.id === planId}
                  onPress={() => setPlanId(plan.id)}
                />
              ))}
            </View>
          )}

          <Text variant="label" color="textSecondary" style={styles.sectionLabel}>
            Duration
          </Text>
          <View style={styles.chipsRow}>
            {DURATION_PRESETS.map((preset) => (
              <Chip
                key={preset.days}
                label={preset.label}
                selected={preset.days === durationDays}
                onPress={() => setDurationDays(preset.days)}
              />
            ))}
          </View>

          <TextField
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
            size="sm"
          />
        </View>
      </BottomSheet>
    );
  },
);
