// Read-only business profile body: photo gallery, identity, status tags,
// verified/reason notice, every filled field grouped by the form's own
// sections (drawn as a lavender attribute grid), and the business address —
// the same visual pattern as the buyer marketplace listing-detail screen, so
// a profile reads as the same kind of detail page as a listing. Shared by the
// owner detail screen and the admin review screen so both read as the same
// kind of page — the caller supplies the header and the status-specific
// footer (Edit vs Approve/Reject/Block).
import { AlertTriangle, BadgeCheck, Ban, MapPin, Phone, User } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';

import { Badge, ImageCarousel, Text } from '@/components/ui';
import { fileUrl } from '@/config';
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

// Props for one rendered attribute-grid box.
interface AttrItemProps {
  row: BPDetailRow;
  yesLabel: string;
  noLabel: string;
}

// Renders one label/value box in the attribute grid.
function AttrItem({ row, yesLabel, noLabel }: AttrItemProps) {
  const styles = useThemedStyles(createBusinessProfileViewStyles);
  const { value } = row;

  let body: ReactNode;
  if (value.kind === 'boolean') {
    body = (
      <Text variant="label" numberOfLines={2}>
        {value.value ? yesLabel : noLabel}
      </Text>
    );
  } else if (value.kind === 'tags') {
    body = (
      <Text variant="label" numberOfLines={2}>
        {value.items.join(', ')}
      </Text>
    );
  } else {
    body = (
      <Text variant="label" numberOfLines={2}>
        {value.text}
      </Text>
    );
  }

  return (
    <View style={[styles.attrItem, row.stacked ? styles.attrItemWide : null]}>
      <Text variant="overline" color="textTertiary">
        {row.label}
      </Text>
      {body}
    </View>
  );
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
  // Read directly off attributes rather than relying on the schema-driven
  // rows below — some profile types' form metadata marks this field in a way
  // that makes it fall out of the generic section rows, and the owner's name
  // is important enough that it should never silently go missing.
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

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <View style={styles.hero}>
        <ImageCarousel images={photoUris} aspectRatio={4 / 3} contentFit="cover" />
        <View style={styles.heroBadge} pointerEvents="none">
          <Badge
            label={t(getStatusLabelKey(profile.status))}
            tone={getStatusTone(profile.status)}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="overline" color="textTertiary">
          {profileTypeLabel}
        </Text>
        <View style={styles.titleRow}>
          <Text variant="h4" numberOfLines={2} style={styles.title}>
            {profile.businessName}
          </Text>
          {profile.status === 'APPROVED' ? (
            <BadgeCheck size={theme.sizing.iconSm} color={theme.colors.info} />
          ) : null}
        </View>

        <View style={styles.tagsRow}>
          <Badge tone={tone} label={t(getStatusLabelKey(profile.status))} />
        </View>

        {ownerName ? (
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <User size={theme.sizing.iconXs} color={theme.colors.textTertiary} />
              <Text variant="caption" color="textSecondary">
                {ownerName}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      {reason ? (
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
      ) : null}

      {model.descriptions.length > 0 ? (
        <View style={[styles.section, styles.sectionBordered]}>
          <Text variant="overline" color="textSecondary" style={styles.sectionTitle}>
            {t('businessProfile.description')}
          </Text>
          <View style={styles.descriptionGroup}>
            {model.descriptions.map((entry) => (
              <View key={entry.key}>
                {model.descriptions.length > 1 ? (
                  <Text variant="label" color="textSecondary" style={styles.blockTitle}>
                    {entry.label}
                  </Text>
                ) : null}
                <Text variant="body" color="textSecondary">
                  {entry.text}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {model.sections.map((section) => (
        <View key={section.key} style={[styles.section, styles.sectionBordered]}>
          <Text variant="overline" color="textSecondary" style={styles.sectionTitle}>
            {section.title}
          </Text>
          <View style={styles.attrsGrid}>
            {section.rows.map((row) => (
              <AttrItem
                key={row.key}
                row={row}
                yesLabel={t('common.yes')}
                noLabel={t('common.no')}
              />
            ))}
          </View>
        </View>
      ))}

      {model.address ? (
        <View style={[styles.section, styles.sectionBordered]}>
          <Text variant="overline" color="textSecondary" style={styles.sectionTitle}>
            {t('businessProfile.businessAddress')}
          </Text>
          <View style={styles.addressCard}>
            <View style={[styles.addressIcon, { backgroundColor: toneColor }]}>
              <MapPin size={theme.sizing.iconSm} color={theme.colors.onPrimary} />
            </View>
            <View style={styles.addressLines}>
              {model.address.lines.map((line, position) => (
                <Text key={`address-${position}`} variant="body">
                  {line}
                </Text>
              ))}
              {model.address.phones.map((phone) => (
                <View key={phone} style={styles.contactRow}>
                  <Phone size={theme.sizing.iconXs} color={theme.colors.textSecondary} />
                  <Text variant="bodyMedium">{phone}</Text>
                </View>
              ))}
              {model.address.coordinates ? (
                <Text variant="caption" color="textTertiary" style={styles.coordinates}>
                  {model.address.coordinates}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}
