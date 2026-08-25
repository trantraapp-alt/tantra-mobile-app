// Admin Home tab: a classic dashboard landing screen with one card per thing
// the admin moderates (Business Profile submissions, Users, Categories) —
// replacing the old behaviour of dropping the admin straight into the
// Business Profile tracker. Each card carries a live count where one is cheap
// to fetch, and drills into that area's own screen on tap.
import { useRouter } from 'expo-router';
import { Building2, LayoutGrid, Users as UsersIcon } from 'lucide-react-native';
import { useCallback } from 'react';
import { ScrollView, View } from 'react-native';

import { SectionHeader } from '@/components/shared';
import { Screen } from '@/components/ui';
import { routes } from '@/constants';
import { useAdminUsers } from '@/features/admin-users';
import { useAdminStats } from '@/features/business-profile';
import { useThemedStyles, useTranslation } from '@/hooks';

import { AdminDashboardCard, HomeHeader } from '../../components';
import { createAdminHomeStyles } from './AdminHomeScreen.styles';

// Renders the admin dashboard shown on the Home tab.
export function AdminHomeScreen() {
  const styles = useThemedStyles(createAdminHomeStyles);
  const router = useRouter();
  const { t } = useTranslation();
  // Both counts are already fetched cheaply elsewhere (page-1 metadata), so
  // pulling them here doubles as a fast preview of each screen's own data.
  const { stats } = useAdminStats();
  const { totalElements: totalUsers } = useAdminUsers();

  const openSearch = useCallback(() => {
    router.push(routes.search);
  }, [router]);

  const goToBusinessProfile = useCallback(() => {
    router.push(routes.admin.businessProfile);
  }, [router]);

  const goToUsers = useCallback(() => {
    router.push(routes.tabs.users);
  }, [router]);

  const goToCategories = useCallback(() => {
    router.push(routes.tabs.categories);
  }, [router]);

  const pendingCount = stats?.pending ?? 0;
  const businessProfileBadge =
    stats == null
      ? undefined
      : pendingCount > 0
        ? t('home.admin.businessProfilePending', { value: pendingCount })
        : t('home.admin.businessProfileAllClear');

  return (
    <Screen padded={false} edges={['bottom']}>
      <HomeHeader
        onSearchPress={openSearch}
        showSearch={false}
        showLocationBar={false}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader
          title={t('home.admin.sectionTitle')}
          subtitle={t('home.admin.sectionSubtitle')}
        />
        <View style={styles.cards}>
          <AdminDashboardCard
            icon={Building2}
            accent="primary"
            title={t('home.admin.businessProfileTitle')}
            description={t('home.admin.businessProfileDesc')}
            badgeLabel={businessProfileBadge}
            badgeTone={pendingCount > 0 ? 'warning' : 'success'}
            onPress={goToBusinessProfile}
          />
          <AdminDashboardCard
            icon={UsersIcon}
            accent="info"
            title={t('home.admin.usersTitle')}
            description={t('home.admin.usersDesc')}
            badgeLabel={
              totalUsers > 0
                ? t('home.admin.usersCount', { value: totalUsers })
                : undefined
            }
            onPress={goToUsers}
          />
          <AdminDashboardCard
            icon={LayoutGrid}
            accent="secondary"
            title={t('home.admin.categoriesTitle')}
            description={t('home.admin.categoriesDesc')}
            onPress={goToCategories}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
