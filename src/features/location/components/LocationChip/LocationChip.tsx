// Compact location chip for the home header. Shows the selected location (or a
// "Set location" prompt) and opens the LocationSheet on tap.
import { ChevronDown, MapPin } from 'lucide-react-native';
import { useRef } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';
import { useAppSelector } from '@/store/hooks';
import { selectSelectedLocation } from '@/store/selectors';

import { LocationSheet, type LocationSheetRef } from '../LocationSheet';
import { createLocationChipStyles } from './LocationChip.styles';

// Renders the home-header location chip.
export function LocationChip() {
  const theme = useTheme();
  const styles = useThemedStyles(createLocationChipStyles);
  const { t } = useTranslation();
  const selected = useAppSelector(selectSelectedLocation);
  const sheetRef = useRef<LocationSheetRef>(null);

  const label = selected?.label || t('location.setLocation');

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('location.change')}
        hitSlop={theme.sizing.hitSlop}
        onPress={() => sheetRef.current?.present()}
        style={styles.chip}
      >
        <MapPin size={theme.sizing.iconSm} color={theme.colors.primary} />
        <View style={styles.textWrap}>
          <Text variant="overline" color="textTertiary">
            {t('location.deliverTo')}
          </Text>
          <View style={styles.labelRow}>
            <Text variant="label" numberOfLines={1} style={styles.label}>
              {label}
            </Text>
            <ChevronDown
              size={theme.sizing.iconXs}
              color={theme.colors.textSecondary}
            />
          </View>
        </View>
      </Pressable>
      <LocationSheet ref={sheetRef} />
    </>
  );
}
