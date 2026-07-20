// Reusable, theme-agnostic layout styles shared across the app.
import { StyleSheet } from 'react-native';

// Common layout primitives used to avoid repeated inline styles.
export const commonStyles = StyleSheet.create({
  // Fills the available space.
  flexOne: {
    flex: 1,
  },
  // Centers children on both axes.
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Fills and centers children on both axes.
  flexCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Horizontal row with vertically centered children.
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Row that spreads children to opposite ends.
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Absolutely fills the parent container.
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
});
