// Bottom sheet for choosing the user's location: one tap for GPS, or a PIN code
// for users who deny location. Resolves to the persisted location slice.
import { LocateFixed } from 'lucide-react-native';
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { Linking, View } from 'react-native';

import { Button } from '@/components/buttons';
import { TextField } from '@/components/inputs';
import { BottomSheet, type BottomSheetRef, Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme, useToast } from '@/providers';
import { useAppDispatch } from '@/store/hooks';
import { setLocation } from '@/store/slices';

import { lookupPincode } from '../../api/pincodeApi';
import { useDeviceLocation } from '../../hooks';
import { createLocationSheetStyles } from './LocationSheet.styles';

// Imperative handle to open / close the sheet.
export type LocationSheetRef = BottomSheetRef;

// Renders the location-picker bottom sheet.
export const LocationSheet = forwardRef<LocationSheetRef, object>(
  function LocationSheet(_props, ref) {
    const theme = useTheme();
    const styles = useThemedStyles(createLocationSheetStyles);
    const { t } = useTranslation();
    const { showSuccess, showError } = useToast();
    const dispatch = useAppDispatch();
    const sheetRef = useRef<BottomSheetRef>(null);
    const { request, loading } = useDeviceLocation();
    const [pin, setPin] = useState('');
    const [pinLoading, setPinLoading] = useState(false);

    useImperativeHandle(
      ref,
      () => ({
        present: () => sheetRef.current?.present(),
        dismiss: () => sheetRef.current?.dismiss(),
      }),
      [],
    );

    // Sets the location from a GPS fix.
    const useGps = useCallback(async () => {
      const outcome = await request();
      if (outcome.status === 'granted' && outcome.place) {
        const place = outcome.place;
        dispatch(
          setLocation({
            label:
              place.city ||
              place.district ||
              place.state ||
              t('location.currentLabel'),
            city: place.city,
            district: place.district,
            state: place.state,
            pinCode: place.pinCode,
            latitude: place.latitude,
            longitude: place.longitude,
          }),
        );
        showSuccess(t('location.updated'));
        sheetRef.current?.dismiss();
        return;
      }
      if (outcome.status === 'denied') {
        showError(t('address.locationDenied'));
        void Linking.openSettings();
        return;
      }
      showError(t('address.locationUnavailable'));
    }, [request, dispatch, t, showSuccess, showError]);

    // Sets the location from a PIN-code lookup.
    const usePin = useCallback(async () => {
      if (!/^\d{6}$/.test(pin)) {
        showError(t('address.pinNotFound'));
        return;
      }
      setPinLoading(true);
      try {
        const result = await lookupPincode(pin);
        if (!result) {
          showError(t('address.pinNotFound'));
          return;
        }
        dispatch(
          setLocation({
            label: result.district || result.city,
            city: result.city,
            district: result.district,
            state: result.state,
            pinCode: result.pinCode,
            latitude: null,
            longitude: null,
          }),
        );
        showSuccess(t('location.updated'));
        setPin('');
        sheetRef.current?.dismiss();
      } finally {
        setPinLoading(false);
      }
    }, [pin, dispatch, t, showSuccess, showError]);

    return (
      <BottomSheet
        ref={sheetRef}
        title={t('location.sheetTitle')}
        subtitle={t('location.sheetSubtitle')}
      >
        <View style={styles.content}>
          <Button
            label={t('address.useCurrentLocation')}
            leftIcon={
              <LocateFixed
                size={theme.sizing.iconSm}
                color={theme.colors.onPrimary}
              />
            }
            loading={loading}
            onPress={useGps}
          />
          <Text
            variant="caption"
            color="textTertiary"
            align="center"
            style={styles.divider}
          >
            {t('location.or')}
          </Text>
          <TextField
            label={t('address.pinCode')}
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            maxLength={6}
            size="sm"
          />
          <Button
            label={t('location.setByPin')}
            variant="outline"
            loading={pinLoading}
            onPress={usePin}
          />
        </View>
      </BottomSheet>
    );
  },
);
