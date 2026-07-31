// Address book list: the user's saved addresses with add / edit / set-default /
// delete. The "Add" affordance is hidden once the 10-address limit is reached.
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect, useRouter } from 'expo-router';
import { MapPinOff, Plus, Trash2 } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/buttons';
import { EmptyState, ErrorState } from '@/components/empty-state';
import { ConfirmDialog } from '@/components/feedback';
import { Spinner } from '@/components/loaders';
import { Header } from '@/components/shared';
import { Screen } from '@/components/ui';
import { routes } from '@/constants';
import { localize } from '@/features/sell';
import { useThemedStyles, useTranslation } from '@/hooks';
import { logger } from '@/lib';
import { useTheme, useToast } from '@/providers';

import { addressesApi } from '../../api';
import { AddressCard } from '../../components';
import { useAddresses } from '../../hooks';
import type { SavedAddress } from '../../types';
import { createAddressListStyles } from './AddressListScreen.styles';

// Renders the saved-address list screen.
export function AddressListScreen() {
  const styles = useThemedStyles(createAddressListStyles);
  const theme = useTheme();
  const router = useRouter();
  const { t, language } = useTranslation();
  const { showSuccess, showError } = useToast();
  const {
    addresses,
    isLoading,
    isError,
    isEmpty,
    atLimit,
    refresh,
    removeLocal,
    setDefaultLocal,
  } = useAddresses();
  // Address pending delete-confirmation, and whether the delete is in flight.
  const [pendingDelete, setPendingDelete] = useState<SavedAddress | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Reload whenever the screen regains focus (e.g. after add / edit).
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const goToAdd = useCallback(() => {
    router.push(routes.addAddress);
  }, [router]);

  const goToEdit = useCallback(
    (address: SavedAddress) => {
      router.push(routes.editAddress(address.addressId));
    },
    [router],
  );

  const handleSetDefault = useCallback(
    async (address: SavedAddress) => {
      try {
        const res = await addressesApi.setDefault(address.addressId);
        // Update the default flag in place (no re-fetch) so the card the user
        // tapped keeps its position instead of jumping to the top of the list.
        setDefaultLocal(address.addressId);
        showSuccess(
          res.message
            ? localize(res.message, language)
            : t('address.defaultUpdated'),
        );
      } catch (error) {
        logger.warn('[Addresses] Set default failed', error);
        showError(t('address.defaultError'));
      }
    },
    [setDefaultLocal, showSuccess, showError, language, t],
  );

  const performDelete = useCallback(
    async (address: SavedAddress) => {
      try {
        const res = await addressesApi.remove(address.addressId);
        removeLocal(address.addressId);
        showSuccess(
          res.message
            ? localize(res.message, language)
            : t('address.deleteSuccess'),
        );
      } catch (error) {
        logger.warn('[Addresses] Delete failed', error);
        showError(t('address.deleteError'));
      }
    },
    [removeLocal, showSuccess, showError, language, t],
  );

  // Opens the delete-confirmation dialog for an address.
  const confirmDelete = useCallback((address: SavedAddress) => {
    setPendingDelete(address);
  }, []);

  // Runs the delete once confirmed, then closes the dialog.
  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDelete) {
      return;
    }
    setDeleting(true);
    await performDelete(pendingDelete);
    setDeleting(false);
    setPendingDelete(null);
  }, [pendingDelete, performDelete]);

  const renderItem = useCallback(
    ({ item }: { item: SavedAddress }) => (
      <View style={styles.cell}>
        <AddressCard
          address={item}
          onEdit={goToEdit}
          onSetDefault={handleSetDefault}
          onDelete={confirmDelete}
        />
      </View>
    ),
    [styles, goToEdit, handleSetDefault, confirmDelete],
  );

  const renderBody = () => {
    if (isLoading && addresses.length === 0) {
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
            description={t('address.loadError')}
            onRetry={refresh}
            retryLabel={t('common.retry')}
          />
        </View>
      );
    }
    if (isEmpty) {
      return (
        <EmptyState
          icon={MapPinOff}
          title={t('address.emptyTitle')}
          description={t('address.emptyDesc')}
          actionLabel={t('address.addNew')}
          onAction={goToAdd}
        />
      );
    }
    return (
      <View style={styles.listWrap}>
        <FlashList
          data={addresses}
          keyExtractor={(item) => item.addressId}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  return (
    <Screen padded={false}>
      <Header
        title={t('address.title')}
        showBack
        onBack={() => router.back()}
      />
      {renderBody()}
      {!isEmpty && !atLimit ? (
        <View style={styles.footer}>
          <Button
            label={t('address.addNew')}
            size="lg"
            leftIcon={
              <Plus size={theme.sizing.iconMd} color={theme.colors.onPrimary} />
            }
            onPress={goToAdd}
          />
        </View>
      ) : null}

      <ConfirmDialog
        visible={pendingDelete !== null}
        tone="danger"
        icon={Trash2}
        title={t('address.deleteTitle')}
        message={t('address.deleteMessage')}
        confirmLabel={t('address.delete')}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </Screen>
  );
}
