// Fixed sizing tokens for icons, controls and common UI dimensions.
export const sizing = {
  // Icon sizes.
  iconXxs: 10,
  iconXs: 12,
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  iconXl: 32,
  iconXxl: 40,

  // Control heights.
  buttonHeightSm: 36,
  buttonHeightMd: 48,
  buttonHeightLg: 56,
  // Text field heights by size preset (md is the default).
  inputHeightXs: 40,
  inputHeightSm: 44,
  inputHeight: 52,
  inputHeightLg: 60,
  tabBarHeight: 60,
  headerHeight: 56,

  // Avatars.
  avatarSm: 32,
  avatarMd: 44,
  avatarLg: 64,
  avatarXl: 96,

  // Hit slop for touch targets.
  hitSlop: 8,

  // Common component dimensions.
  productCardWidth: 168,
  productImageHeight: 180,
  bannerHeight: 180,
  minTouchTarget: 44,
} as const;

export type Sizing = typeof sizing;
export type SizingKey = keyof Sizing;
