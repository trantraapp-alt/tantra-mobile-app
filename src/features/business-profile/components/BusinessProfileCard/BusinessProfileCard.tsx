// A business-profile card, laid out like the listing card: a bordered status
// tile on the left, then the business name, category and a colored status
// dot/label, with per-status actions on the bottom row. Status color: approved
// green, pending amber, rejected / blocked red.
import { Image } from 'expo-image';
import {
  BadgeCheck,
  Ban,
  Clock,
  Eye,
  EyeOff,
  type LucideIcon,
  MoreVertical,
  XCircle,
} from 'lucide-react-native';
// A card representing one business profile in the "My Profiles" list.
// Shows business name, type, status badge, reason text, and per-status actions.
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Button, IconButton } from '@/components/buttons';
import { Badge, Card, Text } from '@/components/ui';
import { fileUrl } from '@/config';
import { useThemedStyles, useTranslation } from '@/hooks';
import type { TranslationKey } from '@/i18n';
import { useTheme } from '@/providers';
import type { ColorScheme } from '@/theme';

import type {
  BusinessProfile,
  BusinessProfileStatus,
  ProfileTypeOption,
} from '../../types/businessProfile.types';
import { getStatusLabelKey, getStatusTone } from '../../utils/profileStatus';
import { getProfileTypeLabel } from '../../utils/profileTypeLabels';
import { resolveProfileStatus } from '../../utils/status';
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

// Resolves the profile's first uploaded photo (from attributes.photos / images,
// or any string array) to an absolute URL, or undefined when there is none.
function firstImageUrl(
  attributes: Record<string, unknown> | undefined,
): string | undefined {
  if (!attributes) {
    return undefined;
  }
  const candidates = [attributes.photos, attributes.images, ...Object.values(attributes)];
  for (const list of candidates) {
    if (Array.isArray(list)) {
      const first = list.find((item) => typeof item === 'string' && item);
      if (typeof first === 'string') {
        return fileUrl(first);
      }
    }
  }
  return undefined;
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

  const status = resolveProfileStatus(profile);
  const visual = statusVisual(status);
  const StatusIcon = visual.icon;
  const statusColor = theme.colors[visual.color];
  const statusLabel = t(visual.labelKey);
  const category = getProfileTypeLabel(
    profile.profileType,
    profileTypes,
    language,
  );
  const imageUri = firstImageUrl(profile.attributes);
  const tone = getStatusTone(profile.status);

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

  const accessibilityLabel = [profile.businessName, category, statusLabel]
    .filter(Boolean)
    .join(', ');

  return (
    <Card padded={false} radius="lg" style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
      >
        {({ pressed }) => (
          <View style={[styles.content, pressed ? styles.contentPressed : null]}>
            <View style={styles.iconWrap}>
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
                <View style={styles.titleRow}>
                  <Text variant="h4" numberOfLines={1} style={styles.title}>
                    {profile.businessName}
                  </Text>
                  <View style={styles.headerActionSlot}>
                    <IconButton
                      icon={MoreVertical}
                      size="sm"
                      color={theme.colors.textSecondary}
                      accessibilityLabel={t('businessProfile.moreActions')}
                      onPress={onMenu}
                    />
                  </View>
                </View>
                   <View style={{position: 'absolute', right: 10, top: -20}}>
                      <Badge label={t(getStatusLabelKey(profile.status))} tone={tone} />
                    </View>

                <View style={styles.metaRow}>
                  {category ? (
                    <Text
                      variant="label"
                      color="textSecondary"
                      numberOfLines={1}
                      style={styles.category}
                    >
                      {category}
                    </Text>
                  ) : null}
                 
                </View>

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
                  <>
                    {status === 'APPROVED' ? (
                      <Button
                        label={
                          profile.isVisible
                            ? t('businessProfile.visible')
                            : t('businessProfile.hidden')
                        }
                        variant="ghost"
                        size="sm"
                        fullWidth={false}
                        leftIcon={
                          profile.isVisible ? (
                            <Eye
                              size={theme.sizing.iconSm}
                              color={theme.colors.textSecondary}
                            />
                          ) : (
                            <EyeOff
                              size={theme.sizing.iconSm}
                              color={theme.colors.textTertiary}
                            />
                          )
                        }
                        onPress={onToggleVisibility}
                      />
                    ) : null}
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
                  </>
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
