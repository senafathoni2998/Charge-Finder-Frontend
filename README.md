# Charge Finder Frontend

A React single-page application for finding EV charging stations on an interactive map, filtering by availability and connector, and driving live charging sessions in real time.

## About the project

Charge Finder is split across two sibling repositories developed together:

- **`Charge_Finder_Frontend`** (this repo) — the React 19 + Vite SPA that users interact with.
- **`Charge_Finder_Backend`** — the REST + WebSocket API that provides station data, authentication, charging sessions, and admin operations.

This frontend talks to the backend over HTTP (cookie-based sessions) and over a WebSocket for live charging progress. Point it at a running backend via the `VITE_APP_BACKEND_URL` environment variable (see [Getting Started](#getting-started)).

## Features

**Map & discovery**
- Interactive Leaflet map with a canvas renderer (`preferCanvas`), rendering all station markers to a single `<canvas>` instead of one SVG node each (SVG fallback under jsdom for tests).
- Marker clustering via `supercluster` (cluster radius 64, max zoom 17); cluster bubbles are sized by point count and expand-on-click via `getClusterExpansionZoom`.
- Viewport-driven station fetching — panning the map emits a debounced (400 ms) `onViewportChange(lat, lng, radiusKm)` that refetches nearby stations, with pan-distance thresholding to prevent refetch loops.
- Station status color coding on markers and chips: available (cyan), busy (amber), offline (red), charging-here (green).
- Auto-fit-to-bounds, focus-on-selected-station, floating legend, and a one-time map hint.
- MapTiler raster tiles (`streets-v2`, 512 px, zoom offset −1) when `VITE_MAPTILER_KEY` is set, with public OpenStreetMap tiles as a dev fallback; attribution always rendered.

**Charging**
- Station detail screen with start-charging, payment, report, and share dialogs.
- Live charging progress over a WebSocket (`/ws/charging-progress?stationId=…`) — handles `initial` / `started` / `progress` / `completed` / `cancelled` frames (camelCase and snake_case tolerant), driving progress %, battery %, and estimated completion in component state.
- Auto-completes a session at ≥100% progress; REST actions for start / progress / complete (with cancel) / cancel.
- MainPage polls the actively-charging station every 60 s while a session is running.

**Accounts & profile**
- Email/password login and signup with cookie-based sessions.
- Profile screen (react-router `loader`/`action`) with edit-profile (multipart avatar upload), change-password, and logout.
- Manage vehicles/cars: add and edit cars with connector types and power selection; an active car can be used to filter the map.

**Admin**
- Admin dashboard for station and user management plus stats, gated by both authentication and the `admin` role.
- Add/edit stations (with a map location picker) and create users.

**Cross-cutting**
- Forms built on react-hook-form + zod with a single validation source of truth (`src/forms/schemas.ts`).
- Internationalization (i18next) in English and Indonesian across 18 namespaces, with a browser language detector.
- Responsive shell: a fixed filters sidebar on desktop that becomes a MUI `Drawer` on mobile.
- Vercel Analytics + Speed Insights, and imperative SEO/OG meta management.
- One-time demo-station hint for first-time users.

## Tech Stack

| Area | Libraries |
|---|---|
| Core | React 19.2, TypeScript 5.9, Vite 7.2 |
| Routing | react-router 7.11 (data router: `createBrowserRouter` + `RouterProvider`) |
| State | Redux Toolkit 2.11, react-redux 9.2 |
| UI | MUI 7.3 (`@mui/material`, `@mui/icons-material`) + Emotion 11 |
| Maps | leaflet 1.9.4, react-leaflet 5.0, supercluster 8.0 |
| Forms | react-hook-form 7.80, zod 4.4, `@hookform/resolvers` 5.4 |
| i18n | i18next 25.10, react-i18next 15.7, `i18next-browser-languagedetector` 8.2 |
| Analytics | `@vercel/analytics` 1.6, `@vercel/speed-insights` 1.3 |
| Tooling | Vitest 4, `@testing-library/react` 16, jsdom 27, ESLint 9 |

## Architecture

The app is a client-rendered SPA. Data flows from routed pages into a thin typed API layer and out to the backend over HTTP + WebSocket; cross-cutting UI/auth state lives in Redux.

```
index.html → main.tsx
  └─ <Provider store>          Redux Toolkit store (app + auth slices)
       └─ <RouterProvider>     createBrowserRouter (3 route trees)
            ├─ RootLayout      app shell: glassmorphic AppBar, back/title/lang/admin/profile/filters,
            │    └─ <Outlet>   route-transition Backdrop, lazy-loaded pages
            │         └─ pages/<Feature>/index.tsx
            │              ├─ local components/ + hooks/ + utils/constants
            │              ├─ react-hook-form + zod (src/forms/schemas.ts)
            │              └─ data access:
            │                   ├─ src/api/* → apiRequest<T>()  → HTTP (credentials: include)
            │                   └─ WebSocket (StationDetail)     → live charging progress
            ├─ /login  (RedirectIfAuth, own shell)
            └─ /signup (RedirectIfAuth, own shell)
```

**Request/data flow**
- **Routing → pages:** `src/router/route.ts` defines three top-level trees. Every page is code-split via `lazy:` importers and shares an `errorElement` (`RouteError`). Guards (`RequireAuth`, `RequireAdmin`, `RedirectIfAuth`) read `state.auth` from Redux and are wired as pathless layout routes.
- **Pages → API:** Most data access goes through `src/api/client.ts`'s `apiRequest<T>()`, which returns a discriminated `ApiResult<T>` (`{ ok:true, status, data } | { ok:false, status, error, aborted? }`), prepends `VITE_APP_BACKEND_URL`, sends `credentials: "include"`, applies a 15 s timeout merged with the caller's `AbortSignal`, and localizes errors via the `api` i18n namespace. Domain modules (`stations`, `charging`, `tickets`, `adminStations`, `users`, `vehicles`, `chargingHistory`, `geocode`) wrap it. A few legacy route/request modules still call `fetch` directly (login, signup, profile, cars) — notably `profileRequests.ts`, which uses `FormData` for avatar upload.
- **Auth/session:** Cookie-based — every request carries the backend session cookie. A JWT is also stored in `localStorage` for client-side use only (there is no `Authorization`/`Bearer` header). The `auth` slice is hydrated from `localStorage` on startup; page-level storage modules handle persistence. `src/utils/session.ts` decodes the JWT `exp` to detect expiry.
- **Live charging:** `buildChargingSocketUrl(stationId)` derives `ws`/`wss` from `VITE_APP_BACKEND_URL` and opens `new WebSocket(...)` in `StationDetail`; live charging state lives in component state, not Redux.
- **Theming:** No MUI `ThemeProvider`/`createTheme`. A hand-rolled design-token object `UI` (in `src/theme/theme.ts`, purple→cyan brand gradient) is applied through the `sx` prop. The app is effectively light-only.

## Project Structure

```
Charge_Finder_Frontend/
├─ index.html                # single #root mount, PWA manifest, SEO/OG meta
├─ vite.config.ts            # Vite + inline Vitest config (jsdom), dev port 3000
├─ vercel.json               # SPA rewrites (Vercel deploy)
├─ .env.example              # documents VITE_APP_BACKEND_URL, VITE_MAPTILER_KEY
└─ src/
   ├─ main.tsx               # app bootstrap: Provider + RouterProvider, SEO/Analytics
   ├─ api/                   # typed HTTP layer — client.ts (apiRequest<T>) + domain modules
   ├─ app/                   # Redux store.ts + typed hooks.ts
   ├─ components/            # shared UI: SEO, LanguageSwitcher/Card, Map/ (MapCanvas, …)
   ├─ features/              # Redux slices: app (UI) + auth
   ├─ forms/                 # zod schemas.ts — single validation source of truth
   ├─ hooks/                 # geolocation-hook.ts
   ├─ i18n/                  # i18next setup + en/id locales (18 namespaces)
   ├─ layout/               # RootLayout.tsx — the in-app shell
   ├─ models/               # domain types (model.ts)
   ├─ pages/                 # one folder per screen (index.tsx + components/hooks/utils)
   ├─ router/                # route.ts (config) + guards.tsx
   ├─ theme/                 # theme.ts — UI design tokens
   └─ utils/                 # distance, map, session, time, validate
```

Each page folder follows a consistent convention: `index.tsx` (container), local `components/` and `hooks/` (each with colocated `__tests__/`), plus `constants.ts`, `utils.ts`, and `*Route.ts` / `*Storage.ts` helpers.

## Getting Started

### Prerequisites
- Node.js 20 (matches CI)
- npm
- A running `Charge_Finder_Backend` instance for the API and WebSocket

### Environment variables

Copy `.env.example` to `.env` (or `.env.local`). Both variables are Vite `VITE_`-prefixed and therefore exposed to the client.

| Name | Required? | Description | Default / example |
|---|---|---|---|
| `VITE_APP_BACKEND_URL` | Yes | Backend API base URL. Must include the `/api` prefix and have no trailing slash. Also used to derive the `ws`/`wss` charging socket URL. | `http://localhost:5000/api` |
| `VITE_MAPTILER_KEY` | No | MapTiler API key for map tiles. If empty, the map falls back to public OpenStreetMap tiles (dev-only per OSM's tile-usage policy). | *(empty → OSM tiles)* |

### Install

```bash
npm install
```

### Run in development

```bash
npm run dev
```

The dev server runs on **http://localhost:3000**.

### Build

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Routes & Screens

Defined in `src/router/route.ts` via `createBrowserRouter`. All pages are lazy-loaded and share a `RouteError` error element.

### Main app shell (`/`, wrapped by `RootLayout`)

| Path | Screen | Auth |
|---|---|---|
| `/` | Map / home — Leaflet map, station list, filters | Public |
| `/station/:id` | Station detail — live charging, payment, report, share | Public |
| `/profile` | Profile (uses react-router `loader`/`action`) | `RequireAuth` |
| `/profile/cars/new` | Add car | `RequireAuth` |
| `/profile/cars/:carId/edit` | Edit car | `RequireAuth` |
| `/admin` | Admin dashboard — stations, users, stats | `RequireAuth` + `RequireAdmin` |
| `/admin/stations/new` | Add station (map location picker) | `RequireAuth` + `RequireAdmin` |
| `/admin/stations/:stationId/edit` | Edit station | `RequireAuth` + `RequireAdmin` |
| `/admin/users/new` | Add user | `RequireAuth` + `RequireAdmin` |
| `*` | Not found (404) inside the shell | Public |

### Standalone shells (outside `RootLayout`)

| Path | Screen | Guard |
|---|---|---|
| `/login` | Login | `RedirectIfAuth` |
| `/signup` | Signup | `RedirectIfAuth` |

**Guards** (`src/router/guards.tsx`): `RequireAuth` redirects unauthenticated users to `/login?next=<encoded path>` (with a one-shot post-logout redirect to `/`); `RedirectIfAuth` bounces authenticated users off login/signup using an open-redirect-safe `next` target; `RequireAdmin` requires `state.auth.role === "admin"`.

### How it talks to the backend

- **REST base URL:** `VITE_APP_BACKEND_URL` (expected to already include `/api`).
- **Representative endpoints:** `/auth/login`, `/auth/logout`, `/profile`, `/profile/update-profile`, `/profile/charging-history`, `/vehicles` (+ `/vehicles/:id`), `/stations` (list, `?lat=&lng=&radiusKm=`), `/stations/:id`, `/stations/start-charging`, `/stations/charging-progress`, `/stations/complete-charging`, `/stations/cancel-charging`, `/stations/request-ticket`, `/stations/:id/active-ticket`, `/stations/add-station`, `/stations/update-station`, `/stations/delete-station`, `/admin/users` (+ `/admin/users/:userId`).
- **WebSocket:** `${ws|wss}://<backend host>/ws/charging-progress?stationId=<id>` for live charging progress.
- **External call:** reverse geocoding hits OpenStreetMap Nominatim directly (the one non-backend, non-credentialed request).

## Testing

- **Framework:** Vitest 4 (globals enabled) in a **jsdom** environment, with `@testing-library/react` 16 and `@testing-library/jest-dom` 6.
- **Setup:** `src/setupTests.ts` loads jest-dom, initializes the shared i18next instance (so components using `useTranslation` need no per-test provider), and resets the language to `en` before each test.
- **Coverage:** ~138 `*.test.ts(x)` files colocated in `__tests__/` directories across `api`, `hooks`, `router`, `i18n`, `forms`, `app`, `components` (incl. `Map`), `layout`, `utils`, `features`, and every page and its subcomponents.

```bash
npm test            # watch mode
npm test -- --run   # single non-watch run (as CI does)
```

## Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `vite` | Start the dev server (port 3000) |
| `build` | `vite build` | Production build |
| `preview` | `vite preview` | Preview the production build locally |
| `typecheck` | `tsc --noEmit` | TypeScript type check (strict mode; test files excluded) |
| `lint` | `eslint .` | Run ESLint (flat config; not yet gated in CI) |
| `test` | `vitest` | Run the test suite (append `-- --run` for a single run) |

### Continuous integration

A single GitHub Actions workflow (`.github/workflows/unit-tests.yml`, **Unit Tests**) runs on pushes to `main` and all pull requests. On Node 20 it runs: `npm ci` → `npm run typecheck` → `npm test -- --run` → `npm run build`. Linting is intentionally not gated yet.

## Deployment

Deployment is handled by **Vercel** (there is no deploy GitHub Actions workflow). Configuration lives in `vercel.json`:

- SPA fallback rewrite `{"source": "/(.*)", "destination": "/"}` so all routes serve `index.html`.
- Runtime analytics are provided by the `@vercel/analytics` and `@vercel/speed-insights` packages wired into `main.tsx`.

Set `VITE_APP_BACKEND_URL` (and optionally `VITE_MAPTILER_KEY`) as environment variables in the Vercel project so the built client points at your deployed `Charge_Finder_Backend`.

> Note: `vercel.json` also contains a backend-proxy rewrite, but because the SPA-fallback rule `/(.*)` matches everything first, the SPA fallback is the effective behavior.
