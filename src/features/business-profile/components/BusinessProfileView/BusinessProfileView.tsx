// Read-only business profile body: photo gallery, identity, verified badge /
// reason notice, every filled field grouped by the form's own sections, and
// the business address. Shared by the owner detail screen and the admin
// review screen so both read as the same kind of page — the caller supplies
// the header and the status-specific footer (Edit vs Approve/Reject/Block).
import { AlertTriangle, BadgeCheck, Ban, Check, MapPin, Phone, X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Fragment, useMemo } from 'react';
import { ScrollView, View } from 'react-native';

import { Badge, type BadgeTone, Divider, ImageCarousel, Text } from '@/components/ui';
import { fileUrl } from '@/config';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';

import type { BusinessProfile, BusinessProfileStatus } from '../../types/businessProfile.types';
import {
  type BPDetailRow,
  type BusinessProfileDetailModel,
} from '../../utils/businessProfileDetailFields';
import { createBusinessProfileViewStyles } from './BusinessProfileView.styles';

function statusLabelKey(status: BusinessProfileStatus) {
  if (status === 'APPROVED') {
    return 'businessProfile.status.approved' as const;
  }
  if (status === 'PENDING') {
    return 'businessProfile.status.pending' as const;
  }
  if (status === 'REJECTED') {
    return 'businessProfile.status.rejected' as const;
  }
  return 'businessProfile.status.blocked' as const;
}

function statusTone(status: BusinessProfileStatus): BadgeTone {
  if (status === 'APPROVED') {
    return 'success';
  }
  if (status === 'PENDING') {
    return 'warning';
  }
  return 'danger';
}

// Props for one rendered field row.
interface FieldRowProps {
  row: BPDetailRow;
  yesLabel: string;
  noLabel: string;
}

// Renders one label/value pair, inline or stacked depending on its value.
function FieldRow({ row, yesLabel, noLabel }: FieldRowProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createBusinessProfileViewStyles);
  const { value } = row;

  let body: ReactNode;
  if (value.kind === 'boolean') {
    body = (
      <View style={styles.booleanValue}>
        {value.value ? (
          <Check size={theme.sizing.iconSm} color={theme.colors.success} />
        ) : (
          <X size={theme.sizing.iconSm} color={theme.colors.textTertiary} />
        )}
        <Text variant="bodyMedium">{value.value ? yesLabel : noLabel}</Text>
      </View>
    );
  } else if (value.kind === 'tags') {
    body = (
      <View style={styles.tagWrap}>
        {value.items.map((item, position) => (
          <View key={`${row.key}-${position}-${item}`} style={styles.tag}>
            <Text variant="caption" color="textSecondary">
              {item}
            </Text>
          </View>
        ))}
      </View>
    );
  } else {
    body = <Text variant="bodyMedium">{value.text}</Text>;
  }

  if (row.stacked) {
    return (
      <View style={styles.stackedRow}>
        <Text variant="label" color="textSecondary">
          {row.label}
        </Text>
        {body}
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Text variant="body" color="textSecondary" style={styles.rowLabel}>
        {row.label}
      </Text>
      <View style={styles.rowValue}>{body}</View>
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
  const reason =
    profile.status === 'REJECTED'
      ? profile.rejectReason
      : profile.status === 'BLOCKED'
        ? profile.blockReason
        : null;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.hero}>
        <ImageCarousel images={photoUris} aspectRatio={4 / 3} contentFit="cover" />
        <View style={styles.heroBadge} pointerEvents="none">
          <Badge
            label={t(statusLabelKey(profile.status))}
            tone={statusTone(profile.status)}
          />
        </View>
      </View>

      <View style={[styles.block, styles.identity]}>
        <Text variant="overline" color="textTertiary">
          {profileTypeLabel}
        </Text>
        <Text variant="h2" numberOfLines={2}>
          {profile.businessName}
        </Text>
      </View>

      {profile.status === 'APPROVED' ? (
        <View style={styles.verifiedBanner}>
          <BadgeCheck size={theme.sizing.iconMd} color={theme.colors.success} />
          <Text variant="bodyMedium" color="success">
            {t('businessProfile.verifiedBadge')}
          </Text>
        </View>
      ) : null}

      {reason ? (
        <View
          style={[
            styles.reasonBox,
            {
              borderLeftColor:
                profile.status === 'BLOCKED'
                  ? theme.colors.danger
                  : theme.colors.warning,
            },
          ]}
        >
          {profile.status === 'BLOCKED' ? (
            <Ban size={theme.sizing.iconSm} color={theme.colors.danger} />
          ) : (
            <AlertTriangle size={theme.sizing.iconSm} color={theme.colors.warning} />
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
        <View style={styles.block}>
          <Text variant="h4" style={styles.blockTitle}>
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
                <Text variant="body">{entry.text}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {model.sections.map((section) => (
        <Fragment key={section.key}>
          <View style={styles.band} />
          <View style={styles.block}>
            <Text variant="overline" color="textSecondary" style={styles.blockTitle}>
              {section.title}
            </Text>
            {section.rows.map((row, position) => (
              <Fragment key={row.key}>
                {position > 0 ? <Divider /> : null}
                <FieldRow row={row} yesLabel={t('common.yes')} noLabel={t('common.no')} />
              </Fragment>
            ))}
          </View>
        </Fragment>
      ))}

      {model.address ? (
        <>
          <View style={styles.band} />
          <View style={styles.block}>
            <View style={styles.titleRow}>
              <MapPin size={theme.sizing.iconSm} color={theme.colors.textSecondary} />
              <Text variant="h4">{t('businessProfile.businessAddress')}</Text>
            </View>
            <View style={styles.addressLines}>
              {model.address.lines.map((line, position) => (
                <Text key={`address-${position}`} variant="body">
                  {line}
                </Text>
              ))}
            </View>
            {model.address.phones.map((phone) => (
              <View key={phone} style={styles.contactRow}>
                <Phone size={theme.sizing.iconSm} color={theme.colors.textSecondary} />
                <Text variant="bodyMedium">{phone}</Text>
              </View>
            ))}
            {model.address.coordinates ? (
              <Text variant="caption" color="textTertiary" style={styles.coordinates}>
                {model.address.coordinates}
              </Text>
            ) : null}
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}
