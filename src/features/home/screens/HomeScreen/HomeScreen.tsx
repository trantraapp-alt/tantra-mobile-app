// Home screen: a rich, Flipkart / OLX-style agri-marketplace feed matching the
// reference design, re-skinned to the app's theme. A fixed colored header sits
// above a scroll of: mandi ticker, module tabs, promo carousel, trust bar, dual
// banners, category grid, trending searches, flash deals, MSP + scheme banners,
// seller stories, and the API-driven featured / per-module / recent listings,
// closing on a brand footer. Curated marketing sections are app-owned (the feed
// API does not send them); listing sections come from `GET /api/v1/home`.
import { useRouter } from 'expo-router';
import { PackageSearch } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  InteractionManager,
  Linking,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';

import { EmptyState, ErrorState } from '@/components/empty-state';
import { SectionHeader } from '@/components/shared';
import { Screen, Text } from '@/components/ui';
import { routes } from '@/constants';
import { localize } from '@/features/sell';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';
import type { MarketplaceModule, ModuleCategory } from '@/types';

import {
  CategoryChips,
  CategoryGrid,
  DualBanners,
  FeaturedBusinessCard,
  FeedListingCard,
  FlashDeals,
  HomeHeader,
  ListingRow,
  MandiTicker,
  ModuleTabs,
  MspBanner,
  PromoCarousel,
  SchemeBanner,
  SellerStories,
  TrendingSearches,
  TrustBar,
} from '../../components';
import { buildPromoBanners, type PromoAction } from '../../data/promoCards';
import { useHomeFeed } from '../../hooks';
import type { FeaturedBusiness, FeedListing, PromoCard } from '../../types';
import { feedListingId } from '../../utils/feedListing';
import { createHomeStyles } from './HomeScreen.styles';

// Fixed width for a featured-business card in its horizontal rail.
const BUSINESS_CARD_WIDTH = 260;

// A "Rent …" promo (e.g. "Rent Tractor and Equipment") opens the browse
// pre-filtered to RENT so only rental listings show. Prefer an explicit
// listingType from the backend card; otherwise infer it from the title wording.
function resolvePromoListingType(card: PromoCard): string | undefined {
  const explicit = String(card.listingType ?? '').toUpperCase();
  if (explicit === 'RENT' || explicit === 'SELL') {
    return explicit;
  }
  const title = `${card.title?.en ?? ''} ${card.title?.hi ?? ''}`;
  return /rent|lease|किराए|किराया/i.test(title) ? 'RENT' : undefined;
}

// Placeholder shown during the first feed load.
function HomeSkeleton() {
  const styles = useThemedStyles(createHomeStyles);
  return (
    <View style={styles.skeleton}>
      <View style={[styles.skelBase, styles.skelBanner]} />
      <View style={styles.skelCircleRow}>
        {['a', 'b', 'c', 'd'].map((key) => (
          <View style={styles.skelCircleItem} key={key}>
            <View style={[styles.skelBase, styles.skelCircle]} />
            <View style={[styles.skelBase, styles.skelCircleLabel]} />
          </View>
        ))}
      </View>
      {['g1', 'g2'].map((group) => (
        <View style={styles.skelGroup} key={group}>
          <View style={[styles.skelBase, styles.skelHeader]} />
          <View style={styles.skelCardRow}>
            {['c1', 'c2'].map((card) => (
              <View style={[styles.skelBase, styles.skelCard]} key={card} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

// Defers `true` until interactions settle after `ready` becomes true, so the
// heavy below-the-fold listing sections mount a frame after the first paint
// rather than blocking it — noticeably smoother on low-end devices.
function useDeferredContent(ready: boolean): boolean {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!ready) {
      setShow(false);
      return;
    }
    const handle = InteractionManager.runAfterInteractions(() => setShow(true));
    return () => handle.cancel();
  }, [ready]);
  return show;
}

// Renders the home screen.
export function HomeScreen() {
  const theme = useTheme();
  const styles = useThemedStyles(createHomeStyles);
  const { t, language } = useTranslation();
  const router = useRouter();

  const { feed, isLoading, isRefreshing, isError, refresh } = useHomeFeed();
  // Theme-coloured home promo banners (crops / seeds / equipment).
  const promoBanners = useMemo(
    () => buildPromoBanners(theme.colors),
    [theme.colors],
  );
  // Gate the image-heavy listing sections until just after the first paint.
  const showBelowFold = useDeferredContent(
    !isLoading && !isError && feed !== null,
  );

  const openSearch = useCallback(() => {
    router.push(routes.search);
  }, [router]);

  const openListing = useCallback(
    (listing: FeedListing) => {
      const id = feedListingId(listing);
      if (id) {
        router.push(routes.marketListing(id));
      }
    },
    [router],
  );

  // Opens the module's listings (all users) in the search/browse screen, scoped
  // by moduleId, with the filter drawer available.
  const openModule = useCallback(
    (module: MarketplaceModule) => {
      const name =
        language === 'HI' ? module.moduleNameHi : module.moduleNameEn;
      router.push({
        pathname: routes.search,
        params: {
          filters: JSON.stringify({ moduleId: module.id }),
          title: name,
        },
      });
    },
    [router, language],
  );

  const openCategory = useCallback(
    (category: ModuleCategory) => {
      const name =
        language === 'HI' ? category.categoryNameHi : category.categoryNameEn;
      router.push(routes.browse(category.id, name));
    },
    [router, language],
  );

  const openBusiness = useCallback(
    (business: FeaturedBusiness) => {
      const userId = business.userId?.trim();
      if (userId) {
        router.push(routes.seller(userId, business.businessName));
      } else {
        openSearch();
      }
    },
    [router, openSearch],
  );

  // Runs an app-owned promo banner's navigation action.
  const runPromoAction = useCallback(
    (action: PromoAction) => {
      switch (action.type) {
        case 'nearby':
          router.push(routes.nearby);
          break;
        case 'external':
          void Linking.openURL(action.url);
          break;
        case 'sell': {
          const moduleId = feed?.modules?.[0]?.id;
          if (moduleId != null) {
            router.push(routes.sell(moduleId));
          } else {
            openSearch();
          }
          break;
        }
        case 'browse':
          router.push(
            routes.browseKey(action.key, action.name, action.listingType),
          );
          break;
        case 'search':
        default:
          openSearch();
          break;
      }
    },
    [router, openSearch, feed],
  );

  const openPromo = useCallback(
    (card: PromoCard) => {
      // App-owned fallback banner: run its predefined action.
      const local = promoBanners.find((p) => p.cardId === card.cardId);
      if (local) {
        runPromoAction(local.action);
        return;
      }
      // Backend-driven promo card: route by its own CTA (ctaType + ctaValue).
      const ctaType = String(card.ctaType ?? '').toUpperCase();
      const ctaValue = card.ctaValue?.trim();
      const name = localize(card.title, language);
      if (ctaValue) {
        // CATEGORY carries a category id (e.g. "4") or key (e.g. "crop"); both
        // resolve inside BrowseScreen via routes.browse.
        if (ctaType === 'CATEGORY' || ctaType === 'BROWSE_CATEGORY') {
          router.push(
            routes.browse(ctaValue, name, resolvePromoListingType(card)),
          );
          return;
        }
        // MODULE scopes the search/browse screen to a module id.
        if (ctaType === 'MODULE' || ctaType === 'BROWSE_MODULE') {
          router.push({
            pathname: routes.search,
            params: {
              filters: JSON.stringify({ moduleId: Number(ctaValue) }),
              title: name,
            },
          });
          return;
        }
        if (ctaType === 'EXTERNAL' || ctaType === 'EXTERNAL_URL') {
          void Linking.openURL(ctaValue);
          return;
        }
      }
      openSearch();
    },
    [promoBanners, runPromoAction, router, language, openSearch],
  );

  const onCategorySelect = useCallback(
    (_key: string) => {
      openSearch();
    },
    [openSearch],
  );

  const onTrending = useCallback(
    (_term: string) => {
      openSearch();
    },
    [openSearch],
  );

  const onSellerStory = useCallback(
    (_name: string) => {
      openSearch();
    },
    [openSearch],
  );

  // Chooses the feed body for the current data state.
  const renderBody = () => {
    if (isLoading) {
      return <HomeSkeleton />;
    }
    if (isError || !feed) {
      return (
        <View style={styles.center}>
          <ErrorState
            description={t('home.errorDesc')}
            onRetry={refresh}
            retryLabel={t('common.retry')}
          />
        </View>
      );
    }

    const featured = feed.featuredListings;
    const featuredTitle = featured?.title
      ? localize(featured.title, language)
      : t('home.featured.title');
    const promos = feed.promoCards.length > 0 ? feed.promoCards : promoBanners;
    const isEmpty =
      feed.modules.length === 0 &&
      (featured?.listings.length ?? 0) === 0 &&
      feed.moduleSections.length === 0 &&
      feed.featuredProfiles.length === 0 &&
      feed.recentListings.length === 0;

    return (
      <>
        {/* Live mandi (market price) ticker, pinned to the very top. */}
        <MandiTicker />

        {promos.length > 0 ? (
          <PromoCarousel cards={promos} onPress={openPromo} />
        ) : null}

        <DualBanners />
        <TrustBar />
        {featured && featured.listings.length > 0 ? (
          <ListingRow
            title={featuredTitle}
            listings={featured.listings}
            seeAllLabel={t('home.seeAll')}
            onSeeAll={openSearch}
            onListingPress={openListing}
          />
        ) : null}
        {/* Discovery: the two navs paired, then trust, then real inventory. */}
        <CategoryGrid onSelect={onCategorySelect} />

        {/* Value-add / marketing sections sit below the first real listings.
            DualBanners is now the backend-driven "Today's Deals" row. */}
        {feed.modules.length > 0 ? (
          <ModuleTabs modules={feed.modules} onModulePress={openModule} />
        ) : null}
        <FlashDeals onPressDeal={openSearch} />
        <TrendingSearches onSearch={onTrending} />
        <MspBanner />
        <SchemeBanner />
        <SellerStories onPress={onSellerStory} />

        {isEmpty ? (
          <View style={styles.center}>
            <EmptyState
              icon={PackageSearch}
              title={t('home.emptyTitle')}
              description={t('home.emptyDesc')}
            />
          </View>
        ) : null}

        {showBelowFold
          ? feed.moduleSections.map((section, sectionIndex) => {
              if (!section.module) {
                return null;
              }
              const moduleName =
                language === 'HI'
                  ? section.module.moduleNameHi
                  : section.module.moduleNameEn;
              const categories = section.topCategories ?? [];
              const listings = section.listings ?? [];
              if (categories.length === 0 && listings.length === 0) {
                return null;
              }
              return (
                <View
                  style={styles.section}
                  key={section.module.id ?? `section-${sectionIndex}`}
                >
                  <View style={styles.sectionHeaderWrap}>
                    <SectionHeader
                      title={moduleName}
                      actionLabel={t('home.seeAll')}
                      onActionPress={openSearch}
                    />
                  </View>
                  {categories.length > 0 ? (
                    <CategoryChips
                      categories={categories}
                      onCategoryPress={openCategory}
                    />
                  ) : null}
                  {listings.length > 0 ? (
                    <ListingRow
                      listings={listings}
                      onListingPress={openListing}
                    />
                  ) : null}
                </View>
              );
            })
          : null}

        {showBelowFold && feed.featuredProfiles.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeaderWrap}>
              <SectionHeader
                title={t('home.businessesTitle')}
                subtitle={t('home.businessesSubtitle')}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.businessRail}
            >
              {feed.featuredProfiles.map((business, index) => (
                <FeaturedBusinessCard
                  key={business.profileId || `business-${index}`}
                  business={business}
                  width={BUSINESS_CARD_WIDTH}
                  onPress={openBusiness}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        {showBelowFold && feed.recentListings.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeaderWrap}>
              <SectionHeader
                title={t('home.recentTitle')}
                subtitle={t('home.recentSubtitle')}
                actionLabel={t('home.seeAll')}
                onActionPress={openSearch}
              />
            </View>
            <View style={styles.grid}>
              {feed.recentListings.map((listing, index) => (
                <View
                  style={styles.gridCell}
                  key={feedListingId(listing) || `recent-${index}`}
                >
                  <FeedListingCard listing={listing} onPress={openListing} />
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.footerBrand}>
            <Text variant="h4" color="onPrimary">
              Tan
            </Text>
            <Text variant="h4" color="secondary">
              tra
            </Text>
          </View>
          <Text variant="caption" color="onPrimary" align="center">
            {t('home.footerTagline')}
          </Text>
          <Text variant="overline" color="onPrimary" align="center">
            {t('home.footerCopy')}
          </Text>
        </View>
      </>
    );
  };

  return (
    <Screen padded={false} edges={['bottom']}>
      <HomeHeader onSearchPress={openSearch} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {renderBody()}
      </ScrollView>
    </Screen>
  );
}
