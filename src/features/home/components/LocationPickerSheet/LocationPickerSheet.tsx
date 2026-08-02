// Flipkart-style location picker opened from the header's location field: a
// search box (filters saved addresses; a 6-digit query offers a live PIN
// lookup), a "use my current location" row, an "add a new address" row and the
// user's saved-address list. Selecting any of them writes the chosen place to
// the persisted location so the home feed re-filters to that area.
import { useRouter } from 'expo-router';
import { ChevronRight, LocateFixed, MapPin, Plus } from 'lucide-react-native';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ActivityIndicator, Linking, Pressable, View } from 'react-native';

import { Button } from '@/components/buttons';
import { SearchBar } from '@/components/inputs';
import {
  Badge,
  BottomSheet,
  type BottomSheetRef,
  Divider,
  Text,
} from '@/components/ui';
import { routes } from '@/constants';
import { addressSummary, type SavedAddress, useAddresses } from '@/features/addresses';
import { lookupPincode, useDeviceLocation } from '@/features/location';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme, useToast } from '@/providers';
import { useAppDispatch } from '@/store/hooks';
import { setLocation, type StoredLocation } from '@/store/slices';

import { createLocationPickerSheetStyles } from './LocationPickerSheet.styles';

// How many saved addresses to show inline before linking to the full list.
const MAX_INLINE = 5;

// Props for the LocationPickerSheet component.
export type LocationPickerSheetProps = object;

// A saved address's short display title.
function addressTitle(address: SavedAddress, fallback: string): string {
  return (
    address.label?.trim() ||
    address.city?.trim() ||
    address.district?.trim() ||
    address.state?.trim() ||
    fallback
  );
}

// Renders the address-selector location bottom sheet.
export const LocationPickerSheet = forwardRef<
  BottomSheetRef,
  LocationPickerSheetProps
>(function LocationPickerSheet(_props, ref) {
  const theme = useTheme();
  const styles = useThemedStyles(createLocationPickerSheetStyles);
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showSuccess, showError } = useToast();
  const sheetRef = useRef<BottomSheetRef>(null);

  const { addresses, isLoading, isError, refresh } = useAddresses();
  const { request: requestGps, loading: locating } = useDeviceLocation();

  const [query, setQuery] = useState('');
  const [pinLoading, setPinLoading] = useState(false);

  // Reset the query and refresh the list every time the sheet opens.
  useImperativeHandle(
    ref,
    () => ({
      present: () => {
        setQuery('');
        void refresh();
        sheetRef.current?.present();
      },
      dismiss: () => sheetRef.current?.dismiss(),
    }),
    [refresh],
  );

  const trimmed = query.trim();
  const isPin = /^\d{6}$/.test(trimmed);
  const filtered = useMemo(() => {
    const q = trimmed.toLowerCase();
    if (q === '') {
      return addresses;
    }
    return addresses.filter((a) =>
      [a.label, a.fullAddress, a.city, a.village, a.district, a.state, a.pinCode]
        .map((f) => (f ?? '').toLowerCase())
        .some((f) => f.includes(q)),
    );
  }, [addresses, trimmed]);

  // Persists a location and closes the sheet.
  const applyLocation = useCallback(
    (location: StoredLocation) => {
      dispatch(setLocation(location));
      showSuccess(t('location.updated'));
      sheetRef.current?.dismiss();
    },
    [dispatch, showSuccess, t],
  );

  const selectAddress = useCallback(
    (address: SavedAddress) => {
      applyLocation({
        label: addressTitle(address, t('address.untitled')),
        city: address.city ?? '',
        district: address.district ?? '',
        state: address.state ?? '',
        pinCode: address.pinCode ?? '',
        latitude: address.latitude ?? null,
        longitude: address.longitude ?? null,
      });
    },
    [applyLocation, t],
  );

  const useCurrentLocation = useCallback(async () => {
    const outcome = await requestGps();
    if (outcome.status === 'granted' && outcome.place) {
      const place = outcome.place;
      applyLocation({
        label:
          place.city || place.district || place.state || t('location.currentLabel'),
        city: place.city,
        district: place.district,
        state: place.state,
        pinCode: place.pinCode,
        latitude: place.latitude,
        longitude: place.longitude,
      });
      return;
    }
    if (outcome.status === 'denied') {
      showError(t('address.locationDenied'));
      void Linking.openSettings();
      return;
    }
    showError(t('address.locationUnavailable'));
  }, [requestGps, applyLocation, showError, t]);

  const usePinCode = useCallback(async () => {
    setPinLoading(true);
    try {
      const result = await lookupPincode(trimmed);
      if (!result) {
        showError(t('address.pinNotFound'));
        return;
      }
      applyLocation({
        label: result.district || result.city,
        city: result.city,
        district: result.district,
        state: result.state,
        pinCode: result.pinCode,
        latitude: null,
        longitude: null,
      });
    } finally {
      setPinLoading(false);
    }
  }, [trimmed, applyLocation, showError, t]);

  const addNewAddress = useCallback(() => {
    sheetRef.current?.dismiss();
    router.push(routes.addAddress);
  }, [router]);

  const viewAllAddresses = useCallback(() => {
    sheetRef.current?.dismiss();
    router.push(routes.addresses);
  }, [router]);

  // A tinted accent row (icon + title + optional hint + chevron) for the
  // "use current location" / "use PIN" actions.
  const renderAccentRow = (
    icon: React.ReactNode,
    title: string,
    onPress: () => void,
    options?: { hint?: string; busy?: boolean },
  ) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {({ pressed }) => (
        <View style={[styles.accentRow, pressed ? styles.pressed : null]}>
          {icon}
          <View style={styles.accentText}>
            <Text variant="bodyMedium" color="primary" numberOfLines={1}>
              {title}
            </Text>
            {options?.hint ? (
              <Text variant="caption" color="textSecondary" numberOfLines={1}>
                {options.hint}
              </Text>
            ) : null}
          </View>
          {options?.busy ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <ChevronRight
              size={theme.sizing.iconSm}
              color={theme.colors.primary}
            />
          )}
        </View>
      )}
    </Pressable>
  );

  const renderSaved = () => {
    if (isLoading) {
      return (
        <View style={styles.state}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      );
    }
    if (isError) {
      return (
        <Text variant="caption" color="danger" style={styles.state}>
          {t('home.locationPicker.loadError')}
        </Text>
      );
    }
    if (filtered.length === 0) {
      return (
        <Text variant="caption" color="textSecondary" style={styles.state}>
          {t('home.locationPicker.empty')}
        </Text>
      );
    }
    return (
      <View>
        {filtered.slice(0, MAX_INLINE).map((address) => (
          <Pressable
            key={address.addressId}
            onPress={() => selectAddress(address)}
            accessibilityRole="button"
            accessibilityLabel={addressTitle(address, t('address.untitled'))}
          >
            {({ pressed }) => (
              <View style={[styles.addrRow, pressed ? styles.pressed : null]}>
                <MapPin
                  size={theme.sizing.iconSm}
                  color={theme.colors.textTertiary}
                />
                <View style={styles.addrText}>
                  <View style={styles.addrLabelRow}>
                    <Text
                      variant="bodyMedium"
                      numberOfLines={1}
                      style={styles.addrLabel}
                    >
                      {addressTitle(address, t('address.untitled'))}
                    </Text>
                    {address.isDefault ? (
                      <Badge label={t('address.default')} tone="success" />
                    ) : null}
                  </View>
                  <Text variant="caption" color="textSecondary" numberOfLines={2}>
                    {addressSummary(address)}
                  </Text>
                </View>
              </View>
            )}
          </Pressable>
        ))}
        {filtered.length > MAX_INLINE ? (
          <Pressable
            onPress={viewAllAddresses}
            accessibilityRole="button"
            accessibilityLabel={t('home.locationPicker.viewAll')}
          >
            {({ pressed }) => (
              <View style={[styles.viewAll, pressed ? styles.pressed : null]}>
                <Text variant="label" color="primary">
                  {t('home.locationPicker.viewAll')}
                </Text>
              </View>
            )}
          </Pressable>
        ) : null}
      </View>
    );
  };

  return (
    <BottomSheet
      ref={sheetRef}
      title={t('home.locationPicker.title')}
      contentStyle={styles.content}
    >
      <SearchBar
        value={query}
        onChangeText={setQuery}
        onClear={() => setQuery('')}
        placeholder={t('home.locationPicker.searchPlaceholder')}
      />

      {isPin
        ? renderAccentRow(
            <MapPin size={theme.sizing.iconMd} color={theme.colors.primary} />,
            t('home.locationPicker.usePin', { pin: trimmed }),
            usePinCode,
            { busy: pinLoading },
          )
        : null}

      {renderAccentRow(
        <LocateFixed size={theme.sizing.iconMd} color={theme.colors.primary} />,
        t('home.locationPicker.useCurrent'),
        useCurrentLocation,
        { hint: t('home.locationPicker.useCurrentHint'), busy: locating },
      )}

      <Button
        label={t('home.locationPicker.addNew')}
        variant="outline"
        leftIcon={
          <Plus size={theme.sizing.iconSm} color={theme.colors.primary} />
        }
        onPress={addNewAddress}
      />

      <Divider />

      <Text variant="overline" color="textSecondary">
        {t('home.locationPicker.saved')}
      </Text>
      {renderSaved()}
    </BottomSheet>
  );
});
