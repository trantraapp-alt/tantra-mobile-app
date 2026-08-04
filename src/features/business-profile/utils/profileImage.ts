// Resolves a profile's first uploaded photo to an absolute URL — shared by
// every card that shows a photo/status tile (owner's My Profiles card, admin's
// review list card), so they all pick the same photo the same way.
import { fileUrl } from '@/config';

export function firstImageUrl(
  attributes: Record<string, unknown> | undefined,
): string | undefined {
  if (!attributes) {
    return undefined;
  }
  const candidates = [attributes.photos, attributes.images, ...Object.values(attributes)];
  for (const list of candidates) {
    if (Array.isArray(list)) {
      const first = list.find((item) => typeof item === 'string' && item);
      if (typeof first === 'string') {
        return fileUrl(first);
      }
    }
  }
  return undefined;
}
