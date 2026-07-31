// A saved-address card: a tinted location-icon tile, the label with a "Default"
// badge, a one-line address summary and mobile number, then a divided action row
// — Edit / Set default on the left and a red Delete on the right.
import { MapPin, Pencil, Phone, Star, Trash2 } from 'lucide-react-native';
import { memo } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/buttons';
import { Badge, Card, Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';

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
  const theme = useTheme();
  const { t } = useTranslation();
  const summary = addressSummary(address);

  return (
    <Card
      radius="lg"
      style={address.isDefault ? styles.cardDefault : undefined}
    >
      <View style={styles.header}>
        <View style={styles.iconTile}>
          <MapPin size={theme.sizing.iconMd} color={theme.colors.primary} />
        </View>

        <View style={styles.headerText}>
          <View style={styles.labelRow}>
            <Text variant="bodyMedium" numberOfLines={1} style={styles.label}>
              {address.label || t('address.untitled')}
            </Text>
            {address.isDefault ? (
              <Badge label={t('address.default')} tone="success" />
            ) : null}
          </View>

          {summary ? (
            <Text variant="caption" color="textSecondary" numberOfLines={2}>
              {summary}
            </Text>
          ) : null}

          {address.mobileNumber ? (
            <View style={styles.mobileRow}>
              <Phone
                size={theme.sizing.iconXs}
                color={theme.colors.textTertiary}
              />
              <Text variant="caption" color="textSecondary">
                {address.mobileNumber}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.actions}>
        <View style={styles.actionsLeft}>
          <Button
            label={t('address.edit')}
            variant="outline"
            size="sm"
            fullWidth={false}
            leftIcon={
              <Pencil size={theme.sizing.iconSm} color={theme.colors.primary} />
            }
            onPress={() => onEdit(address)}
          />
          {!address.isDefault ? (
            <Button
              label={t('address.setDefault')}
              variant="ghost"
              size="sm"
              fullWidth={false}
              leftIcon={
                <Star size={theme.sizing.iconSm} color={theme.colors.primary} />
              }
              onPress={() => onSetDefault(address)}
            />
          ) : null}
        </View>

        <Button
          label={t('address.delete')}
          variant="danger"
          size="sm"
          fullWidth={false}
          leftIcon={
            <Trash2 size={theme.sizing.iconSm} color={theme.colors.onPrimary} />
          }
          onPress={() => onDelete(address)}
        />
      </View>
    </Card>
  );
}

// Memoized saved-address card.
export const AddressCard = memo(AddressCardComponent);
