// Loads the DB-driven carousel buttons (cached for the session). Buttons rarely
// change, so the result is memoized at module scope.
import { useEffect, useState } from 'react';

import { logger } from '@/lib';

import { getCarousel } from '../api/carouselApi';
import type { CarouselItem } from '../types';

// Session cache of the loaded carousel.
let cache: CarouselItem[] | null = null;

// Fetches the carousel buttons (active only, display-ordered).
export function useCarousel(): CarouselItem[] {
  const [items, setItems] = useState<CarouselItem[]>(() => cache ?? []);

  useEffect(() => {
    if (cache) {
      return;
    }
    let active = true;
    getCarousel()
      .then((data) => {
        if (!active) {
          return;
        }
        const next = (data ?? [])
          .filter((item) => item.isActive)
          .sort((a, b) => a.displayOrder - b.displayOrder);
        cache = next;
        setItems(next);
      })
      .catch((error) => {
        logger.warn('[Carousel] Failed to load carousel', error);
      });
    return () => {
      active = false;
    };
  }, []);

  return items;
}
