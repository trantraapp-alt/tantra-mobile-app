// One row in the admin User Control list: an avatar/status tile, name +
// mobile number, subscription + business-profile badges, and joined/last-seen
// dates. Tapping opens the full user detail screen.
import { Ban, Calendar, Clock, User } from 'lucide-react-native';
import { memo } from 'react';
import { View } from 'react-native';

import { Badge, Card, Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';
import { formatDate, formatRelativeTime } from '@/utils';

import type { AdminUserSummary } from '../../types/adminUser.types';
import {
  businessProfileTone,
  subscriptionTone,
  userDisplayName,
  userStatusTone,
} from '../../utils/adminUserDisplay';
import { createAdminUserCardStyles } from './AdminUserCard.styles';

// Props for the AdminUserCard component.
export interface AdminUserCardProps {
  user: AdminUserSummary;
  onPress?: () => void;
}

function AdminUserCardComponent({ user, onPress }: AdminUserCardProps) {
  const styles = useThemedStyles(createAdminUserCardStyles);
  const theme = useTheme();

  const blocked = user.status === 'BLOCKED';
  const statusTone = userStatusTone(user.status);
  const statusColor = theme.colors[statusTone];
  const name = userDisplayName(user) || user.mobileNumber;

  return (
    <Card style={styles.card} radius="lg" onPress={onPress}>
      <View style={styles.cornerBadge} pointerEvents="none">
        <Badge label={blocked ? 'Blocked' : 'Active'} tone={statusTone} />
      </View>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          {blocked ? (
            <Ban size={theme.sizing.iconLg} color={statusColor} />
          ) : (
            <User size={theme.sizing.iconLg} color={statusColor} />
          )}
        </View>

        <View style={styles.body}>
          <Text variant="h3" numberOfLines={1} style={styles.name}>
            {name}
          </Text>
          <Text variant="caption" color="textSecondary">
            {user.mobileNumber}
          </Text>

          <View style={styles.badgeRow}>
            <Badge label={user.subscriptionBadge} tone={subscriptionTone(user.subscriptionBadge)} />
            {user.businessProfileBadge !== 'NONE' ? (
              <Badge
                label={user.businessProfileBadge}
                tone={businessProfileTone(user.businessProfileBadge)}
              />
            ) : null}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Calendar size={theme.sizing.iconXs} color={theme.colors.textTertiary} />
              <Text variant="caption" color="textSecondary">
                Joined {formatDate(user.joinedAt)}
              </Text>
            </View>
            {user.lastLoginAt ? (
              <View style={styles.metaItem}>
                <Clock size={theme.sizing.iconXs} color={theme.colors.textTertiary} />
                <Text variant="caption" color="textSecondary">
                  Active {formatRelativeTime(user.lastLoginAt)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </Card>
  );
}

export const AdminUserCard = memo(AdminUserCardComponent);
