// Large tappable navigation card for the admin Home dashboard: an accent-tinted
// icon circle, a title + description, an optional trailing stat badge (e.g. a
// pending count) and a chevron. One card = one thing the admin manages.
import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { memo } from 'react';
import { View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';
import type { AccentName } from '@/theme';

import { createAdminDashboardCardStyles } from './AdminDashboardCard.styles';

// Props for the AdminDashboardCard.
export interface AdminDashboardCardProps {
  // Leading icon.
  icon: LucideIcon;
  // Accent family driving the icon circle's tint.
  accent: AccentName;
  // Card title.
  title: string;
  // Supporting one-line description.
  description: string;
  // Optional trailing stat (e.g. "12 pending"). Rendered in `badgeTone`.
  badgeLabel?: string;
  // Tone for `badgeLabel`. Defaults to the accent's own tone.
  badgeTone?: 'warning' | 'success' | 'danger' | 'textSecondary';
  // Navigates to the managed screen.
  onPress: () => void;
}

// Renders one admin dashboard navigation card.
function AdminDashboardCardComponent({
  icon: Icon,
  accent,
  title,
  description,
  badgeLabel,
  badgeTone = 'textSecondary',
  onPress,
}: AdminDashboardCardProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createAdminDashboardCardStyles);
  const palette = theme.accents[accent];

  return (
    <Card radius="lg" onPress={onPress} accessibilityLabel={title}>
      <View style={styles.row}>
        <View style={[styles.iconCircle, { backgroundColor: palette.soft }]}>
          <Icon size={theme.sizing.iconLg} color={palette.strong} />
        </View>
        <View style={styles.body}>
          <Text variant="h4" numberOfLines={1}>
            {title}
          </Text>
          <Text
            variant="caption"
            color="textSecondary"
            numberOfLines={2}
            style={styles.description}
          >
            {description}
          </Text>
        </View>
        <View style={styles.trailing}>
          {badgeLabel ? (
            <Text
              variant="label"
              color={badgeTone}
              numberOfLines={1}
              style={styles.badge}
            >
              {badgeLabel}
            </Text>
          ) : null}
          <ChevronRight
            size={theme.sizing.iconMd}
            color={theme.colors.textTertiary}
          />
        </View>
      </View>
    </Card>
  );
}

// Memoized admin dashboard card.
export const AdminDashboardCard = memo(AdminDashboardCardComponent);
