// Admin user detail: identity hero, activity stats, subscription, business
// profile and saved addresses. The list row is passed as a nav param so the
// identity paints instantly; the richer sections (activity/subscription/
// business profile/addresses) only exist on the full detail fetch, so they
// show their own small loading/retry state independently of the identity.
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Ban,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Globe,
  MapPin,
  Package,
  ShoppingBag,
  Store,
  User,
} from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { ErrorState } from '@/components/empty-state';
import { Skeleton } from '@/components/loaders';
import { Header } from '@/components/shared';
import { Badge, Card, Screen, Text } from '@/components/ui';
import { routes } from '@/constants';
// Direct submodule imports (not the feature barrel) — pulling in the whole
// business-profile barrel here would drag its screens/components along too.
import type { BusinessProfile } from '@/features/business-profile/types/businessProfile.types';
import { normalizeProfileStatus } from '@/features/business-profile/utils/profileStatus';
import { useGoBack, useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';
import { formatDate, formatRelativeTime } from '@/utils';

import { useAdminUserDetail } from '../../hooks/useAdminUserDetail';
import type {
  AdminUserBusinessProfileSummary,
  AdminUserSummary,
  SubscriptionBadge,
} from '../../types/adminUser.types';
import {
  businessProfileTone,
  subscriptionTone,
  userDisplayName,
  userStatusTone,
} from '../../utils/adminUserDisplay';
import { withAlpha } from '../../utils/withAlpha';
import { createUserDetailScreenStyles } from './UserDetailScreen.styles';

// Shimmer placeholder for a subscription/business-profile/address card: an
// icon circle, two text lines and a trailing badge-shaped block — the same
// shape every one of those cards actually renders.
function InfoCardSkeleton() {
  const theme = useTheme();
  const styles = useThemedStyles(createUserDetailScreenStyles);
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoHeader}>
        <Skeleton
          width={theme.sizing.avatarMd}
          height={theme.sizing.avatarMd}
          radius={theme.radius.md}
        />
        <View style={styles.infoHeaderText}>
          <Skeleton width="70%" height={16} />
          <Skeleton width="45%" height={12} />
        </View>
        <Skeleton width={64} height={22} radius={theme.radius.pill} />
      </View>
    </View>
  );
}

// Shimmer placeholder for the three activity stat tiles.
function ActivitySkeleton() {
  const theme = useTheme();
  const styles = useThemedStyles(createUserDetailScreenStyles);
  return (
    <View style={styles.statsRow}>
      {[0, 1, 2].map((key) => (
        <View key={key} style={styles.statItem}>
          <Skeleton
            width={theme.sizing.iconSm}
            height={theme.sizing.iconSm}
            radius={theme.radius.pill}
          />
          <Skeleton width={28} height={20} />
          <Skeleton width={40} height={10} />
        </View>
      ))}
    </View>
  );
}

// Full-page shimmer shown while there is truly nothing cached yet (a direct
// deep link, or a first paint before the list row's nav param resolves) — the
// identity hero plus all four sections, in the exact shapes they'll fill in.
function UserDetailSkeleton() {
  const theme = useTheme();
  const styles = useThemedStyles(createUserDetailScreenStyles);
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.heroCard}>
        <View style={styles.heroRow}>
          <Skeleton
            width={theme.sizing.avatarXl}
            height={theme.sizing.avatarXl}
            radius={theme.radius.pill}
          />
          <View style={styles.heroIdentity}>
            <Skeleton width="60%" height={22} />
            <Skeleton width="40%" height={14} />
            <View style={styles.tagsRow}>
              <Skeleton width={56} height={22} radius={theme.radius.pill} />
            </View>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Skeleton width={110} height={14} />
          <Skeleton width={90} height={14} />
        </View>
      </View>

      <View style={[styles.section, styles.sectionBordered]}>
        <Skeleton width={70} height={12} />
        <ActivitySkeleton />
      </View>
      <View style={[styles.section, styles.sectionBordered]}>
        <Skeleton width={100} height={12} />
        <InfoCardSkeleton />
      </View>
      <View style={[styles.section, styles.sectionBordered]}>
        <Skeleton width={130} height={12} />
        <InfoCardSkeleton />
      </View>
      <View style={[styles.section, styles.sectionBordered]}>
        <Skeleton width={90} height={12} />
        <InfoCardSkeleton />
      </View>
    </ScrollView>
  );
}

// Builds a minimal-but-valid BusinessProfile from the lean summary this
// screen has (profileId/businessName/profileType/verificationStatus — no
// photos, attributes or address). Passed as the review screen's `profile` nav
// param so it always has *something* to render (title, status, and working
// Approve/Reject/Block actions, which only need the id) even if that screen's
// own background fetch for the full record fails — instead of a blank page
// with no way to tell whether the id it was given was even valid.
function toReviewProfileSeed(bp: AdminUserBusinessProfileSummary): BusinessProfile {
  return {
    profileId: bp.profileId,
    profileType: bp.profileType,
    businessName: bp.businessName,
    isVisible: true,
    status: normalizeProfileStatus(bp.verificationStatus),
    rejectReason: null,
    blockReason: null,
    address: {},
    attributes: {},
    verificationStatus: bp.verificationStatus,
  };
}

export function UserDetailScreen() {
  const styles = useThemedStyles(createUserDetailScreenStyles);
  const theme = useTheme();
  const router = useRouter();
  const goBack = useGoBack();
  const { userId: userIdParam, user: userJson } = useLocalSearchParams<{
    userId: string;
    user?: string;
  }>();
  const userId = userIdParam ?? '';

  // The list row, passed via nav param — enough to paint identity instantly
  // while the full detail (activity/subscription/business profile/addresses)
  // loads in the background.
  const cachedSummary = useMemo<AdminUserSummary | null>(() => {
    if (!userJson) {
      return null;
    }
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }, [userJson]);

  const { detail, isLoading, isError, refetch } = useAdminUserDetail(userId);

  // Nothing at all to show yet — no cached row and the detail fetch hasn't
  // landed (or failed).
  if (!detail && !cachedSummary) {
    if (isLoading) {
      return (
        <Screen padded={false}>
          <Header title="User" showBack onBack={goBack} />
          <UserDetailSkeleton />
        </Screen>
      );
    }
    if (isError) {
      return (
        <Screen padded={false}>
          <Header title="User" showBack onBack={goBack} />
          <View style={styles.center}>
            <ErrorState onRetry={refetch} retryLabel="Retry" />
          </View>
        </Screen>
      );
    }
  }

  // Identity fields: prefer the authoritative detail once loaded, fall back
  // to the cached list row in the meantime.
  const status = detail?.status ?? cachedSummary?.status ?? 'ACTIVE';
  const blocked = status === 'BLOCKED';
  const statusTone = userStatusTone(status);
  const statusColor = theme.colors[statusTone];
  const source = detail ?? cachedSummary;
  const name = source ? userDisplayName(source) || source.mobileNumber : '';
  const mobileNumber = source?.mobileNumber ?? '';
  const joinedAt = detail?.joinedAt ?? cachedSummary?.joinedAt;
  const lastLoginAt = detail?.lastLoginAt ?? cachedSummary?.lastLoginAt;
  const isAdminRole = (detail?.appUsageRole ?? cachedSummary?.appUsageRole ?? '')
    .toUpperCase()
    .includes('ADMIN');

  // The extra sections only exist on the full detail record.
  const detailPending = !detail && isLoading;
  const detailFailed = !detail && isError;

  return (
    <Screen padded={false}>
      <Header title="User" showBack onBack={goBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: withAlpha(statusColor, theme.opacity.faint),
                  borderColor: withAlpha(statusColor, theme.opacity.subtle),
                },
              ]}
            >
              {blocked ? (
                <Ban size={theme.sizing.iconXl} color={statusColor} />
              ) : (
                <User size={theme.sizing.iconXl} color={statusColor} />
              )}
            </View>

            <View style={styles.heroIdentity}>
              <Text variant="h2" numberOfLines={1}>
                {name}
              </Text>
              <Text variant="body" color="textSecondary">
                {mobileNumber}
              </Text>
              <View style={styles.tagsRow}>
                <Badge label={blocked ? 'Blocked' : 'Active'} tone={statusTone} />
                {isAdminRole ? (
                  <Badge label="Admin" tone="primary" />
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.metaRow}>
            {joinedAt ? (
              <View style={styles.metaItem}>
                <Calendar size={theme.sizing.iconXs} color={theme.colors.textTertiary} />
                <Text variant="caption" color="textSecondary">
                  Joined {formatDate(joinedAt)}
                </Text>
              </View>
            ) : null}
            {lastLoginAt ? (
              <View style={styles.metaItem}>
                <Clock size={theme.sizing.iconXs} color={theme.colors.textTertiary} />
                <Text variant="caption" color="textSecondary">
                  Active {formatRelativeTime(lastLoginAt)}
                </Text>
              </View>
            ) : null}
            {detail?.preferredLanguage ? (
              <View style={styles.metaItem}>
                <Globe size={theme.sizing.iconXs} color={theme.colors.textTertiary} />
                <Text variant="caption" color="textSecondary">
                  {detail.preferredLanguage === 'HI' ? 'Hindi' : 'English'}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Blocked reason */}
        {blocked && detail?.blockedReason ? (
          <View
            style={[
              styles.reasonBox,
              {
                backgroundColor: withAlpha(theme.colors.danger, theme.opacity.faint),
                borderLeftColor: theme.colors.danger,
              },
            ]}
          >
            <Ban size={theme.sizing.iconSm} color={theme.colors.danger} />
            <View style={styles.reasonBoxText}>
              <Text variant="caption" color="textSecondary">
                Reason for block
                {detail.blockedAt ? ` · ${formatDate(detail.blockedAt)}` : ''}
              </Text>
              <Text variant="body">{detail.blockedReason}</Text>
            </View>
          </View>
        ) : null}

        {/* Activity */}
        <View style={[styles.section, styles.sectionBordered]}>
          <Text variant="overline" color="textSecondary" style={styles.sectionTitle}>
            Activity
          </Text>
          {detailPending ? (
            <ActivitySkeleton />
          ) : detailFailed ? (
            <ErrorState onRetry={refetch} retryLabel="Retry" />
          ) : detail ? (
            <>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Package size={theme.sizing.iconSm} color={theme.colors.primary} />
                  <Text variant="h4">{detail.activity.totalListings}</Text>
                  <Text variant="caption" color="textSecondary">
                    Total
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <CheckCircle2 size={theme.sizing.iconSm} color={theme.colors.success} />
                  <Text variant="h4">{detail.activity.activeListings}</Text>
                  <Text variant="caption" color="textSecondary">
                    Active
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <ShoppingBag size={theme.sizing.iconSm} color={theme.colors.textSecondary} />
                  <Text variant="h4">{detail.activity.soldListings}</Text>
                  <Text variant="caption" color="textSecondary">
                    Sold
                  </Text>
                </View>
              </View>
              {detail.activity.lastListingAt ? (
                <Text variant="caption" color="textTertiary" style={styles.lastListing}>
                  Last listing {formatRelativeTime(detail.activity.lastListingAt)}
                </Text>
              ) : null}
            </>
          ) : null}
        </View>

        {/* Subscription */}
        <View style={[styles.section, styles.sectionBordered]}>
          <Text variant="overline" color="textSecondary" style={styles.sectionTitle}>
            Subscription
          </Text>
          {detailPending ? (
            <InfoCardSkeleton />
          ) : detailFailed ? (
            <ErrorState onRetry={refetch} retryLabel="Retry" />
          ) : detail?.subscription ? (
            <Card style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <View style={styles.infoIcon}>
                  <CreditCard size={theme.sizing.iconMd} color={theme.colors.primary} />
                </View>
                <View style={styles.infoHeaderText}>
                  <Text variant="bodyMedium" numberOfLines={1}>
                    {detail.subscription.planName}
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    {formatDate(detail.subscription.startedAt)} –{' '}
                    {formatDate(detail.subscription.expiresAt)}
                  </Text>
                </View>
                <Badge
                  label={detail.subscription.status}
                  tone={subscriptionTone(detail.subscription.planKey as SubscriptionBadge)}
                />
              </View>
              {detail.subscription.grantedBy ? (
                <Text variant="caption" color="textTertiary" style={styles.grantedBy}>
                  Granted by {detail.subscription.grantedBy}
                </Text>
              ) : null}
            </Card>
          ) : (
            <Text variant="body" color="textSecondary">
              No active subscription
            </Text>
          )}
        </View>

        {/* Business profile */}
        <View style={[styles.section, styles.sectionBordered]}>
          <Text variant="overline" color="textSecondary" style={styles.sectionTitle}>
            Business Profile
          </Text>
          {detailPending ? (
            <InfoCardSkeleton />
          ) : detailFailed ? (
            <ErrorState onRetry={refetch} retryLabel="Retry" />
          ) : detail?.businessProfile ? (
            <Pressable
              onPress={() => {
                const bp = detail.businessProfile!;
                router.push({
                  pathname: routes.admin.businessProfileReview(bp.profileId),
                  params: { profile: JSON.stringify(toReviewProfileSeed(bp)) },
                });
              }}
            >
              <Card style={styles.infoCard}>
                <View style={styles.infoHeader}>
                  <View style={styles.infoIcon}>
                    <Store size={theme.sizing.iconMd} color={theme.colors.primary} />
                  </View>
                  <View style={styles.infoHeaderText}>
                    <Text variant="bodyMedium" numberOfLines={1}>
                      {detail.businessProfile.businessName}
                    </Text>
                    <Text variant="caption" color="textSecondary">
                      {detail.businessProfile.profileType.replace(/_/g, ' ')}
                    </Text>
                  </View>
                  <Badge
                    label={detail.businessProfile.verificationStatus}
                    tone={businessProfileTone(
                      detail.businessProfile.verificationStatus as
                        | 'NONE'
                        | 'PENDING'
                        | 'APPROVED'
                        | 'REJECTED',
                    )}
                  />
                  <ChevronRight size={theme.sizing.iconSm} color={theme.colors.textTertiary} />
                </View>
              </Card>
            </Pressable>
          ) : (
            <Text variant="body" color="textSecondary">
              No business profile
            </Text>
          )}
        </View>

        {/* Addresses */}
        <View style={[styles.section, styles.sectionBordered]}>
          <Text variant="overline" color="textSecondary" style={styles.sectionTitle}>
            Addresses
          </Text>
          {detailPending ? (
            <InfoCardSkeleton />
          ) : detailFailed ? (
            <ErrorState onRetry={refetch} retryLabel="Retry" />
          ) : detail && detail.addresses.length > 0 ? (
            <View style={styles.addressList}>
              {detail.addresses.map((address) => (
                <Card key={address.addressId} style={styles.infoCard}>
                  <View style={styles.infoHeader}>
                    <View style={styles.infoIcon}>
                      <MapPin size={theme.sizing.iconMd} color={theme.colors.primary} />
                    </View>
                    <View style={styles.infoHeaderText}>
                      <Text variant="bodyMedium" numberOfLines={1}>
                        {address.label || 'Address'}
                      </Text>
                      <Text variant="caption" color="textSecondary" numberOfLines={2}>
                        {[address.fullAddress, address.district, address.state]
                          .filter(Boolean)
                          .join(', ')}
                      </Text>
                    </View>
                    {address.isDefault ? <Badge label="Default" tone="primary" /> : null}
                  </View>
                </Card>
              ))}
            </View>
          ) : (
            <Text variant="body" color="textSecondary">
              No saved addresses
            </Text>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
