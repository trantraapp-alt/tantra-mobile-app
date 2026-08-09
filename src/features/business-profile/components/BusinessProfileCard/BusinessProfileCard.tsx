// A business-profile card: a bordered status/photo tile on the left, then a
// details column reading owner name → business name → category + status,
// a bin icon for direct delete (top-right), and per-status actions on the
// bottom row. Status color: approved green, pending amber, rejected/blocked red.
import { Image } from 'expo-image';
import {
  BadgeCheck,
  Ban,
  Clock,
  type LucideIcon,
  Trash2,
  User,
  XCircle,
} from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Button, IconButton } from '@/components/buttons';
import { Badge, Card, Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';
import type { TranslationKey } from '@/i18n';
import { useTheme } from '@/providers';
import type { ColorScheme } from '@/theme';

import type {
  BusinessProfile,
  BusinessProfileStatus,
  ProfileTypeOption,
} from '../../types/businessProfile.types';
import { firstImageUrl } from '../../utils/profileImage';
import { getStatusLabelKey, getStatusTone } from '../../utils/profileStatus';
import { getProfileTypeLabel } from '../../utils/profileTypeLabels';
import { resolveProfileStatus } from '../../utils/status';
import { CardToneGradient } from '../CardToneGradient';
import { createBusinessProfileCardStyles } from './BusinessProfileCard.styles';

// Semantic color keys used for a status accent.
type StatusColor = Extract<keyof ColorScheme, 'success' | 'warning' | 'danger'>;

// Visual treatment (icon, accent color, label) for each status.
interface StatusVisual {
  icon: LucideIcon;
  color: StatusColor;
  labelKey: TranslationKey;
}

// Maps a profile status to its icon and accent color.
function statusVisual(status: BusinessProfileStatus): StatusVisual {
  switch (status) {
    case 'APPROVED':
      return {
        icon: BadgeCheck,
        color: 'success',
        labelKey: 'businessProfile.status.approved',
      };
    case 'PENDING':
      return {
        icon: Clock,
        color: 'warning',
        labelKey: 'businessProfile.status.pending',
      };
    case 'REJECTED':
      return {
        icon: XCircle,
        color: 'danger',
        labelKey: 'businessProfile.status.rejected',
      };
    case 'BLOCKED':
    default:
      return {
        icon: Ban,
        color: 'danger',
        labelKey: 'businessProfile.status.blocked',
      };
  }
}

// Props for the BusinessProfileCard component.
export interface BusinessProfileCardProps {
  profile: BusinessProfile;
  profileTypes?: ProfileTypeOption[];
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function BusinessProfileCardComponent({
  profile,
  profileTypes = [],
  onPress,
  onEdit,
  onDelete,
}: BusinessProfileCardProps) {
  const styles = useThemedStyles(createBusinessProfileCardStyles);
  const theme = useTheme();
  const { t, language } = useTranslation();

  const status = resolveProfileStatus(profile);
  const visual = statusVisual(status);
  const StatusIcon = visual.icon;
  const statusColor = theme.colors[visual.color];
  const statusLabel = t(visual.labelKey);
  const tone = getStatusTone(profile.status);
  const category = getProfileTypeLabel(
    profile.profileType,
    profileTypes,
    language,
  );
  const imageUri = firstImageUrl(profile.attributes);
  const ownerName =
    typeof profile.attributes?.ownerName === 'string' &&
    profile.attributes.ownerName.trim() !== ''
      ? profile.attributes.ownerName
      : null;

  const reason =
    status === 'REJECTED'
      ? profile.rejectReason
      : status === 'BLOCKED'
        ? profile.blockReason
        : null;
  const reasonLabel =
    status === 'REJECTED'
      ? t('businessProfile.rejectReason')
      : t('businessProfile.blockReason');

  const accessibilityLabel = [ownerName, profile.businessName, category, statusLabel]
    .filter(Boolean)
    .join(', ');

  return (
    <Card padded={false} radius="lg" style={styles.card}>
      <View style={styles.gradientLayer} pointerEvents="none">
        <CardToneGradient color={statusColor} />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
      >
        {({ pressed }) => (
          <View style={[styles.content, pressed ? styles.contentPressed : null]}>
            <View style={styles.cornerBadge} pointerEvents="none">
              <Badge label={t(getStatusLabelKey(profile.status))} tone={tone} />
            </View>
            <View style={styles.iconWrap}>
              <CardToneGradient color={statusColor} intensity={theme.opacity.subtle} />
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.iconImage}
                  contentFit="cover"
                  transition={theme.animation.normal}
                  accessibilityLabel={profile.businessName}
                />
              ) : (
                <StatusIcon size={theme.sizing.iconXl} color={statusColor} />
              )}
            </View>

            <View style={styles.body}>
              <View style={styles.identity}>
                {ownerName ? (
                  <View style={styles.ownerRow}>
                    <User size={theme.sizing.iconXs} color={theme.colors.textSecondary} />
                    <Text
                      variant="label"
                      color="textSecondary"
                      numberOfLines={1}
                      style={styles.ownerName}
                    >
                      {ownerName}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.titleRow}>
                  <Text variant="h3" numberOfLines={1} style={styles.title}>
                    {profile.businessName}
                  </Text>
                  <View style={styles.headerActionSlot}>
                    <IconButton
                      icon={Trash2}
                      size="sm"
                      color={theme.colors.danger}
                      accessibilityLabel={t('businessProfile.delete')}
                      onPress={onDelete}
                    />
                  </View>
                </View>

                {category ? (
                  <Text
                    variant="caption"
                    color="textSecondary"
                    numberOfLines={1}
                    style={styles.category}
                  >
                    {category}
                  </Text>
                ) : null}

                {reason ? (
                  <Text
                    variant="caption"
                    color="textSecondary"
                    numberOfLines={2}
                    style={styles.reason}
                  >
                    {reasonLabel}: {reason}
                  </Text>
                ) : null}
              </View>

              <View style={styles.valueRow}>
                {status === 'BLOCKED' ? (
                  <Text
                    variant="caption"
                    color="textTertiary"
                    numberOfLines={2}
                    style={styles.blockedHint}
                  >
                    {t('businessProfile.blockedEditHint')}
                  </Text>
                ) : (
                  <Button
                    label={
                      status === 'REJECTED'
                        ? t('businessProfile.editResubmit')
                        : t('businessProfile.editProfile')
                    }
                    variant={status === 'REJECTED' ? 'primary' : 'outline'}
                    size="sm"
                    fullWidth={false}
                    onPress={onEdit}
                  />
                )}
              </View>
            </View>
          </View>
        )}
      </Pressable>
    </Card>
  );
}

export const BusinessProfileCard = memo(BusinessProfileCardComponent);
