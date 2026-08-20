// A single notification row: a type icon, an unread dot, bilingual title
// (with its refId appended) + body, and a relative timestamp. Unread rows are
// tinted.
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';
import type { PreferredLanguage } from '@/types';
import { formatRelativeTime } from '@/utils';

import type { AppNotification } from '../../types';
import {
  getNotificationVisual,
  localizedText,
  notificationDisplayTitle,
  withAlpha,
} from '../../utils/notificationDisplay';
import { createNotificationRowStyles } from './NotificationRow.styles';

// Props for the NotificationRow component.
export interface NotificationRowProps {
  // The notification to display.
  notification: AppNotification;
  // Active language for title/body.
  language: PreferredLanguage;
  // The referenced business profile's name, when known (resolved separately
  // since the notification's own title/body don't carry it — only an opaque
  // refId does). Shown as a small label above the title so a user with
  // several profiles can tell which one a notification is about.
  profileName?: string;
  // Called when the row is tapped.
  onPress: (notification: AppNotification) => void;
}

// Renders one notification row.
function NotificationRowComponent({
  notification,
  language,
  profileName,
  onPress,
}: NotificationRowProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createNotificationRowStyles);
  const rawTitle = localizedText(notification.title, language);
  const title = notificationDisplayTitle(rawTitle, notification.refId);
  const body = localizedText(notification.body, language);
  const unread = !notification.isRead;
  const { icon: Icon, tone } = getNotificationVisual(notification.type);
  const toneColor = theme.colors[tone];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[profileName, title].filter(Boolean).join(' — ')}
      onPress={() => onPress(notification)}
      style={[styles.row, unread ? styles.unread : null]}
    >
      {/* <View style={styles.dotColumn}>
        {unread ? <View style={styles.dot} /> : null}
      </View> */}
      <View style={[styles.iconWrap, { backgroundColor: withAlpha(toneColor, 0.16) }]}>
        <Icon size={theme.sizing.iconSm} color={toneColor} />
      </View>
      <View style={styles.body}>
        {profileName ? (
          <Text variant="label" color="primary" numberOfLines={1}>
            {profileName}
          </Text>
        ) : null}
        {title ? (
          <Text variant="bodyMedium" numberOfLines={2}>
            {title}
          </Text>
        ) : null}
        {body ? (
          <Text variant="caption" color="textSecondary" numberOfLines={3}>
            {body}
          </Text>
        ) : null}
        {notification.createdAt ? (
          <Text variant="overline" color="textTertiary" style={styles.time}>
            {formatRelativeTime(notification.createdAt)}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

// Memoized notification row.
export const NotificationRow = memo(NotificationRowComponent);
