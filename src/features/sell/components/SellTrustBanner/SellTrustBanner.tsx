// Reassurance line at the top of the Sell sheet: a shield and three words, in
// the brand accent.
//
// It sits above the module cards because the question a seller asks before
// "what do I list?" is "is this safe?". One line answers it — the sheet's job
// is to get the seller into a module, so anything longer here is a paragraph
// standing between them and the thing they came to tap.
import { ShieldCheck } from 'lucide-react-native';
import { memo } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';

import { getAccentColors } from '../../utils';
import { createSellTrustBannerStyles } from './SellTrustBanner.styles';

// Renders the sell sheet's trust badge.
function SellTrustBannerComponent() {
  const theme = useTheme();
  const styles = useThemedStyles(createSellTrustBannerStyles);
  const { t } = useTranslation();
  // Fixed to the brand accent: this speaks for Tantra, not for one module.
  const colors = getAccentColors(theme, 'primary');

  return (
    <View style={[styles.badge, { backgroundColor: colors.surface }]}>
      <ShieldCheck size={theme.sizing.iconSm} color={colors.strong} />
      <Text variant="caption" numberOfLines={1} style={{ color: colors.strong }}>
        {t('sell.trustTitle')}
      </Text>
    </View>
  );
}

// Memoized trust badge.
export const SellTrustBanner = memo(SellTrustBannerComponent);
