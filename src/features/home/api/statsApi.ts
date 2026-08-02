// Repository for public marketplace stats (home trust bar).
import { endpoints } from '@/config';
import { apiClient } from '@/lib';

import type { PublicStats } from '../types';

// Fetches the public marketplace stats.
export function getPublicStats(): Promise<PublicStats> {
  return apiClient.get<PublicStats>(endpoints.stats.public);
}
