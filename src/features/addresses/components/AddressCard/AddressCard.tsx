// A saved-address card: label, a one-line address summary, mobile number, a
// "Default" badge on the default one, and Edit / Set default / Delete actions.
import { memo } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/buttons';
import { Badge, Card, Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';

import type { SavedAddress } from '../../types';
import { addressSummary } from '../../utils/addressMapping';
import { createAddressCardStyles } from './AddressCard.styles';

// Props for the AddressCard component.
export interface AddressCardProps {
  // The address to display.
  address: SavedAddress;
  // Opens the edit form for this address.
  onEdit: (address: SavedAddress) => void;
  // Makes this address the default.
  onSetDefault: (address: SavedAddress) => void;
  // Deletes this address.
  onDelete: (address: SavedAddress) => void;
}

// Renders a single saved-address card.
function AddressCardComponent({
  address,
  onEdit,
  onSetDefault,
  onDelete,
}: AddressCardProps) {
  const styles = useThemedStyles(createAddressCardStyles);
  const { t } = useTranslation();
  const summary = addressSummary(address);

  return (
    <Card radius="lg">
      <View style={styles.header}>
        <Text variant="bodyMedium" numberOfLines={1} style={styles.label}>
          {address.label || t('address.untitled')}
        </Text>
        {address.isDefault ? (
          <Badge label={t('address.default')} tone="success" />
        ) : null}
      </View>

      {summary ? (
        <Text variant="caption" color="textSecondary" style={styles.summary}>
          {summary}
        </Text>
      ) : null}

      {address.mobileNumber ? (
        <Text variant="caption" color="textTertiary">
          {address.mobileNumber}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Button
          label={t('address.edit')}
          variant="outline"
          size="sm"
          fullWidth={false}
          onPress={() => onEdit(address)}
        />
        {!address.isDefault ? (
          <Button
            label={t('address.setDefault')}
            variant="ghost"
            size="sm"
            fullWidth={false}
            onPress={() => onSetDefault(address)}
          />
        ) : null}
        <Button
          label={t('address.delete')}
          variant="ghost"
          size="sm"
          fullWidth={false}
          onPress={() => onDelete(address)}
        />
      </View>
    </Card>
  );
}

// Memoized saved-address card.
export const AddressCard = memo(AddressCardComponent);
