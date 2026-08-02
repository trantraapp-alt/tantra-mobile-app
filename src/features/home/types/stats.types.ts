// Public marketplace stats shown in the home trust bar (GET /stats/public).
export interface PublicStats {
  // Number of sellers on the platform.
  sellerCount: number;
  // Number of districts with activity.
  districtCount: number;
  // Total value traded (₹).
  totalTradeValue: number;
  // Satisfaction percentage (0–100).
  satisfiedPct: number;
}
