# ChargeFinder — Frontend

The web interface for ChargeFinder: a map-based app that helps EV drivers find charging stations, check availability, manage their vehicles, and track charging sessions in real time.

**Live:** [chargefinder.senafathoni.dev](https://chargefinder.senafathoni.dev)

---

## What It Does

- **Station Map** — Interactive map (Leaflet + OpenStreetMap) showing all nearby charging stations. Filter by connector type (CCS2, Type2, CHAdeMO) or charging speed.
- **Station Details** — View real-time availability, pricing per kWh, connector types, and amenities for any station.
- **Charging Flow** — Request a charging ticket and watch live progress via WebSocket — from start to completion.
- **Vehicle Management** — Add your EVs with battery capacity, connector types, and current charge level. Set an active vehicle for compatibility info.
- **Charging History** — Review past sessions with duration, kWh consumed, and cost.
- **Admin Dashboard** — Add, edit, and remove stations; manage users; view an operational snapshot of the platform.
- **Auth** — Email/password login with session-based authentication and route-level access control.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite |
| State Management | Redux Toolkit |
| UI Components | Material UI |
| Maps | Leaflet + React-Leaflet + OpenStreetMap |
| Real-time | WebSocket (ws) |
| Routing | React Router 7 |
| Testing | Vitest + React Testing Library |

---

## Project Structure

```
src/
├── pages/          # 13 pages: Map, StationDetail, Profile, Admin, Login, Signup…
├── components/     # Shared components (Map canvas, markers, SEO…)
├── api/            # API client modules (stations, users, vehicles, charging…)
├── features/       # Redux slices (auth, app state)
├── hooks/          # Custom hooks (geolocation, HTTP)
├── router/         # Route definitions and auth/admin guards
├── models/         # TypeScript types and interfaces
├── utils/          # Helper functions
└── theme/          # Material UI theme config
```

---

## Getting Started

```bash
npm install
npm run dev        # starts dev server on :3000
```

### Other Commands

```bash
npm run build      # production build
npm run test       # run tests with Vitest
npm run lint       # ESLint check
npm run preview    # preview production build locally
```

---

## Environment

Create a `.env` file at the root and set the backend API URL:

```
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
```
