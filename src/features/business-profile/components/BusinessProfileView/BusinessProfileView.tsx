// Read-only business profile body: maps the profile + its resolved model onto
// the shared ListingDetailView, so a profile reads as exactly the same kind of
// detail page as a marketplace listing — gallery, hero card, status, owner,
// verified/reason notice, every filled field grouped by the form's own sections,
// and the business address. Shared by the owner detail screen and the admin
// review screen; each caller supplies the header and its own sticky footer
// (Edit vs Approve/Reject/Block).
import {
  AlertTriangle,
  Ban,
  FileText,
  Info,
  MapPin,
  Phone,
  User,
} from 'lucide-react-native';
import { useMemo } from 'react';
import { View } from 'react-native';

import { Badge, Text } from '@/components/ui';
import { fileUrl } from '@/config';
import {
  type DetailSection,
  type DetailStat,
  ListingDetailView,
} from '@/features/marketplace';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';

import type { BusinessProfile } from '../../types/businessProfile.types';
import {
  type BPDetailRow,
  type BusinessProfileDetailModel,
} from '../../utils/businessProfileDetailFields';
import { getStatusLabelKey, getStatusTone } from '../../utils/profileStatus';
import { withAlpha } from '../../utils/withAlpha';
import { createBusinessProfileViewStyles } from './BusinessProfileView.styles';

// Formats one field row's value into a display string (prose is hoisted out
// into descriptions before this, so only text / boolean / tags reach here).
function rowValueText(row: BPDetailRow, yesLabel: string, noLabel: string) {
  const { value } = row;
  if (value.kind === 'boolean') {
    return value.value ? yesLabel : noLabel;
  }
  if (value.kind === 'tags') {
    return value.items.join(', ');
  }
  return value.text;
}

// Props for BusinessProfileView.
export interface BusinessProfileViewProps {
  // The profile being displayed.
  profile: BusinessProfile;
  // Its presentation model (sections/rows/descriptions/photos/address).
  model: BusinessProfileDetailModel;
  // Localized, user-friendly profile-type label (resolved via the option set).
  profileTypeLabel: string;
}

export function BusinessProfileView({
  profile,
  model,
  profileTypeLabel,
}: BusinessProfileViewProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createBusinessProfileViewStyles);
  const { t } = useTranslation();

  const photoUris = useMemo(() => model.photos.map(fileUrl), [model.photos]);
  const tone = getStatusTone(profile.status);
  const toneColor = theme.colors[tone];
  // Read the owner's name directly off attributes: some profile types' form
  // metadata drops it out of the generic rows, and it should never go missing.
  const ownerName =
    typeof profile.attributes?.ownerName === 'string' &&
    profile.attributes.ownerName.trim() !== ''
      ? profile.attributes.ownerName
      : null;
  const reason =
    profile.status === 'REJECTED'
      ? profile.rejectReason
      : profile.status === 'BLOCKED'
        ? profile.blockReason
        : null;

  const stats: DetailStat[] = ownerName
    ? [{ key: 'owner', icon: User, text: ownerName }]
    : [];

  const sections: DetailSection[] = [];

  if (reason) {
    sections.push({
      key: 'reason',
      content: (
        <View
          style={[
            styles.reasonBox,
            {
              backgroundColor: withAlpha(toneColor, theme.opacity.faint),
              borderLeftColor: toneColor,
            },
          ]}
        >
          {profile.status === 'BLOCKED' ? (
            <Ban size={theme.sizing.iconSm} color={toneColor} />
          ) : (
            <AlertTriangle size={theme.sizing.iconSm} color={toneColor} />
          )}
          <View style={styles.reasonBoxText}>
            <Text variant="caption" color="textSecondary">
              {profile.status === 'BLOCKED'
                ? t('businessProfile.blockReason')
                : t('businessProfile.rejectReason')}
            </Text>
            <Text variant="body">{reason}</Text>
          </View>
        </View>
      ),
    });
  }

  if (model.descriptions.length > 0) {
    sections.push({
      key: 'description',
      title: t('businessProfile.description'),
      icon: FileText,
      content: (
        <View style={styles.descriptionGroup}>
          {model.descriptions.map((entry) => (
            <View key={entry.key}>
              {model.descriptions.length > 1 ? (
                <Text
                  variant="label"
                  color="textSecondary"
                  style={styles.blockTitle}
                >
                  {entry.label}
                </Text>
              ) : null}
              <Text variant="body" color="textSecondary">
                {entry.text}
              </Text>
            </View>
          ))}
        </View>
      ),
    });
  }

  model.sections.forEach((section) => {
    sections.push({
      key: `section-${section.key}`,
      title: section.title,
      icon: Info,
      rows: section.rows.map((row) => ({
        key: row.key,
        label: row.label,
        value: rowValueText(row, t('common.yes'), t('common.no')),
        stacked: row.stacked,
      })),
    });
  });

  if (model.address) {
    const address = model.address;
    sections.push({
      key: 'address',
      title: t('businessProfile.businessAddress'),
      icon: MapPin,
      content: (
        <View style={styles.addressGroup}>
          {address.lines.map((line, position) => (
            <Text key={`address-${position}`} variant="body">
              {line}
            </Text>
          ))}
          {address.phones.map((phone) => (
            <View key={phone} style={styles.contactRow}>
              <Phone
                size={theme.sizing.iconXs}
                color={theme.colors.textSecondary}
              />
              <Text variant="bodyMedium">{phone}</Text>
            </View>
          ))}
          {address.coordinates ? (
            <Text
              variant="caption"
              color="textTertiary"
              style={styles.coordinates}
            >
              {address.coordinates}
            </Text>
          ) : null}
        </View>
      ),
    });
  }

  return (
    <ListingDetailView
      images={photoUris}
      statusBadge={
        <Badge
          label={t(getStatusLabelKey(profile.status))}
          tone={getStatusTone(profile.status)}
        />
      }
      overline={profileTypeLabel}
      title={profile.businessName}
      verified={profile.status === 'APPROVED'}
      stats={stats}
      sections={sections}
    />
  );
}
