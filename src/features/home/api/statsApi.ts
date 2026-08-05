// Repository for public marketplace stats (home trust bar).
import { endpoints } from '@/config';
import { apiClient } from '@/lib';

import type { PublicStat } from '../types';

// Fetches the public marketplace stat tiles. The response interceptor unwraps
// the standard `{ success, data }` envelope, so this resolves to the `data`
// array directly.
export function getPublicStats(): Promise<PublicStat[]> {
  return apiClient.get<PublicStat[]>(endpoints.stats.public);
}
