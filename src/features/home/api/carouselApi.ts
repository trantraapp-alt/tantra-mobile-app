// Repository for the DB-driven home carousel (public — no JWT needed).
import { endpoints } from '@/config';
import { apiClient } from '@/lib';

import type { CarouselItem } from '../types';

// Fetches the active carousel buttons (backend returns them display-ordered).
export function getCarousel(): Promise<CarouselItem[]> {
  return apiClient.get<CarouselItem[]>(endpoints.carousel);
}
