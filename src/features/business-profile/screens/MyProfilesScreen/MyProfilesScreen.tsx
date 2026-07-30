// My Business Profiles: the owner's list of profiles with status chips,
// per-status actions, overflow menu, and delete confirmation.
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Plus, Store, Trash2 } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, View } from 'react-native';

import { Fab } from '@/components/buttons';
import { EmptyState, ErrorState } from '@/components/empty-state';
import { Spinner } from '@/components/loaders';
import { Header } from '@/components/shared';
import {
  ActionSheet,
  type ActionSheetAction,
  type ActionSheetRef,
  Screen,
} from '@/components/ui';
import { routes } from '@/constants';
import { useThemedStyles, useTranslation } from '@/hooks';
import { logger } from '@/lib';
import { useToast } from '@/providers';

import { businessProfileApi } from '../../api/businessProfileApi';
import { BusinessProfileCard } from '../../components/BusinessProfileCard';
import { useMyProfiles } from '../../hooks/useMyProfiles';
import type { BusinessProfile, ProfileTypeOption } from '../../types/businessProfile.types';
import { createMyProfilesScreenStyles } from './MyProfilesScreen.styles';

export function MyProfilesScreen() {
  const styles = useThemedStyles(createMyProfilesScreenStyles);
  const router = useRouter();
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();

  const [active, setActive] = useState<BusinessProfile | null>(null);
  const [profileTypes, setProfileTypes] = useState<ProfileTypeOption[]>([]);
  const actionSheetRef = useRef<ActionSheetRef>(null);

  // Fetch profile types once for label mapping
  useEffect(() => {
    businessProfileApi
      .getProfileTypes()
      .then(setProfileTypes)
      .catch(() => {
        /* fallback: use keys as labels */
      });
  }, []);

  const {
    profiles,
    isLoading,
    isLoadingMore,
    isRefreshing,
    isError,
    isEmpty,
    loadMore,
    refresh,
    patchLocal,
    removeLocal,
  } = useMyProfiles();

  const goToCreate = useCallback(() => {
    router.push(routes.businessProfile.create);
  }, [router]);

  const goToEdit = useCallback(
    (profile: BusinessProfile) => {
      router.push(routes.businessProfile.edit(profile.profileId));
    },
    [router],
  );

  const goToDetail = useCallback(
    (profile: BusinessProfile) => {
      router.push(routes.businessProfile.detail(profile.profileId));
    },
    [router],
  );

  const openMenu = useCallback((profile: BusinessProfile) => {
    setActive(profile);
    actionSheetRef.current?.present();
  }, []);

  const toggleVisibility = useCallback(
    async (profile: BusinessProfile) => {
      try {
        const next = !profile.isVisible;
        await businessProfileApi.update(profile.profileId, {
          profileType: profile.profileType,
          businessName: profile.businessName,
          isVisible: next,
          address: profile.address,
          attributes: profile.attributes,
        });
        patchLocal(profile.profileId, { isVisible: next });
      } catch (error) {
        logger.warn('[BusinessProfile] Toggle visibility failed', error);
        showError(t('businessProfile.submitError'));
      }
    },
    [patchLocal, showError, t],
  );

  const performDelete = useCallback(
    async (profile: BusinessProfile) => {
      try {
        await businessProfileApi.remove(profile.profileId);
        removeLocal(profile.profileId);
        showSuccess(t('businessProfile.deleteSuccess'));
      } catch (error) {
        logger.warn('[BusinessProfile] Delete failed', error);
        showError(t('businessProfile.deleteError'));
      }
    },
    [removeLocal, showSuccess, showError, t],
  );

  const confirmDelete = useCallback(
    (profile: BusinessProfile) => {
      Alert.alert(
        t('businessProfile.deleteTitle'),
        t('businessProfile.deleteMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('businessProfile.delete'),
            style: 'destructive',
            onPress: () => void performDelete(profile),
          },
        ],
      );
    },
    [t, performDelete],
  );

  const menuActions = useMemo<ActionSheetAction[]>(() => {
    if (!active) {
      return [];
    }
    const actions: ActionSheetAction[] = [];
    if (active.status !== 'BLOCKED') {
      actions.push({
        key: 'edit',
        label:
          active.status === 'REJECTED'
            ? t('businessProfile.editResubmit')
            : t('businessProfile.editProfile'),
        icon: Store,
        onPress: () => goToEdit(active),
      });
    }
    actions.push({
      key: 'delete',
      label: t('businessProfile.delete'),
      icon: Trash2,
      destructive: true,
      onPress: () => confirmDelete(active),
    });
    return actions;
  }, [active, t, goToEdit, confirmDelete]);

  const renderItem = useCallback(
    ({ item }: { item: BusinessProfile }) => (
      <BusinessProfileCard
        profile={item}
        profileTypes={profileTypes}
        onPress={() => goToDetail(item)}
        onEdit={() => goToEdit(item)}
        onToggleVisibility={() => void toggleVisibility(item)}
        onMenu={() => openMenu(item)}
      />
    ),
    [profileTypes, goToDetail, goToEdit, toggleVisibility, openMenu],
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
          <ErrorState onRetry={refresh} retryLabel={t('common.retry')} />
        </View>
      );
    }
    if (isEmpty) {
      return (
        <EmptyState
          icon={Store}
          title={t('businessProfile.emptyTitle')}
          description={t('businessProfile.emptyDesc')}
          actionLabel={t('businessProfile.createFirst')}
          onAction={goToCreate}
        />
       
      );
    }
    return (
      <FlashList
        data={profiles}
        keyExtractor={(item) => item.profileId}
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
    );
  };

  return (
    <Screen padded={false}>
      <Header
        title={t('businessProfile.myProfiles')}
        showBack
        onBack={() => router.back()}
      />
      {renderBody()}

      {/* Primary create action, pinned to the bottom-right. Shown in every
          state except the initial loading spinner — including the empty and
          error states — so it is always reachable. */}
      {!isLoading ? (
        <Fab
          icon={Plus}
          onPress={goToCreate}
          accessibilityLabel={t('businessProfile.create')}
        />
      ) : null}

      <ActionSheet
        ref={actionSheetRef}
        title={active?.businessName}
        actions={menuActions}
        cancelLabel={t('common.cancel')}
      />
    </Screen>
  );
}
