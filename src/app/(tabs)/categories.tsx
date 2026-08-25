// Route binding for the admin-only Categories tab. Named "categories"
// (plural) rather than "category" to avoid colliding with the existing
// top-level `/category/[id]` detail route.
import { CategoriesScreen } from '@/features/categories';

// Renders the categories screen at /(tabs)/categories.
export default function CategoriesTabRoute() {
  return <CategoriesScreen />;
}
