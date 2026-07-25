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
import { useThemedStyles, useTranslation } from '@/hooks';

import { NotificationRow } from '../../components';
import { useNotifications } from '../../hooks';
import type { AppNotification } from '../../types';
import { createNotificationsStyles } from './NotificationsScreen.styles';

// Renders the notifications screen.
export function NotificationsScreen() {
  const styles = useThemedStyles(createNotificationsStyles);
  const router = useRouter();
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

  // Marks read and deep-links to the referenced entity when known.
  const handlePress = useCallback(
    (notification: AppNotification) => {
      markRead(notification);
      const { refType, refId } = notification;
      if (refType === 'LISTING' && refId != null) {
        router.push(routes.listingDetail(String(refId)));
      }
    },
    [markRead, router],
  );

  const renderItem = useCallback(
    ({ item }: { item: AppNotification }) => (
      <NotificationRow
        notification={item}
        language={language}
        onPress={handlePress}
      />
    ),
    [language, handlePress],
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
    return (
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
    );
  };

  return (
    <Screen padded={false}>
      <Header
        title={t('common.notifications')}
        showBack
        onBack={() => router.back()}
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
