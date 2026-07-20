# Tantra — Enterprise React Native E-Commerce App

Production-grade Expo (SDK 53) + TypeScript e-commerce application built with a
feature-based, clean architecture. Every layer is strictly typed, theme-driven,
and organized for long-term maintainability by a senior engineering team.

## Tech Stack

| Concern         | Library                                             |
| --------------- | --------------------------------------------------- |
| Framework       | Expo (SDK 53), Expo Router, TypeScript (strict)     |
| Client state    | Redux Toolkit + Redux Persist                       |
| Server state    | TanStack React Query                                |
| Networking      | Axios (interceptors, refresh, retry)                |
| Forms           | React Hook Form + Zod                               |
| UI / Styling    | Tamagui, NativeWind, theme-token StyleSheets        |
| Animations      | Reanimated, Gesture Handler                         |
| Lists           | Shopify FlashList                                    |
| Images          | Expo Image                                          |
| Icons           | Lucide React Native                                 |
| Bottom Sheet    | @gorhom/bottom-sheet                                |
| Storage         | Expo Secure Store (tokens) + AsyncStorage (persist) |
| Dates           | Day.js                                              |

## Getting Started

```bash
npm install          # .npmrc sets legacy-peer-deps for Expo/RN peer ranges
npm run start        # start Metro
npm run android      # or ios / web
npm run typecheck    # tsc --noEmit
npm run lint         # eslint (strict, import sorting)
```

Runtime configuration is read from `app.json > expo.extra` and
`EXPO_PUBLIC_*` env vars (see `.env.example`).

## Architecture

```
src/
  app/            Expo Router routes (thin bindings to feature screens)
  components/     Reusable UI library (ui, buttons, cards, inputs, loaders, …)
  config/         Env + API endpoint configuration
  constants/      Storage keys, query keys, regex, business constants, routes
  features/       Feature-based verticals (auth, cart, wishlist, profile, …)
  hooks/          Cross-feature hooks (useThemedStyles, useDebouncedValue)
  lib/            Axios client, token store, query client, storage, logger
  providers/      Redux, Query, Theme, Tamagui, Font, SafeArea, Gesture, Sheet
  store/          Redux Toolkit store, slices, persist, typed hooks/selectors
  theme/          Design tokens (colors, spacing, typography, …) + light/dark
  types/          Shared domain + API contracts
  utils/          Pure helpers (pricing, formatting, common styles)
```

### Layered data flow

```
Component → Hook → Service → Repository (api) → Axios (lib) → Backend
                     │
                     └→ Redux (client state)   React Query (server cache)
```

- **Components** render UI only. No fetching, no business logic.
- **Hooks** orchestrate React Query mutations/queries and dispatch to Redux.
- **Services** apply business rules (e.g. persisting tokens on login).
- **Repositories (`api/`)** perform raw, typed HTTP calls.
- **`lib/api`** owns the Axios instance: auth header injection, single-flight
  token refresh on 401, exponential-backoff retry, and error normalization.

### Theme system

Nothing is hardcoded. Colors, spacing, radius, typography, shadows, elevation,
sizing, animation timings and opacity all come from the theme. Screens/components
consume the active theme via `useThemedStyles(createXStyles)` and every screen
owns a co-located `*.styles.ts`. Light and dark schemes are fully supported and
switchable from Profile → Appearance.

## Feature status

**Fully implemented (end-to-end):**

- Authentication — login, register, forgot password, OTP; JWT with secure token
  storage, refresh-token flow, session bootstrap and expiry handling.
- Cart — add/update/remove, coupon + summary (subtotal, discount, shipping, tax).
- Wishlist — toggle, grid, empty state.
- Profile — user summary, navigation menu, theme toggle, logout.
- Search — debounced query input with persisted recent searches.
- App shell — auth-gated routing, tab navigation with live cart badge.

**Scaffolded (clean, extensible route + placeholder screen) — pending catalog
service wiring:**

- Home featured products, Categories, Product detail, Category detail,
  Checkout, Orders, Order detail, Notifications, Coupons, Settings.

Each pending screen has a real route and renders a themed state; the remaining
work is a products/catalog feature vertical (api → service → hooks → screens)
following the exact pattern established by the `auth` feature.

## Conventions

- Absolute imports via `@/*`.
- Barrel exports per folder.
- Single-line comments above every exported symbol; documented Props interfaces.
- No `any`, no `var`, no inline styles, no `console.log` in product code.
- ESLint + Prettier with TypeScript, React Hooks and import-sort rules.
