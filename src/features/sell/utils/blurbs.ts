// One-line descriptions for the sell flow's module and category cards.
//
// The masters API sends names and icons but no supporting copy, and the cards
// in the redesigned category screen are built around a name + blurb pair. So
// the blurbs live here as translation keys, resolved the same way the visual
// maps resolve icons: exact key first, then a keyword rule, then a generic
// fallback — a category the backend adds tomorrow still gets sensible copy.
import type { TranslationKey } from '@/i18n';

// The families the sell flow writes module copy for. A module needs two
// lines — the blurb under its name and the tag pill on its sheet card — and
// both follow from the same family, so a module key is resolved once and each
// line is then looked up from that one answer.
type ModuleFamily = 'agri' | 'livestock' | 'service' | 'fallback';

// Per-module-key families (exact-match fast path).
const MODULE_FAMILIES: Record<string, ModuleFamily> = {
  MOD_AGRI: 'agri',
  MOD_ANIMAL_LIVESTOCK: 'livestock',
  MOD_SERVICE_PROVIDER: 'service',
};

// Keyword rules so a renamed or differently-cased module key still resolves.
const MODULE_RULES: { match: RegExp; family: ModuleFamily }[] = [
  {
    match: /animal|livestock|poultry|fish|dairy|cattle|pashu/,
    family: 'livestock',
  },
  { match: /agri|crop|farm|krishi|kheti/, family: 'agri' },
  { match: /service|repair|maramat|seva|sevah/, family: 'service' },
];

// The line under a module's name: what the module is for.
const MODULE_BLURBS: Record<ModuleFamily, TranslationKey> = {
  agri: 'sell.moduleBlurb.agri',
  livestock: 'sell.moduleBlurb.livestock',
  service: 'sell.moduleBlurb.service',
  fallback: 'sell.moduleBlurb.fallback',
};

// The pill at the foot of a module's sheet card: what is inside the module.
const MODULE_TAGS: Record<ModuleFamily, TranslationKey> = {
  agri: 'sell.moduleTags.agri',
  livestock: 'sell.moduleTags.livestock',
  service: 'sell.moduleTags.service',
  fallback: 'sell.moduleTags.fallback',
};

// Per-category-key blurbs (exact-match fast path).
const CATEGORY_BLURBS: Record<string, TranslationKey> = {
  CAT_CROP: 'sell.categoryBlurb.crop',
  CAT_SEED: 'sell.categoryBlurb.seed',
  CAT_FERTILIZER: 'sell.categoryBlurb.fertilizer',
  CAT_PESTICIDE: 'sell.categoryBlurb.pesticide',
  CAT_EQUIPMENT: 'sell.categoryBlurb.equipment',
  CAT_POULTRY: 'sell.categoryBlurb.poultry',
  CAT_FISHERY: 'sell.categoryBlurb.fishery',
  CAT_ANIMAL: 'sell.categoryBlurb.animal',
};

// Keyword rules for categories (order matters: more specific groups first).
const CATEGORY_RULES: { match: RegExp; key: TranslationKey }[] = [
  { match: /vet|veterin|clinic|pashu-chikitsa/, key: 'sell.categoryBlurb.vet' },
  { match: /repair|mainten|maramat/, key: 'sell.categoryBlurb.repair' },
  { match: /service|labour|labor|seva|sevah/, key: 'sell.categoryBlurb.service' },
  { match: /market|bazaar|bazar|shop|store|dukan/, key: 'sell.categoryBlurb.market' },
  { match: /veget|sabzi|sabji/, key: 'sell.categoryBlurb.vegetable' },
  { match: /crop|wheat|grain|cereal/, key: 'sell.categoryBlurb.crop' },
  { match: /seed/, key: 'sell.categoryBlurb.seed' },
  { match: /fertil/, key: 'sell.categoryBlurb.fertilizer' },
  { match: /equip|tractor|machine/, key: 'sell.categoryBlurb.equipment' },
  { match: /pestic|spray/, key: 'sell.categoryBlurb.pesticide' },
  { match: /poultry|hen|chicken/, key: 'sell.categoryBlurb.poultry' },
  { match: /fish/, key: 'sell.categoryBlurb.fishery' },
  { match: /animal|livestock|cattle|pashu/, key: 'sell.categoryBlurb.animal' },
];

// Resolves a module key to the family its copy is written for.
function getModuleFamily(moduleKey: string): ModuleFamily {
  const exact = MODULE_FAMILIES[moduleKey];
  if (exact) {
    return exact;
  }
  const key = moduleKey.toLowerCase();
  const rule = MODULE_RULES.find((entry) => entry.match.test(key));
  return rule?.family ?? 'fallback';
}

// Returns the blurb key describing what a module covers.
export function getModuleBlurbKey(moduleKey: string): TranslationKey {
  return MODULE_BLURBS[getModuleFamily(moduleKey)];
}

// Returns the key for the module's tag line ("Crops • Seeds • …").
export function getModuleTagsKey(moduleKey: string): TranslationKey {
  return MODULE_TAGS[getModuleFamily(moduleKey)];
}

// Returns the blurb key describing what a category holds.
export function getCategoryBlurbKey(categoryKey: string): TranslationKey {
  const exact = CATEGORY_BLURBS[categoryKey];
  if (exact) {
    return exact;
  }
  const key = categoryKey.toLowerCase();
  const rule = CATEGORY_RULES.find((entry) => entry.match.test(key));
  return rule?.key ?? 'sell.categoryBlurb.fallback';
}
