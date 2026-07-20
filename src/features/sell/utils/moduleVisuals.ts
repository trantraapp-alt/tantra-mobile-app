// Maps module keys to a representative icon and accent, since the modules API
// provides no image. Categories carry their own iconUrl and do not use this.
import {
  Briefcase,
  type LucideIcon,
  Sprout,
  Store,
} from 'lucide-react-native';

import type { ColorScheme } from '@/theme';

// Visual descriptor for a module card.
export interface ModuleVisual {
  // Icon rendered as the card image.
  icon: LucideIcon;
  // Theme color-scheme key used to tint the icon backdrop.
  accent: Extract<keyof ColorScheme, 'primary' | 'secondary' | 'success'>;
}

// Per-module-key visuals.
const MODULE_VISUALS: Record<string, ModuleVisual> = {
  MOD_AGRI: { icon: Sprout, accent: 'success' },
  MOD_SERVICE_PROVIDER: { icon: Briefcase, accent: 'secondary' },
};

// Returns the visual for a module key, falling back to a generic store icon.
export function getModuleVisual(moduleKey: string): ModuleVisual {
  return MODULE_VISUALS[moduleKey] ?? { icon: Store, accent: 'primary' };
}
