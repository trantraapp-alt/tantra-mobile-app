// Read-only business profile body: photo gallery, identity, verified badge /
// reason notice, every filled field grouped by the form's own sections (drawn
// as fieldset-legend cards, the same language as the create/edit form), and
// the business address. Shared by the owner detail screen and the admin
// review screen so both read as the same kind of page — the caller supplies
// the header and the status-specific footer (Edit vs Approve/Reject/Block).
import {
  AlertTriangle,
  BadgeCheck,
  Ban,
  Check,
  FileText,
  type LucideIcon,
  Mail,
  MapPin,
  Phone,
  User,
  X,
} from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Fragment, useMemo } from 'react';
import { ScrollView, View } from 'react-native';

import { Badge, Divider, ImageCarousel, Text } from '@/components/ui';
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

// Best-effort contextual icon for a field row, guessed from its key — purely
// decorative, so an unmatched key just renders without one.
function fieldIcon(key: string): LucideIcon | null {
  if (/phone|mobile/i.test(key)) {
    return Phone;
  }
  if (/email/i.test(key)) {
    return Mail;
  }
  if (/gst|registration|license|tax/i.test(key)) {
    return FileText;
  }
  return null;
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
  const Icon = fieldIcon(row.key);

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

  const label = (
    <View style={styles.rowLabelGroup}>
      {Icon ? <Icon size={theme.sizing.iconXs} color={theme.colors.textTertiary} /> : null}
      <Text variant="body" color="textSecondary" style={styles.rowLabel}>
        {row.label}
      </Text>
    </View>
  );

  if (row.stacked) {
    return (
      <View style={styles.stackedRow}>
        {label}
        {body}
      </View>
    );
  }

  return (
    <View style={styles.row}>
      {label}
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
      contentContainerStyle={styles.scrollContent}
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

      <View style={[styles.block, styles.identity]}>
        <Text variant="overline" color="textTertiary">
          {profileTypeLabel}
        </Text>
        <Text variant="h2" numberOfLines={2}>
          {profile.businessName}
        </Text>
        {ownerName ? (
          <View style={styles.ownerRow}>
            <User size={theme.sizing.iconSm} color={theme.colors.textSecondary} />
            <Text variant="body" color="textSecondary">
              {ownerName}
            </Text>
          </View>
        ) : null}
      </View>

      {profile.status === 'APPROVED' ? (
        <View
          style={[
            styles.verifiedBanner,
            {
              backgroundColor: withAlpha(toneColor, theme.opacity.faint),
              borderColor: withAlpha(toneColor, theme.opacity.subtle),
            },
          ]}
        >
          <BadgeCheck size={theme.sizing.iconMd} color={toneColor} />
          <Text variant="bodyMedium" style={{ color: toneColor }}>
            {t('businessProfile.verifiedBadge')}
          </Text>
        </View>
      ) : null}

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
        <View style={styles.sectionCard}>
          <View style={styles.sectionLegend}>
            <Text variant="overline" color="textSecondary">
              {t('businessProfile.description').toUpperCase()}
            </Text>
          </View>
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
        <View key={section.key} style={styles.sectionCard}>
          <View style={styles.sectionLegend}>
            <Text variant="overline" color="textSecondary">
              {section.title}
            </Text>
          </View>
          {section.rows.map((row, position) => (
            <Fragment key={row.key}>
              {position > 0 ? <Divider /> : null}
              <FieldRow row={row} yesLabel={t('common.yes')} noLabel={t('common.no')} />
            </Fragment>
          ))}
        </View>
      ))}

      {model.address ? (
        <View style={styles.sectionCard}>
          <View style={styles.sectionLegend}>
            <Text variant="overline" color="textSecondary">
              {t('businessProfile.businessAddress').toUpperCase()}
            </Text>
          </View>
          <View style={styles.titleRow}>
            <View style={[styles.addressIcon, { backgroundColor: toneColor }]}>
              <MapPin size={theme.sizing.iconSm} color={theme.colors.onPrimary} />
            </View>
            <View style={styles.addressLines}>
              {model.address.lines.map((line, position) => (
                <Text key={`address-${position}`} variant="body">
                  {line}
                </Text>
              ))}
            </View>
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
      ) : null}
    </ScrollView>
  );
}
