// Structured address input for the ADDRESS field type. Collects the address
// sub-fields into a single AddressValue object.
import { View } from 'react-native';

import { TextField } from '@/components/inputs';
import { Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';

import type { AddressValue } from '../../forms/address';
import { createAddressFieldStyles } from './AddressField.styles';

// Props for the AddressField component.
export interface AddressFieldProps {
  // Field label.
  label: string;
  // Current address value.
  value: AddressValue;
  // Called with the updated address.
  onChange: (value: AddressValue) => void;
  // Error message shown below the field.
  error?: string;
}

// Renders the structured address sub-fields.
export function AddressField({ label, value, onChange, error }: AddressFieldProps) {
  const styles = useThemedStyles(createAddressFieldStyles);

  // Returns an onChangeText handler that updates a single address key.
  const set = (key: keyof AddressValue) => (text: string) =>
    onChange({ ...value, [key]: text });

  return (
    <View style={styles.container}>
      <Text variant="label" color="textSecondary">
        {label}
      </Text>

      <View style={styles.fields}>
        <TextField
          label="Full address"
          placeholder="House / street / landmark"
          value={value.fullAddress}
          onChangeText={set('fullAddress')}
          multiline
          numberOfLines={2}
          size="sm"
        />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <TextField
              label="Village"
              value={value.village}
              onChangeText={set('village')}
              size="sm"
            />
          </View>
          <View style={styles.rowItem}>
            <TextField
              label="District"
              value={value.district}
              onChangeText={set('district')}
              size="sm"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <TextField
              label="City"
              value={value.city}
              onChangeText={set('city')}
              size="sm"
            />
          </View>
          <View style={styles.rowItem}>
            <TextField
              label="State"
              value={value.state}
              onChangeText={set('state')}
              size="sm"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <TextField
              label="Country"
              value={value.country}
              onChangeText={set('country')}
              size="sm"
            />
          </View>
          <View style={styles.rowItem}>
            <TextField
              label="PIN code"
              value={value.pinCode}
              onChangeText={set('pinCode')}
              keyboardType="number-pad"
              maxLength={6}
              size="sm"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <TextField
              label="Mobile number"
              value={value.mobileNumber}
              onChangeText={set('mobileNumber')}
              keyboardType="phone-pad"
              maxLength={10}
              size="sm"
            />
          </View>
          <View style={styles.rowItem}>
            <TextField
              label="Alt. mobile"
              value={value.altMobileNumber}
              onChangeText={set('altMobileNumber')}
              keyboardType="phone-pad"
              maxLength={10}
              size="sm"
            />
          </View>
        </View>
      </View>

      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
