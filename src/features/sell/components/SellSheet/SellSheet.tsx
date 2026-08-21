// Bottom sheet listing the marketplace modules the user can sell in.
//
// This is the front door of the sell flow, so it carries more than the list.
// It names itself and offers a way out through its own header row (the shared
// sheet header centres a title, with nowhere to put a close button), it
// answers "is this safe?" once at the top, and it ends by offering help for
// the seller whom neither module obviously fits.
import { useRouter } from 'expo-router';
import { Leaf, Lightbulb, PackageX, X } from 'lucide-react-native';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/buttons';
import { EmptyState } from '@/components/empty-state';
import { Skeleton } from '@/components/loaders';
import { BottomSheet, type BottomSheetRef, Text } from '@/components/ui';
import { routes } from '@/constants';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';
import type { MarketplaceModule } from '@/types';

import { useModules } from '../../hooks';
import { getModuleName } from '../../utils';
import { SellOptionCard } from '../SellOptionCard';
import { SellSupportCard } from '../SellSupportCard';
import { SellTrustBanner } from '../SellTrustBanner';
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
  const insets = useSafeAreaInsets();
  // The shared sheet pads its content by the Android navigation inset only —
  // on iOS it deliberately keeps content close to the edge — so the closing
  // card would sit against the home indicator there. Give that inset back to
  // the last thing in the sheet.
  const footerInset = Platform.OS === 'ios' ? insets.bottom : 0;
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

  // Closes the sheet from its header button.
  const handleClose = useCallback(() => sheetRef.current?.dismiss(), []);

  // Help closes the sheet and hands the seller to the app's messaging surface.
  const handleHelp = useCallback(() => {
    sheetRef.current?.dismiss();
    router.push(routes.tabs.chat);
  }, [router]);

  return (
    <BottomSheet ref={sheetRef} scrollable>
      <View style={styles.header}>
        <View style={styles.brand}>
          <Leaf size={theme.sizing.iconMd} color={theme.colors.primary} />
        </View>

        <View style={styles.titles}>
          <Text variant="h3">{t('sell.title')}</Text>
          <Text variant="caption" color="textSecondary">
            {t('sell.subtitle')}
          </Text>
        </View>

        <IconButton
          icon={X}
          accessibilityLabel={t('common.close')}
          onPress={handleClose}
          style={styles.close}
        />
      </View>

      <SellTrustBanner />

      {isLoading ? (
        // Placeholders the size of a real card, so nothing shifts around when
        // the modules arrive.
        <View style={styles.grid}>
          {[0, 1].map((item) => (
            <View key={item} style={styles.placeholderSlot}>
              <Skeleton
                height={theme.sizing.productImageHeight + theme.spacing.huge}
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
        <View style={styles.grid}>
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

      <View style={{ paddingBottom: footerInset }}>
        <SellSupportCard
          variant="link"
          icon={Lightbulb}
          title={t('sell.helpTitle')}
          description={t('sell.helpDesc')}
          actionLabel={t('sell.helpAction')}
          onPress={handleHelp}
        />
      </View>
    </BottomSheet>
  );
});
