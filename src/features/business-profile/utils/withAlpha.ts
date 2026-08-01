// Appends an alpha channel to a 6-digit hex theme color — React Native
// understands #RRGGBBAA natively, so this gives tone-tinted washes (soft
// backgrounds behind a solid-colored icon/text) without inventing new theme
// tokens or pulling in a color-math dependency.
export function withAlpha(hex: string, alpha: number): string {
  const clamped = Math.max(0, Math.min(1, alpha));
  const channel = Math.round(clamped * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${channel}`;
}
