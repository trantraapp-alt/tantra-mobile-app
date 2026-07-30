// A card representing one business profile in the "My Profiles" list.
// Shows business name, type, status badge, reason text, and per-status actions.
import { BadgeCheck, MoreVertical } from 'lucide-react-native';
import { memo } from 'react';
import { View } from 'react-native';

import { Button, IconButton } from '@/components/buttons';
import { Badge, type BadgeTone, Card, Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';

import type { BusinessProfile, BusinessProfileStatus, ProfileTypeOption } from '../../types/businessProfile.types';
import { getProfileTypeLabel } from '../../utils/profileTypeLabels';
import { createBusinessProfileCardStyles } from './BusinessProfileCard.styles';

// Maps a profile status to a badge tone.
function statusTone(status: BusinessProfileStatus): BadgeTone {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'REJECTED':
      return 'danger';
    case 'BLOCKED':
      return 'danger';
    default:
      return 'neutral';
  }
}

// Props for the BusinessProfileCard component.
export interface BusinessProfileCardProps {
  profile: BusinessProfile;
  profileTypes?: ProfileTypeOption[];
  onPress: () => void;
  onEdit: () => void;
  onToggleVisibility: () => void;
  onMenu: () => void;
}

function BusinessProfileCardComponent({
  profile,
  profileTypes = [],
  onPress,
  onEdit,
  onToggleVisibility,
  onMenu,
}: BusinessProfileCardProps) {
  const styles = useThemedStyles(createBusinessProfileCardStyles);
  const theme = useTheme();
  const { t, language } = useTranslation();

  const statusKey =
    profile.status === 'APPROVED'
      ? 'businessProfile.status.approved'
      : profile.status === 'PENDING'
        ? 'businessProfile.status.pending'
        : profile.status === 'REJECTED'
          ? 'businessProfile.status.rejected'
          : 'businessProfile.status.blocked';

  const reason =
    profile.status === 'REJECTED'
      ? profile.rejectReason
      : profile.status === 'BLOCKED'
        ? profile.blockReason
        : null;

  const reasonLabel =
    profile.status === 'REJECTED'
      ? t('businessProfile.rejectReason')
      : t('businessProfile.blockReason');

  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text variant="bodyMedium" numberOfLines={2}>
            {profile.businessName}
          </Text>
          <Text variant="caption" color="textSecondary" numberOfLines={1}>
            {getProfileTypeLabel(profile.profileType, profileTypes, language)}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
          <Badge label={t(statusKey)} tone={statusTone(profile.status)} />
          <IconButton
            icon={MoreVertical}
            size="sm"
            color={theme.colors.textSecondary}
            accessibilityLabel={t('businessProfile.moreActions')}
            onPress={onMenu}
          />
        </View>
      </View>

      {profile.status === 'APPROVED' && (
        <View style={styles.verifiedRow}>
          <BadgeCheck
            size={theme.sizing.iconSm}
            color={theme.colors.success}
          />
          <Text variant="caption" color="success">
            {t('businessProfile.verifiedBadge')}
          </Text>
        </View>
      )}

      {reason ? (
        <View style={styles.reasonBox}>
          <Text variant="caption" color="textSecondary">
            {reasonLabel}
          </Text>
          <Text variant="body">{reason}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        {profile.status === 'APPROVED' && (
          <Button
            label={
              profile.isVisible
                ? t('businessProfile.showToBuyers')
                : t('businessProfile.showToBuyers')
            }
            variant={profile.isVisible ? 'outline' : 'ghost'}
            size="sm"
            fullWidth={false}
            onPress={onToggleVisibility}
          />
        )}

        {profile.status === 'REJECTED' && (
          <Button
            label={t('businessProfile.editResubmit')}
            variant="outline"
            size="sm"
            fullWidth={false}
            onPress={onEdit}
          />
        )}

        {profile.status === 'BLOCKED' && (
          <Text
            variant="caption"
            color="textTertiary"
            style={styles.blockedHint}
          >
            {t('businessProfile.blockedEditHint')}
          </Text>
        )}

        {profile.status !== 'BLOCKED' && profile.status !== 'REJECTED' && (
          <Button
            label={t('businessProfile.editProfile')}
            variant="ghost"
            size="sm"
            fullWidth={false}
            onPress={onEdit}
          />
        )}
      </View>
    </Card>
  );
}

export const BusinessProfileCard = memo(BusinessProfileCardComponent);
