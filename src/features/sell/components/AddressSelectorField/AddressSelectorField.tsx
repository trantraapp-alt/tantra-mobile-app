// Address selection for the listing form: pick a saved address (its full
// details are previewed) or create a new one. Creating opens the address form
// and returns with the new address auto-selected. There is no inline manual
// entry and no default toggle — all address entry happens on the address form.
import { useFocusEffect, usePathname, useRouter } from 'expo-router';
import { Phone, Plus } from 'lucide-react-native';
import { memo, useCallback } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/buttons';
import { Select } from '@/components/inputs';
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

import type { AddressSelection } from '../../forms/address';
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

// The address fields shared by a saved address and a listing's snapshot.
interface AddressParts {
  fullAddress?: string | null;
  village?: string | null;
  district?: string | null;
  city?: string | null;
  state?: string | null;
  pinCode?: string | null;
  country?: string | null;
  mobileNumber?: string | null;
}

// Trims a value to a clean string.
function clean(value?: string | null): string {
  return (value ?? '').toString().trim();
}

// Builds the display lines for a complete address preview.
function addressPreviewLines(parts: AddressParts): string[] {
  const join = (values: (string | null | undefined)[], sep = ', ') =>
    values
      .map(clean)
      .filter((entry) => entry.length > 0)
      .join(sep);
  return [
    join([parts.fullAddress, parts.village]),
    join([parts.district, parts.city]),
    join([parts.state, parts.pinCode], ' - '),
    clean(parts.country),
  ].filter((line) => line.length > 0);
}

// Renders the listing address selector.
function AddressSelectorFieldComponent({
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

  const selectedId = value.mode === 'saved' ? value.addressId : '';
  const selectedAddress = addresses.find(
    (item) => item.addressId === selectedId,
  );

  // Preview the selected saved address, or the snapshotted address on an edit.
  const previewParts: AddressParts | null =
    selectedAddress ??
    (value.mode === 'manual' && addressPreviewLines(value.value).length > 0
      ? value.value
      : null);

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
      {savedOptions.length > 0 ? (
        <Select
          label={t('listing.savedAddress')}
          placeholder={t('listing.selectAddress')}
          value={selectedId}
          options={savedOptions}
          onChange={(addressId) => onChange({ mode: 'saved', addressId })}
        />
      ) : null}

      {previewParts ? (
        <Card radius="md">
          <View style={styles.preview}>
            {selectedAddress?.label ? (
              <Text variant="bodyMedium">{selectedAddress.label}</Text>
            ) : null}
            {addressPreviewLines(previewParts).map((line, index) => (
              <Text
                key={`line-${index}`}
                variant="caption"
                color="textSecondary"
              >
                {line}
              </Text>
            ))}
            {clean(previewParts.mobileNumber) ? (
              <View style={styles.mobileRow}>
                <Phone
                  size={theme.sizing.iconXs}
                  color={theme.colors.textTertiary}
                />
                <Text variant="caption" color="textSecondary">
                  {clean(previewParts.mobileNumber)}
                </Text>
              </View>
            ) : null}
          </View>
        </Card>
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

      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

// Memoized listing address selector.
export const AddressSelectorField = memo(AddressSelectorFieldComponent);
