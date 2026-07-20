// Local image assets per category key.
//
// The category rail shows the Lucide fallback icon (see categoryVisuals.ts)
// until a real image is available. To switch a category from its icon to an
// image, drop the file into `src/assets/images/categories/` and add/uncomment
// its line below — nothing else needs to change; the rail picks it up
// automatically. Bundlers require the `require` path to be statically known, so
// each asset must be registered here explicitly rather than resolved by name.
import type { ImageSourcePropType } from 'react-native';

// Registered category images keyed by the backend `categoryKey`.
export const CATEGORY_IMAGE_SOURCES: Partial<
  Record<string, ImageSourcePropType>
> = {
  // CAT_CROP: require('../../../assets/images/categories/crop.png'),
  // CAT_EQUIPMENT: require('../../../assets/images/categories/equipment.png'),
  // CAT_POULTRY: require('../../../assets/images/categories/poultry.png'),
  // CAT_FISHERY: require('../../../assets/images/categories/fishery.png'),
  // CAT_SEED: require('../../../assets/images/categories/seed.png'),
  // CAT_FERTILIZER: require('../../../assets/images/categories/fertilizer.png'),
  // CAT_ANIMAL: require('../../../assets/images/categories/animal.png'),
  // CAT_PESTICIDE: require('../../../assets/images/categories/pesticide.png'),
};

// Returns the registered image for a category key, or undefined to use the icon.
export function getCategoryImageSource(
  categoryKey: string,
): ImageSourcePropType | undefined {
  return CATEGORY_IMAGE_SOURCES[categoryKey];
}
