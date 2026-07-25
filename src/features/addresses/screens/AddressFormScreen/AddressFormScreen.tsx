// Add / edit a saved address. Fill it manually (with cascading geo dropdowns and
// PIN auto-fill) or from the device's current location. On save, returns to the
// list — or, when opened with a `returnTo`, back to that screen.
import { useRouter } from 'expo-router';
import { LocateFixed } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  View,
} from 'react-native';

import { Button } from '@/components/buttons';
import { ErrorState } from '@/components/empty-state';
import { Checkbox, TextField } from '@/components/inputs';
import { Spinner } from '@/components/loaders';
import { Header } from '@/components/shared';
import { Screen } from '@/components/ui';
import { lookupPincode, useDeviceLocation } from '@/features/location';
import { localize } from '@/features/sell';
import { useThemedStyles, useTranslation } from '@/hooks';
import { logger } from '@/lib';
import { useTheme, useToast } from '@/providers';

import { addressesApi } from '../../api';
import { GeoCascade } from '../../components';
import type { AddressFormValues } from '../../types';
import {
  emptyAddressForm,
  formToPayload,
  mergePincode,
  mergePlace,
  savedToForm,
} from '../../utils/addressMapping';
import { pendingAddress } from '../../utils/pendingAddress';
import { createAddressFormStyles } from './AddressFormScreen.styles';

// Fields that must be filled before saving.
type FieldErrors = Partial<Record<keyof AddressFormValues, string>>;

// Props for the AddressFormScreen component.
export interface AddressFormScreenProps {
  // Id of the address being edited (absent in add mode).
  addressId?: string;
  // Optional route to return to after saving (listing round-trip).
  returnTo?: string;
}

// Renders the add / edit address form.
export function AddressFormScreen({
  addressId,
  returnTo,
}: AddressFormScreenProps) {
  const styles = useThemedStyles(createAddressFormStyles);
  const theme = useTheme();
  const router = useRouter();
  const { t, language } = useTranslation();
  const { showSuccess, showError } = useToast();
  const { request: requestLocation, loading: locating } = useDeviceLocation();

  const isEdit = Boolean(addressId);
  const [values, setValues] = useState<AddressFormValues>(emptyAddressForm());
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    isEdit ? 'loading' : 'ready',
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  // Load the existing address (edit mode) by finding it in the user's list.
  useEffect(() => {
    if (!addressId) {
      return;
    }
    let active = true;
    setStatus('loading');
    addressesApi
      .list()
      .then((list) => {
        if (!active) {
          return;
        }
        const found = list.find((item) => item.addressId === addressId);
        if (found) {
          setValues(savedToForm(found));
          setStatus('ready');
        } else {
          setStatus('error');
        }
      })
      .catch((error) => {
        if (active) {
          logger.warn('[Addresses] Failed to load address', error);
          setStatus('error');
        }
      });
    return () => {
      active = false;
    };
  }, [addressId]);

  // Updates a single text field.
  const set = useCallback(
    (key: keyof AddressFormValues) => (text: string) => {
      setValues((prev) => ({ ...prev, [key]: text }));
    },
    [],
  );

  // Looks up a PIN code once six digits are entered and fills district/state.
  const handlePinChange = useCallback(
    (text: string) => {
      setValues((prev) => ({ ...prev, pinCode: text }));
      if (/^\d{6}$/.test(text)) {
        void lookupPincode(text).then((result) => {
          if (result) {
            setValues((prev) => mergePincode(prev, result));
          } else {
            showError(t('address.pinNotFound'));
          }
        });
      }
    },
    [showError, t],
  );

  // Fills the form from the device's current location.
  const handleUseLocation = useCallback(async () => {
    const outcome = await requestLocation();
    if (outcome.status === 'granted' && outcome.place) {
      const place = outcome.place;
      setValues((prev) => mergePlace(prev, place));
      showSuccess(t('address.locationFilled'));
      return;
    }
    if (outcome.status === 'denied') {
      showError(t('address.locationDenied'));
      void Linking.openSettings();
      return;
    }
    showError(t('address.locationUnavailable'));
  }, [requestLocation, showSuccess, showError, t]);

  // Validates and submits the form.
  const handleSave = useCallback(async () => {
    const nextErrors: FieldErrors = {};
    if (!values.fullAddress.trim()) {
      nextErrors.fullAddress = t('address.requiredError');
    }
    if (!/^\d{6}$/.test(values.pinCode.trim())) {
      nextErrors.pinCode = t('address.requiredError');
    }
    if (!/^\d{10}$/.test(values.mobileNumber.trim())) {
      nextErrors.mobileNumber = t('address.requiredError');
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      showError(t('address.requiredError'));
      return;
    }

    setSaving(true);
    try {
      const payload = formToPayload(values);
      const res =
        isEdit && addressId
          ? await addressesApi.update(addressId, payload)
          : await addressesApi.create(payload);
      showSuccess(
        res.message ? localize(res.message, language) : t('address.saveSuccess'),
      );
      // When opened from a listing, hand the new id back so the address
      // selector can auto-select it, then return to the (still-mounted) form.
      if (returnTo && res.addressId) {
        pendingAddress.set(res.addressId);
      }
      router.back();
    } catch (error) {
      logger.warn('[Addresses] Save failed', error);
      showError(t('address.saveError'));
    } finally {
      setSaving(false);
    }
  }, [
    values,
    isEdit,
    addressId,
    returnTo,
    router,
    showSuccess,
    showError,
    language,
    t,
  ]);

  const renderBody = () => {
    if (status === 'loading') {
      return (
        <View style={styles.center}>
          <Spinner />
        </View>
      );
    }
    if (status === 'error') {
      return (
        <View style={styles.center}>
          <ErrorState
            description={t('address.loadError')}
            onRetry={() => router.back()}
            retryLabel={t('common.retry')}
          />
        </View>
      );
    }
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Button
            label={t('address.useCurrentLocation')}
            variant="outline"
            leftIcon={
              <LocateFixed
                size={theme.sizing.iconSm}
                color={theme.colors.primary}
              />
            }
            loading={locating}
            style={styles.locationButton}
            onPress={handleUseLocation}
          />

          <TextField
            label={t('address.label')}
            placeholder={t('address.labelPlaceholder')}
            value={values.label}
            onChangeText={set('label')}
            size="sm"
          />
          <TextField
            label={t('address.fullAddress')}
            placeholder={t('address.fullAddressPlaceholder')}
            value={values.fullAddress}
            onChangeText={set('fullAddress')}
            error={errors.fullAddress}
            multiline
            numberOfLines={2}
            size="sm"
          />

          <GeoCascade
            value={{
              country: values.country,
              state: values.state,
              district: values.district,
            }}
            onChange={(geo) => setValues((prev) => ({ ...prev, ...geo }))}
            language={language}
          />

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <TextField
                label={t('address.city')}
                value={values.city}
                onChangeText={set('city')}
                size="sm"
              />
            </View>
            <View style={styles.rowItem}>
              <TextField
                label={t('address.village')}
                value={values.village}
                onChangeText={set('village')}
                size="sm"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <TextField
                label={t('address.pinCode')}
                value={values.pinCode}
                onChangeText={handlePinChange}
                error={errors.pinCode}
                keyboardType="number-pad"
                maxLength={6}
                size="sm"
              />
            </View>
            <View style={styles.rowItem}>
              <TextField
                label={t('address.mobileNumber')}
                value={values.mobileNumber}
                onChangeText={set('mobileNumber')}
                error={errors.mobileNumber}
                keyboardType="phone-pad"
                maxLength={10}
                size="sm"
              />
            </View>
          </View>

          <TextField
            label={t('address.altMobileNumber')}
            value={values.altMobileNumber}
            onChangeText={set('altMobileNumber')}
            keyboardType="phone-pad"
            maxLength={10}
            size="sm"
          />

          <Checkbox
            label={t('address.makeDefault')}
            checked={values.isDefault}
            onChange={(checked) =>
              setValues((prev) => ({ ...prev, isDefault: checked }))
            }
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label={t('address.save')}
            size="lg"
            loading={saving}
            onPress={handleSave}
          />
        </View>
      </KeyboardAvoidingView>
    );
  };

  return (
    <Screen padded={false}>
      <Header
        title={isEdit ? t('address.editTitle') : t('address.addTitle')}
        showBack
        onBack={() => router.back()}
      />
      {renderBody()}
    </Screen>
  );
}
