// Appends an alpha channel to a 6-digit hex theme color — React Native
// understands #RRGGBBAA natively. Duplicated (not imported) from the
// business-profile feature's own copy: a small pure color-math helper isn't
// worth a cross-feature import.
export function withAlpha(hex: string, alpha: number): string {
  const clamped = Math.max(0, Math.min(1, alpha));
  const channel = Math.round(clamped * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${channel}`;
}
