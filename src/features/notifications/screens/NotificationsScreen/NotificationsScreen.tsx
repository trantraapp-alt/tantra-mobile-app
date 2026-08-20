// Notifications list: bilingual title/body rows, unread tint, tap-to-read, and
// deep-linking via refType/refId. "Mark all read" lives in the header.
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { BellOff } from 'lucide-react-native';
import { useCallback } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/buttons';
import { EmptyState, ErrorState } from '@/components/empty-state';
import { Spinner } from '@/components/loaders';
import { Header } from '@/components/shared';
import { Screen } from '@/components/ui';
import { routes } from '@/constants';
import { useGoBack, useThemedStyles, useTranslation } from '@/hooks';
import { commonStyles } from '@/utils';

import { NotificationRow } from '../../components';
import { useBusinessProfileNames, useNotifications } from '../../hooks';
import type { AppNotification } from '../../types';
import { createNotificationsStyles } from './NotificationsScreen.styles';

// Renders the notifications screen.
export function NotificationsScreen() {
  const styles = useThemedStyles(createNotificationsStyles);
  const router = useRouter();
  const goBack = useGoBack();
  const { t, language } = useTranslation();
  const {
    notifications,
    isLoading,
    isLoadingMore,
    isRefreshing,
    isError,
    isEmpty,
    loadMore,
    refresh,
    markRead,
    markAllRead,
  } = useNotifications();
  const profileNames = useBusinessProfileNames(notifications);

  // Marks read and deep-links to the referenced entity when known.
  const handlePress = useCallback(
    (notification: AppNotification) => {
      markRead(notification);
      const { refType, refId } = notification;
      if (refType === 'LISTING' && refId != null) {
        router.push(routes.listingDetail(String(refId)));
      } else if (refType === 'BUSINESS_PROFILE' && refId != null) {
        router.push(routes.businessProfile.detail(String(refId)));
      }
    },
    [markRead, router],
  );

  const renderItem = useCallback(
    ({ item }: { item: AppNotification }) => (
      <NotificationRow
        notification={item}
        language={language}
        profileName={
          item.refType === 'BUSINESS_PROFILE' && item.refId != null
            ? profileNames[String(item.refId)]
            : undefined
        }
        onPress={handlePress}
      />
    ),
    [language, handlePress, profileNames],
  );

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.center}>
          <Spinner />
        </View>
      );
    }
    if (isError) {
      return (
        <View style={styles.center}>
          <ErrorState
            description={t('notifications.loadError')}
            onRetry={refresh}
            retryLabel={t('common.retry')}
          />
        </View>
      );
    }
    if (isEmpty) {
      return (
        <EmptyState
          icon={BellOff}
          title={t('notifications.emptyTitle')}
          description={t('notifications.emptyDesc')}
        />
      );
    }
    // The flex wrapper bounds the list between the header and the bottom of the
    // screen, so FlashList scrolls internally instead of growing to its content
    // height and pushing its own tail out of reach.
    return (
      <View style={commonStyles.flexOne}>
        <FlashList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          refreshing={isRefreshing}
          onRefresh={refresh}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.footerLoader}>
                <Spinner />
              </View>
            ) : null
          }
        />
      </View>
    );
  };

  return (
    <Screen padded={false}>
      <Header
        title={t('common.notifications')}
        showBack
        onBack={goBack}
        rightAction={
          isEmpty ? undefined : (
            <Button
              label={t('notifications.markAllRead')}
              variant="ghost"
              size="sm"
              fullWidth={false}
              onPress={markAllRead}
            />
          )
        }
      />
      {renderBody()}
    </Screen>
  );
}
