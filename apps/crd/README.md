# commutr-crd-web

Commutr Corporate Car Rental (CRD) frontend. Vite + React 19 + TypeScript.
Served under `/crd/` behind the Commutr gateway (same origin as ETS).

## Run locally

```bash
cp .env.example .env     # set VITE_X_TENENT_ID for localhost
npm install
npm run dev              # http://localhost:5175/crd/
```

## Structure

- `src/pages/LoginPage.tsx` — login
- `src/pages/DashboardPage.tsx` — welcome page shown after login
- `src/layout/MainLayout.tsx` — sidebar with the static menu (`MENU` array)
- `src/auth-core/` — token + tenant helpers (same contract as ETS)
- `src/api.ts` — fetch wrapper; API paths are always absolute

## Static menu

Dashboard, then Booking → Create Booking (`/bookings/create`), All Bookings (`/bookings`).
Edit the `MENU` array in `MainLayout.tsx` to add items.

## Open items

- `switch-app` call after login (see TODO in `LoginPage.tsx`) — needs the response shape.
- Confirm the CrdCore host / base path in `vite.config.ts` (`/crd-api` proxy).
- Replace `src/auth-core` with `@commutr/auth` once published.
- When the launcher exists, `RequireAuth` should redirect to `/` instead of `/login`.
