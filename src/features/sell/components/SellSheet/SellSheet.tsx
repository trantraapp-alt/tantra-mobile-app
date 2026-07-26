// Bottom sheet listing the marketplace modules the user can sell in.
import { useRouter } from 'expo-router';
import { PackageX } from 'lucide-react-native';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { Skeleton } from '@/components/loaders';
import { BottomSheet, type BottomSheetRef } from '@/components/ui';
import { routes } from '@/constants';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';
import type { MarketplaceModule } from '@/types';

import { useModules } from '../../hooks';
import { getModuleName } from '../../utils';
import { SellOptionCard } from '../SellOptionCard';
import { createSellSheetStyles } from './SellSheet.styles';

// Imperative handle exposed to open and close the sell sheet.
export type SellSheetRef = BottomSheetRef;

// Renders the sell module bottom sheet.
export const SellSheet = forwardRef<SellSheetRef>(function SellSheet(_, ref) {
  const theme = useTheme();
  const styles = useThemedStyles(createSellSheetStyles);
  const { t } = useTranslation();
  const router = useRouter();
  const sheetRef = useRef<BottomSheetRef>(null);
  const { modules, language, isLoading, isError, refetch } = useModules();

  useImperativeHandle(
    ref,
    () => ({
      present: () => sheetRef.current?.present(),
      dismiss: () => sheetRef.current?.dismiss(),
    }),
    [],
  );

  // Navigates to the selected module's category screen and closes the sheet.
  const handleSelect = useCallback(
    (module: MarketplaceModule) => {
      sheetRef.current?.dismiss();
      router.push({
        pathname: routes.sell(module.id),
        params: { title: getModuleName(module, language) },
      });
    },
    [router, language],
  );

  return (
    <BottomSheet ref={sheetRef} title={t('sell.title')} subtitle={t('sell.subtitle')}>
      {isLoading ? (
        <View style={styles.row}>
          {[0, 1, 2].map((item) => (
            <View key={item} style={styles.skeletonItem}>
              <Skeleton
                height={theme.sizing.avatarXl + theme.spacing.huge}
                radius={theme.radius.lg}
              />
            </View>
          ))}
        </View>
      ) : isError ? (
        <EmptyState
          icon={PackageX}
          title={t('sell.loadErrorTitle')}
          description={t('sell.loadErrorDesc')}
          actionLabel={t('common.retry')}
          onAction={refetch}
        />
      ) : modules.length === 0 ? (
        <EmptyState
          icon={PackageX}
          title={t('sell.emptyTitle')}
          description={t('sell.emptyDesc')}
        />
      ) : (
        <View style={styles.row}>
          {modules.map((module) => (
            <SellOptionCard
              key={module.id}
              module={module}
              language={language}
              onPress={handleSelect}
            />
          ))}
        </View>
      )}
    </BottomSheet>
  );
});
