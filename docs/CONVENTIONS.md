# Tantra Mobile — Engineering Conventions

This is the approach the codebase already follows. Read it before writing your
first component. If you find code that disagrees with this document, the
document wins — fix the code or raise it.

Two rules carry most of the weight:

1. **Never hardcode a visual value.** Every color, space, radius, font size and
   duration comes from the theme.
2. **Never build what already exists.** Compose from the shared component
   library first; add to it second; duplicate never.

---

## 1. Project structure

Path alias: `@/*` → `src/*` (configured in `tsconfig.json`). Always import with
`@/...`, never with long `../../..` chains.

```
src/
  app/          expo-router routes ONLY — thin bindings, no logic
  components/   cross-feature, presentational, domain-free building blocks
  features/     one folder per business domain, self-contained
  theme/        design tokens (colors, spacing, typography, …)
  hooks/        global cross-feature hooks
  providers/    React context providers (theme, store, toast, fonts)
  store/        Redux Toolkit slices, selectors, typed hooks
  constants/    routes, app constants, storage keys, regex
  i18n/         EN / HI translation keys
  config/       environment + URL helpers
  lib/          logger, low-level utilities
  utils/        pure formatting/helpers (formatCurrency, commonStyles, …)
  types/        shared cross-feature types
```

### `src/app` is routing only

A route file binds a URL to a screen component and does nothing else. All logic
lives in the feature's screen.

```tsx
// src/app/browse/[categoryId].tsx
// Route binding for browsing a category's listings at /browse/[categoryId].
import { BrowseScreen } from '@/features/marketplace';

// Renders the browse-by-category screen.
export default function BrowseRoute() {
  return <BrowseScreen />;
}
```

Route paths are never written as string literals at call sites — they live in
`src/constants/app.constants.ts` under `routes`:

```tsx
router.push(routes.marketListing(id));   // ✅
router.push(`/listing/${id}`);           // ❌
```

### `src/features/<feature>` shape

Every feature is the same shape and exposes a **public API barrel**:

```
features/marketplace/
  api/         HTTP calls for this domain
  components/  components only this feature uses
  hooks/       data + state hooks for this feature
  screens/     one folder per screen
  types/       domain types
  utils/       pure helpers
  index.ts     public API — the ONLY entry point for other features
```

Import across features through the public barrel, never a deep path:

```ts
import { FilterSheet, type ListingFilters } from '@/features/marketplace';        // ✅
import { FilterSheet } from '@/features/marketplace/components/FilterSheet/…';    // ❌
```

---

## 2. Component-driven architecture

Three layers, each allowed to depend only on the layer below it:

| Layer | Location | Knows about the domain? | Example |
|---|---|---|---|
| **Screens** | `features/*/screens` | yes — fetches, routes, orchestrates | `BrowseScreen` |
| **Feature components** | `features/*/components` | yes — but no navigation/fetching | `FilterSheet`, `ListingResults` |
| **Primitives** | `src/components` | **no** — pure presentation | `Button`, `Card`, `Text`, `Screen` |

A primitive in `src/components` must never import from `@/features/*`. If you
reach for a feature type inside a primitive, it belongs in the feature instead.

### Every component is a folder of three files

```
components/ui/Card/
  Card.tsx         the component
  Card.styles.ts   the themed style factory
  index.ts         barrel export
```

```ts
// index.ts — Barrel export for the shared Card component.
export { Card, type CardProps } from './Card';
```

Then add it to the parent barrel (`components/ui/index.ts`) so it is reachable
as `@/components/ui`.

### Component rules

- Export a `Props` interface, and **comment every prop**. This is how the whole
  codebase documents itself.
- Wrap presentational components in `memo` when they render in a list or under a
  frequently re-rendering parent.
- Components opened imperatively (sheets, dialogs) use `forwardRef` +
  `useImperativeHandle` exposing `present()` / `dismiss()` — see `BottomSheet`.
- Keep the component pure: no `fetch`, no `router`, no store access in
  `src/components`. Pass data and callbacks in as props.

```tsx
// Props for the Badge component.
export interface BadgeProps {
  // Text shown inside the badge.
  label: string;
  // Semantic tone driving the background and text color.
  tone?: BadgeTone;
}
```

---

## 3. Colors and design tokens

**This is the part people get wrong most often. There are no raw hex values in
components — not one.**

### Where colors come from

Colors live in `src/theme/colors.ts` in **two layers**:

1. **`palette`** — the raw brand ramp (`violet600: '#6D28D9'`, `neutral400`, …).
   It is a module-private const. **Never consume it in UI code**, and never
   export it.
2. **`ColorScheme`** — the semantic layer. Each key describes a *role*, not a
   hue, and each color scheme (`lightColors`, `darkColors`) maps roles to
   palette entries.

Only the semantic layer reaches your component, through the active theme.

Available semantic keys:

```
primary  primaryDark  primaryLight  onPrimary  secondary  onSecondary
background  surface  surfaceVariant  card
border  borderStrong  divider
textPrimary  textSecondary  textTertiary  textInverse
success  successLight  warning  danger  dangerLight  info
overlay  skeletonBase  skeletonHighlight  rating  transparent
```

### How to consume them

The theme is provided by `ThemeProvider` and resolved from the user's preference
(`light` / `dark` / `system`). Two accessors:

```tsx
const theme = useTheme();                             // for inline/dynamic values & icon props
const styles = useThemedStyles(createBadgeStyles);    // for everything in StyleSheet
```

```tsx
// ✅ correct
backgroundColor: theme.colors.surfaceVariant
<MapPin size={theme.sizing.iconSm} color={theme.colors.primary} />

// ❌ never
backgroundColor: '#F3F2F8'
color="rgba(0,0,0,0.6)"
import { lightColors } from '@/theme';   // bypasses dark mode entirely
```

Hardcoding a hex breaks dark mode silently — the screen still renders, it just
looks wrong for half your users.

For text, prefer the `Text` primitive's `color` prop over a style:

```tsx
<Text variant="caption" color="textSecondary">{label}</Text>   // ✅
<Text style={{ color: '#6B6480' }}>{label}</Text>              // ❌
```

### Adding a new color

1. Add the raw value to `palette` in `colors.ts` (only if the ramp lacks it).
2. Add the **semantic key** to the `ColorScheme` interface, with a comment
   describing its role.
3. Map it in **both** `lightColors` and `darkColors`.

Both schemes must implement `ColorScheme`, so TypeScript fails the build if you
add a key to one and forget the other. That is intentional.

### The other token scales

Same rule — take them from `theme`, never type a number:

| Token | Use for |
|---|---|
| `theme.spacing.*` | padding, margin, gap |
| `theme.radius.*` / `theme.cardRadius.*` | border radius |
| `theme.sizing.*` | icon sizes, avatar/input/button heights, hit slop |
| `theme.typography.*` / `fontSize` / `lineHeight` / `fontWeight` | text |
| `theme.shadows.*` / `theme.elevation.*` | depth |
| `theme.opacity.*` | pressed / disabled / tint states |
| `theme.animation.*` / `theme.easing.*` | durations and curves |

---

## 4. Styling pattern

No inline style objects, no NativeWind classes for layout. Every component has a
**style factory** taking the theme and returning a `StyleSheet`:

```ts
// Card.styles.ts
// Style factory for the shared Card surface.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds card surface styles from the active theme.
export function createCardStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Resting card surface: filled background, subtle border for definition and
    // a soft, diffuse shadow (corner radius is applied per-instance).
    base: {
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.soft,
    },
    // Default inner padding applied when `padded` is enabled.
    padded: {
      padding: theme.spacing.lg,
    },
  });
}
```

Consume with `useThemedStyles`, which memoizes on the theme so styles rebuild
only when the scheme changes:

```tsx
const styles = useThemedStyles(createCardStyles);
```

Naming: file `X.styles.ts`, factory `createXStyles`. **Comment every style key**
— say *why*, not *what*. Inline styles are acceptable only for genuinely dynamic
values (a measured width, a per-item tone color).

Repeated layout primitives live in `commonStyles` (`@/utils`): `flexOne`,
`center`, `row`, `rowBetween`, `absoluteFill`.

---

## 5. Building a screen

```tsx
export function ExampleScreen() {
  const styles = useThemedStyles(createExampleStyles);
  const { t } = useTranslation();
  const goBack = useGoBack();

  return (
    <Screen padded={false}>
      <Header title={t('example.title')} showBack onBack={goBack} />
      {/* body */}
    </Screen>
  );
}
```

Non-negotiables:

- **`Screen`** wraps every screen — it owns the safe-area insets and background.
- **`Header`** provides the title and back chevron.
- **Back navigation uses `useGoBack()`**, never `router.back()` directly.
  `router.back()` is a no-op when the history is empty (deep link, notification
  tap, or after a `replace`), which reads to the user as a dead button.
  `useGoBack` falls back to a real destination; pass one for a better parent:
  `useGoBack(routes.listings)`.
- **A `FlashList` / `FlatList` needs a bounded parent.** Wrap it in
  `<View style={commonStyles.flexOne}>`. Without it the list grows to its full
  content height and stops scrolling — the tail (and any sibling below it)
  becomes unreachable.
- **Scroll surfaces handle the keyboard themselves** via
  `keyboardShouldPersistTaps="handled"` and `keyboardDismissMode="on-drag"`.
  `KeyboardAwareScrollView` sets both for you — prefer it for forms. `Screen`'s
  `dismissKeyboardOnTap` is **off by default** and should stay off unless a
  screen has inputs and no scroll surface at all.
- **Bottom sheets go through `BottomSheet`** (`@/components/ui`), which supplies
  the backdrop, safe-area inset, keyboard behaviour and Android hardware-back
  dismissal. A `scrollable` sheet must also pass `snapPoints`, otherwise its
  body has no bounded height and the footer can end up unreachable.

---

## 6. Reuse these — do not rebuild them

| Need | Use |
|---|---|
| Screen shell / safe area | `Screen` |
| Title + back + action | `Header` |
| Any bottom sheet | `BottomSheet` |
| **Listing filters** | **`FilterSheet`** (`@/features/marketplace`) — the single filter component; extend it rather than writing another |
| Sort control | `SortSelect` |
| Paginated listing grid | `ListingResults` |
| Text | `Text` (`variant` + `color`) |
| Buttons | `Button`, `IconButton`, `Fab` |
| Inputs | `TextField`, `Select`, `DateField`, `Checkbox`, `RadioGroup`, `SwitchRow`, `SearchBar`, `RangeSlider` |
| Forms that must clear the keyboard | `KeyboardAwareScrollView` |
| Destructive confirm | `ConfirmDialog` |
| Empty / error states | `EmptyState`, `ErrorState` |
| Loading | `Spinner`, `Skeleton` |

If a shared component is *nearly* right, add a prop to it. Forking it is how a
codebase ends up with two of everything that then drift apart.

---

## 7. Code style (enforced by ESLint — CI runs with `--max-warnings=0`)

- **No `any`.** `@typescript-eslint/no-explicit-any` is an error.
- **Type-only imports** use `import type { X }`.
- **Import order** is auto-sorted by `simple-import-sort` — run `npm run lint:fix`.
- **No `console.log`.** Only `console.warn` / `console.error`; prefer the
  `logger` from `@/lib`. Never leave debug logging in a render or state updater.
- **Hooks rules** are errors; `exhaustive-deps` is a warning that still fails CI.
- **Unused vars** must be prefixed `_`.
- Every file opens with a `//` comment explaining what it is. Every exported
  symbol, prop and style key gets one too.

Before pushing:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint, zero warnings
npm run format      # prettier
```

---

## 8. Text and i18n

All user-facing strings go through translations — no literals in JSX.

```tsx
const { t, language } = useTranslation();
<Text>{t('market.filters.title')}</Text>
<Text>{t('market.results', { count: total })}</Text>
```

Keys live in `src/i18n/translations.ts` and must be added for **both `en` and
`hi`**. `TranslationKey` is typed, so a missing or misspelled key fails the
build.

Backend content that ships in both languages (`{ en, hi }`) is unwrapped with
`localize(value, language)` — imported from `@/features/sell` — rather than a
manual `language === 'HI' ? … : …` ternary.

Currency and dates use the shared helpers — `formatCurrency(value,
appConstants.currencyCode)`, `formatDate`, `formatRelativeTime` from `@/utils`.
Do not hand-roll a `₹` template string; two call sites formatting the same value
differently is a bug users notice.
