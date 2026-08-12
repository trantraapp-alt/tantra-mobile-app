// Buyer-facing listing detail: maps the listing onto the shared ListingDetailView
// (gallery, hero card, description, spec rows, seller card, similar rail) over a
// sticky contact CTA that runs the OLX-style contact reveal.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Eye, FileText, Info, Package, Store, Users } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/buttons';
import { ErrorState } from '@/components/empty-state';
import { Spinner } from '@/components/loaders';
import { Header } from '@/components/shared';
import { Badge, type BadgeTone, Screen, Text } from '@/components/ui';
import { fileUrl } from '@/config';
import { routes } from '@/constants';
import type { FeedListing } from '@/features/home';
import {
  feedDescription,
  feedLocationLabel,
  listingAttributeEntries,
  resolveFeedTitle,
} from '@/features/home/utils/feedListing';
import { useGoBack, useThemedStyles, useTranslation } from '@/hooks';
import { logger } from '@/lib';
import { useTheme, useToast } from '@/providers';

import { marketplaceApi } from '../../api';
import {
  ContactModal,
  type DetailSection,
  type DetailStat,
  type DetailTag,
  ListingDetailView,
  SimilarListings,
} from '../../components';
import { useListingDetail } from '../../hooks';
import type { ContactRevealResult } from '../../types';
import { createListingDetailStyles } from './ListingDetailScreen.styles';

// A short relative-time label from an ISO timestamp ('now' is a sentinel the
// caller localizes).
function relativeTime(iso: string | undefined): string {
  if (!iso) {
    return '';
  }
  const diffMs = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diffMs)) {
    return '';
  }
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) {
    return 'now';
  }
  if (hours < 24) {
    return `${hours}h`;
  }
  return `${Math.floor(hours / 24)}d`;
}

// Renders the buyer listing-detail screen.
export function MarketplaceListingDetailScreen() {
  const theme = useTheme();
  const styles = useThemedStyles(createListingDetailStyles);
  const { t, language } = useTranslation();
  const router = useRouter();
  const goBack = useGoBack();
  const { showError } = useToast();
  const params = useLocalSearchParams<{ id?: string }>();
  const listingId = params.id?.trim() ?? '';

  const { listing, similar, isLoading, isError, reload } =
    useListingDetail(listingId);

  const [contact, setContact] = useState<ContactRevealResult | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [revealing, setRevealing] = useState(false);

  const heroImages = useMemo(
    () =>
      (listing?.images ?? [])
        .filter((s): s is string => typeof s === 'string' && s.trim() !== '')
        .map((s) => fileUrl(s)),
    [listing],
  );

  const openListing = useCallback(
    (item: FeedListing) => {
      const id = item.listingId ? String(item.listingId) : '';
      if (id) {
        router.push(routes.marketListing(id));
      }
    },
    [router],
  );

  const onViewContact = useCallback(async () => {
    if (!listingId) {
      return;
    }
    setRevealing(true);
    try {
      const res = await marketplaceApi.revealContact(listingId);
      setContact(res);
      setModalVisible(true);
    } catch (error) {
      logger.warn('[Contact] reveal failed', error);
      showError(t('contact.error'));
    } finally {
      setRevealing(false);
    }
  }, [listingId, showError, t]);

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.center}>
          <Spinner />
        </View>
      );
    }
    if (isError || !listing) {
      return (
        <View style={styles.center}>
          <ErrorState onRetry={reload} retryLabel={t('common.retry')} />
        </View>
      );
    }

    const title =
      listing.listingTitle?.trim() ||
      resolveFeedTitle(listing, language, t('home.listingFallback'));
    // Full address on the detail page (the card only shows distance now).
    const addressParts = listing.address
      ? [
          listing.address.village,
          listing.address.district,
          listing.address.state,
          listing.address.pincode,
        ]
          .map((part) => (part ?? '').trim())
          .filter(Boolean)
      : [];
    const locality =
      addressParts.join(', ') || feedLocationLabel(listing.address);
    const agoRaw = relativeTime(listing.createdAt);
    const ago = agoRaw === 'now' ? t('detail.justNow') : agoRaw;
    const type = String(listing.listingType ?? '').toUpperCase();
    const typeTone: BadgeTone = type === 'RENT' ? 'warning' : 'success';
    const typeLabel =
      type === 'RENT'
        ? t('market.type.rent')
        : type === 'SELL'
          ? t('market.type.sell')
          : type;
    const quantityLabel =
      listing.quantity != null
        ? `${listing.quantity} ${listing.unit ?? ''}`.trim()
        : '—';
    const description = feedDescription(listing);
    const attrs = listingAttributeEntries(listing).slice(0, 12);
    const contactHidden = listing.showContact === false;

    const tags: DetailTag[] = [];
    if (type) {
      tags.push({ key: 'type', label: typeLabel, tone: typeTone });
    }
    if (listing.isNegotiable) {
      tags.push({
        key: 'negotiable',
        label: t('home.tagNegotiable'),
        tone: 'success',
      });
    }

    const stats: DetailStat[] = [
      {
        key: 'views',
        icon: Eye,
        text: `${listing.viewCount ?? 0} ${t('detail.views')}`,
      },
      {
        key: 'contacts',
        icon: Users,
        text: `${listing.contactRevealCount ?? 0} ${t('detail.contacts')}`,
      },
      { key: 'quantity', icon: Package, text: quantityLabel },
    ];

    const sections: DetailSection[] = [];
    if (description) {
      sections.push({
        key: 'description',
        title: t('detail.description'),
        icon: FileText,
        content: (
          <Text variant="body" color="textSecondary">
            {description}
          </Text>
        ),
      });
    }
    if (attrs.length > 0) {
      sections.push({
        key: 'details',
        title: t('detail.details'),
        icon: Info,
        rows: attrs.map((attr) => ({
          key: attr.key,
          label: attr.label,
          value: attr.value,
        })),
      });
    }
    sections.push({
      key: 'seller',
      title: t('detail.seller'),
      icon: Store,
      content: (
        <View style={styles.sellerCard}>
          <View style={styles.sellerAvatar}>
            <Store size={theme.sizing.iconMd} color={theme.colors.primary} />
          </View>
          <View style={styles.sellerInfo}>
            <Text variant="bodyMedium" numberOfLines={1}>
              {listing.sellerName?.trim() || t('detail.sellerFallback')}
            </Text>
            {listing.sellerPlanKey &&
            String(listing.sellerPlanKey).toUpperCase() !== 'BASIC' ? (
              <Badge tone="warning" label={String(listing.sellerPlanKey)} />
            ) : null}
          </View>
          {listing.userId ? (
            <Button
              variant="outline"
              size="sm"
              fullWidth={false}
              label={t('detail.viewSeller')}
              onPress={() =>
                router.push(
                  routes.seller(
                    String(listing.userId),
                    listing.sellerName ?? undefined,
                  ),
                )
              }
            />
          ) : null}
        </View>
      ),
    });

    return (
      <ListingDetailView
        images={heroImages}
        price={listing.offeredPrice}
        compareAtPrice={listing.actualPrice}
        discountPct={listing.discountPct}
        priceFallback={t('home.askPrice')}
        title={title}
        verified={listing.sellerVerified === true}
        tags={tags}
        locality={locality}
        timeAgo={ago}
        stats={stats}
        sections={sections}
        extras={
          <SimilarListings
            title={t('detail.similar')}
            listings={similar}
            onListingPress={openListing}
          />
        }
        footer={
          <Button
            label={contactHidden ? t('contact.hidden') : t('contact.view')}
            size="lg"
            loading={revealing}
            disabled={contactHidden}
            onPress={onViewContact}
          />
        }
      />
    );
  };

  return (
    <Screen padded={false}>
      <Header title={t('detail.title')} showBack onBack={goBack} />
      {renderBody()}
      <ContactModal
        visible={modalVisible}
        contact={contact}
        onClose={() => setModalVisible(false)}
      />
    </Screen>
  );
}
