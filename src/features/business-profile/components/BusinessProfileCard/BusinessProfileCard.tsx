// A business-profile card: a photo/status tile beside an identity column
// (owner + ref-id chip, business name, category, location + submitted date),
// an optional tone-tinted reason notice, and a full-width action row (a
// circular delete control at the far left, the primary edit action filling
// the rest). Status color: approved green, pending amber, rejected red,
// blocked amber (a deliberately different shade from rejected, since one is
// fixable and the other is permanent).
import { Image } from 'expo-image';
import { Calendar, MapPin, SquarePen, Trash2, User } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Button, IconButton } from '@/components/buttons';
import { Badge, Card, Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';
import { formatDate } from '@/utils';

import type { BusinessProfile, ProfileTypeOption } from '../../types/businessProfile.types';
import { firstImageUrl } from '../../utils/profileImage';
import { cardLocality } from '../../utils/profileLocality';
import { getCardTone, getStatusIcon, getStatusLabelKey } from '../../utils/profileStatus';
import { getProfileTypeLabel } from '../../utils/profileTypeLabels';
import { resolveProfileStatus } from '../../utils/status';
import { withAlpha } from '../../utils/withAlpha';
import { CardToneGradient } from '../CardToneGradient';
import { createBusinessProfileCardStyles } from './BusinessProfileCard.styles';

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
  const tone = getCardTone(status);
  const StatusIcon = getStatusIcon(status);
  const statusColor = theme.colors[tone];
  const statusLabel = t(getStatusLabelKey(status));
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
  const locality = cardLocality(profile.address);
  const submittedOn = profile.createdAt ? formatDate(profile.createdAt) : null;

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
      <View style={styles.cornerBadge} pointerEvents="none">
        <Badge label={statusLabel} tone={tone} />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
      >
        {({ pressed }) => (
          <View style={[styles.content, pressed ? styles.contentPressed : null]}>
            <View style={styles.topRow}>
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

              <View style={styles.identity}>
                <View style={styles.ownerRow}>
                  {ownerName ? (
                    <>
                      <User size={theme.sizing.iconXs} color={theme.colors.textSecondary} />
                      <Text
                        variant="label"
                        color="textSecondary"
                        numberOfLines={1}
                        style={styles.ownerName}
                      >
                        {ownerName}
                      </Text>
                    </>
                  ) : null}
                  <View
                    style={[
                      styles.refIdChip,
                      {
                        borderColor: withAlpha(theme.colors.primary, theme.opacity.subtle),
                        backgroundColor: withAlpha(theme.colors.primary, theme.opacity.faint),
                      },
                    ]}
                  >
                    <Text variant="overline" color="primary">
                      {profile.profileId}
                    </Text>
                  </View>
                </View>

                <Text variant="h3" numberOfLines={1} style={styles.title}>
                  {profile.businessName}
                </Text>

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

                {locality || submittedOn ? (
                  <View style={styles.metaRow}>
                    {locality ? (
                      <View style={styles.metaItem}>
                        <MapPin size={theme.sizing.iconXs} color={theme.colors.textTertiary} />
                        <Text variant="caption" color="textSecondary">
                          {locality}
                        </Text>
                      </View>
                    ) : null}
                    {submittedOn ? (
                      <View style={styles.metaItem}>
                        <Calendar size={theme.sizing.iconXs} color={theme.colors.textTertiary} />
                        <Text variant="caption" color="textSecondary">
                          {t('businessProfile.submittedOn', { value: submittedOn })}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </View>
            </View>

            {reason ? (
              <View
                style={[
                  styles.reasonBox,
                  { backgroundColor: withAlpha(statusColor, theme.opacity.faint) },
                ]}
              >
                <Text variant="caption" style={[styles.reasonLabel, { color: statusColor }]}>
                  {reasonLabel}:
                </Text>
                <Text variant="body" numberOfLines={3}>
                  {reason}
                </Text>
              </View>
            ) : null}

            <View style={styles.bottomRow}>
              <View
                style={[
                  styles.deleteButton,
                  { backgroundColor: withAlpha(theme.colors.danger, theme.opacity.faint) },
                ]}
              >
                <IconButton
                  icon={Trash2}
                  size="sm"
                  color={theme.colors.danger}
                  accessibilityLabel={t('businessProfile.delete')}
                  onPress={onDelete}
                />
              </View>

              {status === 'BLOCKED' ? (
                <View style={styles.blockedHintRow}>
                  <Text
                    variant="caption"
                    color="textTertiary"
                    numberOfLines={2}
                    style={styles.blockedHintText}
                  >
                    {t('businessProfile.blockedEditHint')}
                  </Text>
                </View>
              ) : (
                <Button
                  label={
                    status === 'REJECTED'
                      ? t('businessProfile.editResubmit')
                      : t('businessProfile.editProfile')
                  }
                  variant="primary"
                  size="md"
                  leftIcon={<SquarePen size={theme.sizing.iconSm} color={theme.colors.onPrimary} />}
                  style={styles.editButton}
                  onPress={onEdit}
                />
              )}
            </View>
          </View>
        )}
      </Pressable>
    </Card>
  );
}

export const BusinessProfileCard = memo(BusinessProfileCardComponent);
