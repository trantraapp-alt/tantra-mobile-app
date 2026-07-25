// Address selection for the listing form. Replaces the raw inline address form
// with: use-my-default, pick a saved address, or enter one manually — plus a
// "Create new address" action that round-trips to the address form and returns
// the created address auto-selected. Falls back to manual entry when the user
// has no saved addresses (a raw address is still a valid listing payload).
import { useFocusEffect, usePathname, useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { memo, useCallback } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/buttons';
import { Checkbox, Select } from '@/components/inputs';
import { Card, Text } from '@/components/ui';
import { routes } from '@/constants';
// Deep imports (not the feature barrel) so this does not pull the address
// screens back into `sell`, which would form an import cycle.
import { useAddresses } from '@/features/addresses/hooks';
import { addressSummary } from '@/features/addresses/utils/addressMapping';
import { pendingAddress } from '@/features/addresses/utils/pendingAddress';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';
import type { PreferredLanguage } from '@/types';

import { type AddressSelection, emptyAddress } from '../../forms/address';
import { AddressField } from '../AddressField';
import { createAddressSelectorStyles } from './AddressSelectorField.styles';

// Props for the AddressSelectorField component.
export interface AddressSelectorFieldProps {
  // Field label.
  label: string;
  // Current address selection.
  value: AddressSelection;
  // Called with the next selection.
  onChange: (value: AddressSelection) => void;
  // Active language for labels.
  language: PreferredLanguage;
  // Error message shown below the field.
  error?: string;
}

// Renders the listing address selector.
function AddressSelectorFieldComponent({
  label,
  value,
  onChange,
  error,
}: AddressSelectorFieldProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createAddressSelectorStyles);
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const { addresses, refresh } = useAddresses();

  const defaultAddress = addresses.find((item) => item.isDefault);

  // On focus, refresh the list and auto-select any address just created via the
  // "Create new address" round trip.
  useFocusEffect(
    useCallback(() => {
      void refresh();
      const created = pendingAddress.take();
      if (created) {
        onChange({ mode: 'saved', addressId: created });
      }
    }, [refresh, onChange]),
  );

  const usingDefault = value.mode === 'default';
  const selectedId = value.mode === 'saved' ? value.addressId : '';
  const manualValue = value.mode === 'manual' ? value.value : emptyAddress();
  const showManual = value.mode === 'manual' || addresses.length === 0;

  const savedOptions = addresses.map((item) => ({
    value: item.addressId,
    label: item.label || addressSummary(item) || t('address.untitled'),
  }));

  const openCreate = useCallback(() => {
    router.push({
      pathname: routes.addAddress,
      params: { returnTo: pathname },
    });
  }, [router, pathname]);

  return (
    <View style={styles.container}>
      <Text variant="label" color="textSecondary">
        {label}
      </Text>

      {defaultAddress ? (
        <Checkbox
          label={t('listing.useDefaultAddress')}
          checked={usingDefault}
          onChange={(checked) =>
            onChange(checked ? { mode: 'default' } : { mode: 'saved', addressId: '' })
          }
        />
      ) : null}

      {usingDefault && defaultAddress ? (
        <Card radius="md">
          <View style={styles.preview}>
            <Text variant="bodyMedium">
              {defaultAddress.label || t('address.default')}
            </Text>
            <Text variant="caption" color="textSecondary">
              {addressSummary(defaultAddress)}
            </Text>
          </View>
        </Card>
      ) : (
        <>
          {savedOptions.length > 0 ? (
            <Select
              label={t('listing.savedAddress')}
              placeholder={t('listing.selectAddress')}
              value={selectedId}
              options={savedOptions}
              onChange={(addressId) => onChange({ mode: 'saved', addressId })}
            />
          ) : null}

          <View style={styles.actions}>
            <Button
              label={t('listing.createNewAddress')}
              variant="outline"
              size="sm"
              fullWidth={false}
              leftIcon={
                <Plus size={theme.sizing.iconSm} color={theme.colors.primary} />
              }
              onPress={openCreate}
            />
          </View>

          {showManual ? (
            <AddressField
              label={t('listing.enterAddress')}
              value={manualValue}
              onChange={(next) => onChange({ mode: 'manual', value: next })}
              error={error}
            />
          ) : null}
        </>
      )}

      {error && !showManual ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

// Memoized listing address selector.
export const AddressSelectorField = memo(AddressSelectorFieldComponent);
