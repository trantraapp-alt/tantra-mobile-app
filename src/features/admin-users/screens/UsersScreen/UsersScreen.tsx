// Admin-only Users tab: a search bar with a filter icon that opens a bottom
// sheet (account status + subscription), over a paginated list of app users.
// Tapping a row opens the full user detail screen. Block/unblock, subscription
// grants and the per-user listings view land once those screens are built.
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { SlidersHorizontal, Users as UsersIcon } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';

import { IconButton } from '@/components/buttons';
import { EmptyState, ErrorState } from '@/components/empty-state';
import { SearchBar } from '@/components/inputs';
import { Spinner } from '@/components/loaders';
import { Header } from '@/components/shared';
import { type BottomSheetRef, Screen, Text } from '@/components/ui';
import { routes } from '@/constants';
import { useDebouncedValue, useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';
import { commonStyles } from '@/utils';

import { AdminUserCard } from '../../components/AdminUserCard';
import { UsersFilterSheet, type UsersFilterValue } from '../../components/UsersFilterSheet';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import type { AdminUserSummary } from '../../types/adminUser.types';
import { activeFilterCount, hasSubParam, isBlockedParam } from '../../utils/userFilters';
import { createUsersScreenStyles } from './UsersScreen.styles';

const DEFAULT_FILTERS: UsersFilterValue = { status: 'ALL', sub: 'ALL' };

// Renders the admin's Users tab.
export function UsersScreen() {
  const styles = useThemedStyles(createUsersScreenStyles);
  const theme = useTheme();
  const router = useRouter();
  const filterSheetRef = useRef<BottomSheetRef>(null);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 350);
  const [filters, setFilters] = useState<UsersFilterValue>(DEFAULT_FILTERS);
  const filterCount = activeFilterCount(filters.status, filters.sub);

  const {
    users,
    totalElements,
    isLoading,
    isLoadingMore,
    isRefreshing,
    isError,
    isEmpty,
    loadMore,
    refresh,
  } = useAdminUsers({
    search,
    isBlocked: isBlockedParam(filters.status),
    hasSub: hasSubParam(filters.sub),
  });

  const openDetail = useCallback(
    (user: AdminUserSummary) => {
      router.push({
        pathname: routes.admin.userDetail(user.userId),
        params: { user: JSON.stringify(user) },
      });
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: AdminUserSummary }) => (
      <AdminUserCard user={item} onPress={() => openDetail(item)} />
    ),
    [openDetail],
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
          <ErrorState onRetry={refresh} retryLabel="Retry" />
        </View>
      );
    }
    if (isEmpty) {
      return (
        <EmptyState
          icon={UsersIcon}
          title="No users found"
          description="Try a different search term or clear your filters."
        />
      );
    }
    return (
      <View style={commonStyles.flexOne}>
        <FlashList
          data={users}
          keyExtractor={(item) => item.userId}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
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
      <Header title="Users" />

      <View style={styles.searchRow}>
        <View style={styles.searchField}>
          <SearchBar
            value={searchInput}
            onChangeText={setSearchInput}
            onClear={() => setSearchInput('')}
            placeholder="Search name or mobile number"
          />
        </View>
        <View>
          <IconButton
            icon={SlidersHorizontal}
            accessibilityLabel="Filters"
            onPress={() => filterSheetRef.current?.present()}
            style={styles.filterButton}
            color={theme.colors.primary}
          />
          {filterCount > 0 ? (
            <View style={styles.filterDot} pointerEvents="none" />
          ) : null}
        </View>
      </View>

      {!isLoading && !isError ? (
        <Text variant="caption" color="textSecondary" style={styles.resultCount}>
          {totalElements} user{totalElements === 1 ? '' : 's'}
        </Text>
      ) : null}

      {renderBody()}

      <UsersFilterSheet ref={filterSheetRef} value={filters} onApply={setFilters} />
    </Screen>
  );
}
