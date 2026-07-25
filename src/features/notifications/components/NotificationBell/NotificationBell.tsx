// Header bell that shows the unread-notification count and opens the list.
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { View } from 'react-native';

import { IconButton } from '@/components/buttons';
import { Text } from '@/components/ui';
import { routes } from '@/constants';
import { useThemedStyles, useTranslation } from '@/hooks';

import { useUnreadCount } from '../../hooks';
import { createNotificationBellStyles } from './NotificationBell.styles';

// Renders the notifications bell with an unread badge.
export function NotificationBell() {
  const styles = useThemedStyles(createNotificationBellStyles);
  const { t } = useTranslation();
  const router = useRouter();
  const { count } = useUnreadCount();

  return (
    <View>
      <IconButton
        icon={Bell}
        filled
        accessibilityLabel={t('common.notifications')}
        onPress={() => router.push(routes.notifications)}
      />
      {count > 0 ? (
        <View style={styles.badge} pointerEvents="none">
          <Text variant="overline" color="onPrimary">
            {count > 99 ? '99+' : String(count)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
