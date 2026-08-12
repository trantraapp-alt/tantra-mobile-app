// Shared, presentational listing-detail body used by BOTH the buyer detail and
// the seller's My-Listings preview, so the two look identical — only the props
// differ. It renders a full-bleed gallery, a hero card (price / title / tags /
// location / stats) and a stack of card "sections", then a sticky footer. Rows
// accept either plain text or a custom node (booleans, tag pills, warnings…), so
// no information from the richer owner model is lost.
import { BadgeCheck, Clock, type LucideIcon, MapPin } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import {
  Badge,
  type BadgeTone,
  ImageCarousel,
  PriceTag,
  Text,
} from '@/components/ui';
import { appConstants } from '@/constants';
import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';

import { createListingDetailViewStyles } from './ListingDetailView.styles';

// A row's value: plain text (rendered right-aligned) or a custom node.
export type DetailValue = string | ReactNode;

// One label/value row inside a section.
export interface DetailRow {
  key: string;
  label: string;
  value: DetailValue;
  // Full-width (label above value) — for long text / multi-value answers.
  stacked?: boolean;
}

// A card section: either a list of rows or a free-form content node. An optional
// icon renders beside the section heading.
export type DetailSection =
  | { key: string; title?: string; icon?: LucideIcon; rows: DetailRow[] }
  | { key: string; title?: string; icon?: LucideIcon; content: ReactNode };

// One engagement / meta stat in the hero card footer.
export interface DetailStat {
  key: string;
  icon: LucideIcon;
  text: string;
}

// One badge in the hero tag row.
export interface DetailTag {
  key: string;
  label: string;
  tone: BadgeTone;
}

// Props for the ListingDetailView component.
export interface ListingDetailViewProps {
  // Absolute image URIs for the gallery.
  images: string[];
  // Status badge overlaid on the gallery (owner preview).
  statusBadge?: ReactNode;
  // Small eyebrow above the price (e.g. "Crop · Sell").
  overline?: string;
  // Label above the price (e.g. "Asking price").
  priceLabel?: string;
  // Price + optional struck-through original + discount %.
  price?: number | null;
  compareAtPrice?: number | null;
  discountPct?: number | null;
  // Shown when there is no price.
  priceFallback?: string;
  // Listing title.
  title: string;
  // Shows a verified check beside the title.
  verified?: boolean;
  // Hero badges (type, negotiable…).
  tags?: DetailTag[];
  // Locality + relative time shown under the tags.
  locality?: string;
  timeAgo?: string;
  // Engagement / meta stats (views, contacts, quantity…).
  stats?: DetailStat[];
  // Card sections (description, specs, address, record…).
  sections?: DetailSection[];
  // Optional banner rendered between the hero card and sections (e.g. quality assured).
  qualityBanner?: ReactNode;
  // Full-bleed content after the sections (e.g. a similar-listings rail).
  extras?: ReactNode;
  // Sticky footer content (the primary action).
  footer?: ReactNode;
}

// Renders the shared listing-detail body + sticky footer.
export function ListingDetailView({
  images,
  statusBadge,
  overline,
  priceLabel,
  price,
  compareAtPrice,
  discountPct,
  priceFallback,
  title,
  verified,
  tags,
  locality,
  timeAgo,
  stats,
  sections,
  qualityBanner,
  extras,
  footer,
}: ListingDetailViewProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createListingDetailViewStyles);

  const discount =
    discountPct != null && discountPct > 0 ? Math.round(discountPct) : undefined;

  const renderRow = (row: DetailRow, index: number) => {
    const divider = index > 0 ? styles.rowDivider : null;
    const valueNode =
      typeof row.value === 'string' ? (
        <Text
          variant="label"
          color="textPrimary"
          numberOfLines={row.stacked ? undefined : 2}
          style={row.stacked ? undefined : styles.rowValueText}
        >
          {row.value}
        </Text>
      ) : (
        row.value
      );
    if (row.stacked) {
      return (
        <View key={row.key} style={[styles.stackedRow, divider]}>
          <Text variant="caption" color="textSecondary">
            {row.label}
          </Text>
          {valueNode}
        </View>
      );
    }
    return (
      <View key={row.key} style={[styles.row, divider]}>
        <Text variant="caption" color="textSecondary" style={styles.rowLabel}>
          {row.label}
        </Text>
        <View style={styles.rowValue}>{valueNode}</View>
      </View>
    );
  };

  return (
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <ImageCarousel images={images} aspectRatio={4 / 3} contentFit="cover" />
          {statusBadge ? (
            <View style={styles.heroBadge}>{statusBadge}</View>
          ) : null}
        </View>

        <View style={styles.card}>
          {overline ? (
            <Text variant="overline" color="textTertiary">
              {overline}
            </Text>
          ) : null}
          {priceLabel ? (
            <Text variant="overline" color="textTertiary">
              {priceLabel}
            </Text>
          ) : null}
          {price != null ? (
            <PriceTag
              size="lg"
              price={price}
              compareAtPrice={compareAtPrice ?? undefined}
              discountPercentage={discount}
              currency={appConstants.currencyCode}
            />
          ) : priceFallback ? (
            <Text variant="h3" color="textTertiary">
              {priceFallback}
            </Text>
          ) : null}

          <View style={styles.titleRow}>
            <Text variant="h3" numberOfLines={2} style={styles.title}>
              {title}
            </Text>
            {verified ? (
              <BadgeCheck size={theme.sizing.iconSm} color={theme.colors.info} />
            ) : null}
          </View>

          {tags && tags.length > 0 ? (
            <View style={styles.tagsRow}>
              {tags.map((tag) => (
                <Badge key={tag.key} tone={tag.tone} label={tag.label} />
              ))}
            </View>
          ) : null}

          {locality || timeAgo ? (
            <View style={styles.metaRow}>
              {locality ? (
                <View style={styles.metaItem}>
                  <MapPin
                    size={theme.sizing.iconXs}
                    color={theme.colors.danger}
                  />
                  <Text variant="caption" color="textSecondary">
                    {locality}
                  </Text>
                </View>
              ) : null}
              {timeAgo ? (
                <View style={styles.metaItem}>
                  <Clock
                    size={theme.sizing.iconXs}
                    color={theme.colors.textTertiary}
                  />
                  <Text variant="caption" color="textSecondary">
                    {timeAgo}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {stats && stats.length > 0 ? (
            <View style={styles.statsRow}>
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <View key={stat.key} style={styles.statItem}>
                    <Icon
                      size={theme.sizing.iconXs}
                      color={theme.colors.textTertiary}
                    />
                    <Text variant="caption" color="textSecondary">
                      {stat.text}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>

        {qualityBanner}

        {(sections ?? []).map((section) => {
          const SectionIcon = section.icon;
          return (
            <View key={section.key} style={styles.card}>
              {section.title ? (
                <View style={styles.sectionHead}>
                  {SectionIcon ? (
                    <SectionIcon
                      size={theme.sizing.iconSm}
                      color={theme.colors.textSecondary}
                    />
                  ) : null}
                  <Text
                    variant="overline"
                    color="textSecondary"
                    style={styles.sectionTitle}
                  >
                    {section.title}
                  </Text>
                </View>
              ) : null}
              {'rows' in section
                ? section.rows.map(renderRow)
                : section.content}
            </View>
          );
        })}

        {extras}
      </ScrollView>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}
