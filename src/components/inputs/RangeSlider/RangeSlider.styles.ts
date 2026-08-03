import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Styles for the two-thumb RangeSlider (rail / selected rail / thumb visuals).
export const createRangeSliderStyles = (theme: AppTheme) =>
  StyleSheet.create({
    slider: {
      height: 40,
    },
    rail: {
      flex: 1,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.border,
    },
    railSelected: {
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.primary,
    },
    thumb: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: theme.colors.primary,
      borderWidth: 3,
      borderColor: theme.colors.surface,
    },
  });
