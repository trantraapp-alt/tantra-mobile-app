// Public marketplace stats shown in the home trust bar (GET /stats/public).
// The backend returns a dynamic, admin-managed array of tiles — pre-formatted
// values, bilingual labels and a sort order — so the bar loops over whatever it
// receives rather than assuming a fixed set.
export interface PublicStat {
  // Machine key — used to pick the display icon, never shown to the user.
  statKey: string;
  // English label (shown when the app language is EN).
  labelEn: string;
  // Hindi label (shown when the app language is HI).
  labelHi: string;
  // Backend placeholder icon text (e.g. "AL") — ignored; we map statKey to our
  // own icon instead.
  icon?: string;
  // Pre-formatted display value; render as-is (e.g. "74").
  value: string;
  // Ascending sort order for the tiles.
  displayOrder: number;
}
