// Repository layer for the aggregated home feed. The `lang` query param is
// injected globally by the http client, so callers only pass the district.
import { endpoints } from '@/config';
import { apiClient } from '@/lib';

import type { HomeFeed } from '../types';

// Query parameters for the home feed.
export interface GetHomeFeedParams {
  // District to localize the feed to (e.g. "Pune"); omit for a nationwide feed.
  district?: string;
}

// Drops empty values so we never send `district=`.
function cleanParams(params: GetHomeFeedParams): Record<string, string> {
  const out: Record<string, string> = {};
  if (params.district && params.district.trim() !== '') {
    out.district = params.district.trim();
  }
  return out;
}

// Fetches the full home feed for the current district + language.
function getHomeFeed(params: GetHomeFeedParams = {}): Promise<HomeFeed> {
  return apiClient.get<HomeFeed>(endpoints.home.feed, {
    params: cleanParams(params),
  });
}

// Home feed repository.
export const homeApi = { getHomeFeed } as const;
