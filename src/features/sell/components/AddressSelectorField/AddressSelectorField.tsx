// Address selection for the listing form. Two controls, same on every form:
// a "use my default address" checkbox and a "create new address" button.
// Ticking the checkbox uses the saved default address and previews it in full;
// creating a new one returns with that address selected and previewed. All
// address entry happens on the dedicated address form — there are no inline
// fields here.
import { useFocusEffect, usePathname, useRouter } from 'expo-router';
import { Phone, Plus } from 'lucide-react-native';
import { memo, useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/buttons';
import { Checkbox } from '@/components/inputs';
import { Card, Text } from '@/components/ui';
import { routes } from '@/constants';
// Deep imports (not the feature barrel) so this does not pull the address
// screens back into `sell`, which would form an import cycle.
import { useAddresses } from '@/features/addresses/hooks';
import { pendingAddress } from '@/features/addresses/utils/pendingAddress';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';
import type { PreferredLanguage } from '@/types';

import { type AddressSelection, emptyManualSelection } from '../../forms/address';
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
  // Called with the chosen address's mobile number when the user ticks "use
  // default address" or returns from creating one, so the form can prefill the
  // seller contact field below.
  onResolveContact?: (mobileNumber: string) => void;
}

// The address fields shared by a saved address and a listing's snapshot.
interface AddressParts {
  label?: string | null;
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
  onResolveContact,
}: AddressSelectorFieldProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createAddressSelectorStyles);
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const { addresses, refresh } = useAddresses();

  // Set when an address was just created via the "Create new address" round
  // trip, so the seller contact field is filled once that address resolves.
  const pendingContactFill = useRef(false);

  // On focus, refresh the list and auto-select any address just created via the
  // "Create new address" round trip.
  useFocusEffect(
    useCallback(() => {
      void refresh();
      const created = pendingAddress.take();
      if (created) {
        onChange({ mode: 'saved', addressId: created });
        pendingContactFill.current = true;
      }
    }, [refresh, onChange]),
  );

  // The user's default saved address (backend returns default first; fall back
  // to the flagged one, then the first).
  const defaultAddress =
    addresses.find((item) => item.isDefault) ?? addresses[0] ?? null;

  const useDefault = value.mode === 'default';
  const savedId = value.mode === 'saved' ? value.addressId : '';
  const savedAddress =
    addresses.find((item) => item.addressId === savedId) ?? null;

  // The address parts to preview: the default (checkbox on), a freshly created
  // saved address, or the snapshot carried by an edit.
  const previewParts: AddressParts | null = useDefault
    ? defaultAddress
    : (savedAddress ??
      (value.mode === 'manual' && addressPreviewLines(value.value).length > 0
        ? value.value
        : null));

  // Toggling the checkbox switches between the default address and a blank
  // selection; when turning it on, carry the default address's coordinates.
  const toggleDefault = useCallback(
    (checked: boolean) => {
      if (!checked) {
        onChange(emptyManualSelection());
        return;
      }
      onChange({
        mode: 'default',
        latitude: defaultAddress?.latitude ?? null,
        longitude: defaultAddress?.longitude ?? null,
      });
      // Carry the default address's contact number down to the seller contact
      // field so the lister does not retype it.
      const mobile = clean(defaultAddress?.mobileNumber);
      if (mobile) {
        onResolveContact?.(mobile);
      }
    },
    [onChange, defaultAddress, onResolveContact],
  );

  // Backfill the chosen address's coordinates onto the selection once the
  // address list has loaded (e.g. a just-created address arrives after the
  // round trip), so the listing is posted with its exact latitude/longitude.
  useEffect(() => {
    if (
      value.mode === 'saved' &&
      value.latitude == null &&
      value.longitude == null &&
      savedAddress &&
      (savedAddress.latitude != null || savedAddress.longitude != null)
    ) {
      onChange({
        mode: 'saved',
        addressId: value.addressId,
        latitude: savedAddress.latitude,
        longitude: savedAddress.longitude,
      });
    } else if (
      value.mode === 'default' &&
      value.latitude == null &&
      value.longitude == null &&
      defaultAddress &&
      (defaultAddress.latitude != null || defaultAddress.longitude != null)
    ) {
      onChange({
        mode: 'default',
        latitude: defaultAddress.latitude,
        longitude: defaultAddress.longitude,
      });
    }
  }, [value, savedAddress, defaultAddress, onChange]);

  // Once the just-created saved address has loaded, prefill the seller contact
  // field from its mobile number (the create-new-address round trip).
  useEffect(() => {
    if (pendingContactFill.current && savedAddress) {
      pendingContactFill.current = false;
      const mobile = clean(savedAddress.mobileNumber);
      if (mobile) {
        onResolveContact?.(mobile);
      }
    }
  }, [savedAddress, onResolveContact]);

  const openCreate = useCallback(() => {
    router.push({
      pathname: routes.addAddress,
      params: { returnTo: pathname },
    });
  }, [router, pathname]);

  return (
    <View style={styles.container}>
      <Checkbox
        label={t('listing.useDefaultAddress')}
        checked={useDefault}
        onChange={toggleDefault}
      />

      {useDefault && !defaultAddress ? (
        <Text variant="caption" color="textTertiary" style={styles.hint}>
          {t('listing.noDefaultAddress')}
        </Text>
      ) : null}

      {previewParts ? (
        <Card radius="md">
          <View style={styles.preview}>
            {clean(previewParts.label) ? (
              <Text variant="bodyMedium">{clean(previewParts.label)}</Text>
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
