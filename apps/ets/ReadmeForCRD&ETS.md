# Commutr Web — Multi-App Frontend Architecture (ETS + CRD)

> **Scope: frontend and frontend hosting only.** No backend service (identityapi / auth, EtsCore, CrdCore) is modified. The existing EC2 + Docker + Nginx deployment model is kept; S3/CloudFront is **not** required.

---

## Table of contents

1. [Summary](#1-summary)
2. [Part 1 — Implementation](#part-1--implementation)
   - [2. Goals and constraints](#2-goals-and-constraints)
   - [3. Final architecture](#3-final-architecture)
   - [4. Repositories and ownership](#4-repositories-and-ownership)
   - [5. Gateway (Nginx)](#5-gateway-nginx)
   - [6. App containers](#6-app-containers)
   - [7. Shared package `@commutr/auth`](#7-shared-package-commutrauth)
   - [8. Launcher (login + app chooser)](#8-launcher-login--app-chooser)
   - [9. App configuration (ETS / CRD)](#9-app-configuration-ets--crd)
   - [10. Local development](#10-local-development)
   - [11. CI/CD and deployment](#11-cicd-and-deployment)
   - [12. Backend dependencies (information only, no changes)](#12-backend-dependencies-information-only-no-changes)
   - [13. Risks and open items](#13-risks-and-open-items)
3. [Part 2 — Step-by-step implementation guide](#part-2--step-by-step-implementation-guide)
   - [Phase 0 — Verify before building](#phase-0--verify-before-building)
   - [Phase 1 — Shared package repo](#phase-1--shared-package-repo)
   - [Phase 2 — Extract the gateway (no user-visible change)](#phase-2--extract-the-gateway-no-user-visible-change)
   - [Phase 3 — Move ETS to /ets/ and launch the launcher](#phase-3--move-ets-to-ets-and-launch-the-launcher)
   - [Phase 4 — Build and deploy CRD](#phase-4--build-and-deploy-crd)
   - [Phase 5 — Per-repo CI/CD](#phase-5--per-repo-cicd)
   - [Phase 6 — Verification checklist](#phase-6--verification-checklist)
   - [Rollback](#rollback)

---

## 1. Summary

Commutr currently ships one React (Vite) app — ETS — served by an Nginx container that also proxies APIs to the auth and core backends. We are adding a second app, CRD (Corporate Car Rental), built by a **separate team**. Users with both App IDs choose ETS or CRD after login.

**Decision:**

- Keep EC2 + Docker. Add a **gateway Nginx** container that owns all API proxying and routes by **path** on the same host:
  - `/` → launcher (login + app chooser)
  - `/ets/` → ETS app
  - `/crd/` → CRD app
- Same host + same port = **same origin**, so the auth token and refresh cookies are shared across all three apps with no hand-off.
- **Separate repos per team** (polyrepo). Shared auth/session logic is published as a versioned npm package.
- Each app ships as its own Docker image and deploys independently. Images are built in CI, **never on the EC2 box**.

---

# Part 1 — Implementation

## 2. Goals and constraints

| Goal / constraint | How it is met |
|---|---|
| ETS and CRD deploy independently | Separate repos, images, containers and pipelines; gateway routes by path |
| Different teams own ETS and CRD | Repo boundaries match team boundaries |
| Single login, shared session | All apps on one origin; shared `@commutr/auth` package |
| Backend cannot be changed | All routing done in Nginx; CRD APIs exposed under a frontend-only prefix (`/crd-api/`) and rewritten |
| Keep current deployment | Same EC2, same Docker, same Nginx technology |
| Existing ETS bookmarks / emailed links keep working | Launcher redirects unknown legacy paths to `/ets/<path>` |

## 3. Final architecture

```
                        Browser  (https://<tenant-domain>)
                                     │
                     (SSL terminated here or upstream — see §13)
                                     │
                   ┌─────────────────▼──────────────────┐
                   │  gateway  (nginx, port 80)          │   platform-owned
                   │  - path routing to app containers   │
                   │  - ALL API proxying                 │
                   └──┬───────┬───────┬───────┬─────┬────┘
                      │       │       │       │     │
              /       │ /ets/ │ /crd/ │       │     │
                      ▼       ▼       ▼       │     │
               ┌────────┐ ┌───────┐ ┌───────┐ │     │
               │launcher│ │ets-web│ │crd-web│ │     │     static files only
               └────────┘ └───────┘ └───────┘ │     │     (no API config)
                                              │     │
          /api/v1/(Auth|me|refresh-token|...) │     │ /api/        /crd-api/ → /api/
                                              ▼     ▼              ▼
                                         dev-auth  dev-core      CrdCore
                                        (identity) (EtsCore)
                                     ─────── backend: unchanged ───────

     All containers on one Docker network: commutr-net (EC2)
```

Key properties:

- **Only the gateway publishes a host port.** App containers are reachable only through it.
- **App containers contain no API routes.** API routing lives in exactly one place, so it cannot drift between teams.
- **Gateway resolves app containers through Docker DNS at request time**, so restarting one app container never causes 502s on the others.
- **API URLs are relative** (`/api/...`), so one image works in every environment; only the gateway knows which backend hosts to use.

## 4. Repositories and ownership

| Repo | Owner | Contents | Deploys as |
|---|---|---|---|
| `commutr-gateway` | Platform | Nginx config template, Dockerfile, compose file | `gateway` container |
| `commutr-launcher` | Platform | Login page + app chooser + legacy redirect | `launcher` container |
| `commutr-web-shared` | Platform | `@commutr/auth` (and optionally `@commutr/ui`) | npm package (GitHub Packages) |
| `commutr-ets-web` | ETS team | ETS React app | `ets-web` container |
| `commutr-crd-web` | CRD team | CRD React app | `crd-web` container |

> **Ownership note:** the gateway, launcher and shared package need an owner who is not tied to either app team. If that is not possible, assign a named lead. Do not let the ETS team implicitly own login — that makes CRD dependent on ETS for every auth change.

## 5. Gateway (Nginx)

`commutr-gateway/templates/default.conf.template` — the official nginx image renders files in `/etc/nginx/templates/` with environment variables at startup, so the same image works for dev, staging and production.

```nginx
server {
    listen 80 default_server;
    server_name _;                       # catches every tenant domain

    resolver 8.8.8.8 ipv6=off valid=30s; # public DNS for backend hosts

    location = /healthz {
        add_header Content-Type text/plain;
        return 200 'ok';
    }

    # ────────────── Frontend apps ──────────────
    # Variables + Docker DNS (127.0.0.11) => resolved per request,
    # so an app container restart never leaves a stale IP.

    location = /ets { return 301 /ets/; }
    location /ets/ {
        resolver 127.0.0.11 ipv6=off valid=10s;
        set $ets_web http://ets-web:80;
        proxy_pass $ets_web;
        proxy_set_header Host $host;
    }

    location = /crd { return 301 /crd/; }
    location /crd/ {
        resolver 127.0.0.11 ipv6=off valid=10s;
        set $crd_web http://crd-web:80;
        proxy_pass $crd_web;
        proxy_set_header Host $host;
    }

    location / {
        resolver 127.0.0.11 ipv6=off valid=10s;
        set $launcher http://launcher:80;
        proxy_pass $launcher;
        proxy_set_header Host $host;
    }

    # ────────────── Auth APIs (unchanged behaviour) ──────────────
    location ~ ^/api/v1/(Auth|me|refresh-token|Users/reset-password|Users/check-exists|Users/change-password) {
        set $auth https://${AUTH_HOST};
        proxy_pass $auth;
        proxy_ssl_server_name on;
        proxy_set_header Host ${AUTH_HOST};
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # ────────────── CRD APIs (frontend-only prefix) ──────────────
    # Browser calls /crd-api/...; backend receives /api/... unchanged.
    location /crd-api/ {
        set $crd_api https://${CRD_HOST};
        rewrite ^/crd-api/(.*)$ /api/$1 break;
        proxy_pass $crd_api;
        proxy_ssl_server_name on;
        proxy_set_header Host ${CRD_HOST};
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # ────────────── ETS core APIs (unchanged behaviour) ──────────────
    location /api/ {
        set $core https://${CORE_HOST};
        proxy_pass $core;
        proxy_ssl_server_name on;
        proxy_set_header Host ${CORE_HOST};
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Notes:

- Cookies pass through Nginx in both directions by default; the old `proxy_set_header Cookie` / `proxy_pass_header Set-Cookie` lines are unnecessary.
- The auth regex location wins over the `/api/` prefix (Nginx checks regex locations after prefix matching). `/crd-api/` does not collide with `/crd/`.
- Adjust the `/crd-api/` rewrite once the CrdCore base path is confirmed (see Phase 0).
- If uploads exceed 1 MB, add `client_max_body_size` (Nginx default is 1 MB) — check what the current ETS container uses.

`commutr-gateway/Dockerfile`

```dockerfile
FROM nginx:1.27-alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY templates/ /etc/nginx/templates/
# Only substitute our variables, leave nginx $vars intact
ENV NGINX_ENVSUBST_FILTER="^(AUTH_HOST|CORE_HOST|CRD_HOST)$"
```

`commutr-gateway/docker-compose.yml`

```yaml
services:
  gateway:
    image: ghcr.io/<org>/commutr-gateway:${TAG:-latest}
    container_name: gateway
    ports: ["80:80"]
    environment:
      AUTH_HOST: dev-auth.commutr.in
      CORE_HOST: dev-core.commutr.in
      CRD_HOST:  dev-crd.commutr.in      # confirm actual CrdCore host
    networks: [commutr-net]
    restart: unless-stopped

networks:
  commutr-net:
    external: true
```

## 6. App containers

Each app's image contains **only** its built static files and a minimal Nginx config. The build output is copied into a sub-folder matching its URL path, so plain `root` + `try_files` works.

`commutr-crd-web/nginx.conf` (ETS identical with `crd` → `ets`)

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;

    # index.html must never be cached, so each deploy is picked up immediately
    location = /crd/index.html {
        add_header Cache-Control "no-cache";
    }

    # Vite outputs content-hashed assets: cache forever
    location /crd/assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files $uri =404;
    }

    # SPA fallback: deep links like /crd/bookings/42 load the app
    location /crd/ {
        try_files $uri $uri/ /crd/index.html;
    }
}
```

`commutr-launcher/nginx.conf`

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;

    location = /index.html { add_header Cache-Control "no-cache"; }
    location /assets/      { add_header Cache-Control "public, max-age=31536000, immutable"; try_files $uri =404; }
    location /             { try_files $uri $uri/ /index.html; }
}
```

`commutr-crd-web/Dockerfile`

```dockerfile
# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN --mount=type=secret,id=npm_token \
    NODE_AUTH_TOKEN=$(cat /run/secrets/npm_token) npm ci
COPY . .
RUN npm run build

# ---- serve ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html/crd
```

(ETS: copy `dist` to `/usr/share/nginx/html/ets`. Launcher: copy to `/usr/share/nginx/html`. Use pnpm/yarn instead of npm if that is what the repo already uses.)

`commutr-crd-web/docker-compose.yml`

```yaml
services:
  crd-web:
    image: ghcr.io/<org>/commutr-crd-web:${TAG:-latest}
    container_name: crd-web
    networks: [commutr-net]      # no published ports — reachable only via gateway
    restart: unless-stopped

networks:
  commutr-net:
    external: true
```

## 7. Shared package `@commutr/auth`

Lives in `commutr-web-shared`, built with Vite library mode, published to **GitHub Packages**, versioned with **Changesets**. `react` and `react-dom` are `peerDependencies` (never bundled — avoids two Reacts).

> **GitHub Packages scope rule:** the npm scope must match the GitHub org name. If the org is not `commutr`, the package is `@<org>/auth`. Alternatively use AWS CodeArtifact, which has no such restriction.

**Rule:** move the *existing* ETS auth logic into this package as-is. Do not redesign token storage or the refresh flow — that would risk a backend-visible behaviour change.

### Contents

| Export | Purpose |
|---|---|
| `APP_IDS`, `APP_ROUTES`, `API_BASE` | Integration contract constants — no app hard-codes these |
| `createApiClient(baseURL)` | Axios instance with bearer/tenant headers and refresh-on-401, exactly as ETS does today |
| `ensureSession()` | Returns a valid session: uses the stored token, or calls `refresh-token` once |
| `getAppIds(session)` | Extracts App IDs from the login / `me` response |
| `logout()` | Calls the existing logout endpoint (if any), clears local state, `window.location.replace('/')` |
| `<AppGuard>` | Per-app route guard |
| `<LoginPage>` | The login form used by the launcher, and by each app in local dev |

### Contract constants

```ts
// packages/auth/src/contract.ts
export const APP_IDS = { ETS: 1, CRD: 2 } as const;

export const APP_ROUTES = {
  launcher: "/",
  chooser: "/choose-app",
  ets: "/ets/",
  crd: "/crd/",
} as const;

// Always absolute — never "api/..." (would resolve under /crd/ or /ets/)
export const API_BASE = {
  auth: "/api/v1",    // Auth, me, refresh-token, Users/*
  ets: "/api",        // EtsCore (adjust to match current ETS client)
  crd: "/crd-api",    // CrdCore via gateway rewrite
} as const;
```

### App IDs helper

```ts
// packages/auth/src/appIds.ts
// TODO: adapt to the real shape returned by login / GET /api/v1/me (Phase 0).
export function getAppIds(session: Session): number[] {
  return session.user?.appIds ?? [];
}
```

### Guard

```tsx
// packages/auth/src/AppGuard.tsx
type Props = {
  appId: number;
  devLogin?: boolean;          // pass import.meta.env.DEV from the APP —
  children: React.ReactNode;   // never read import.meta.env inside the library,
};                             // it is frozen at the library's build time.

export function AppGuard({ appId, devLogin = false, children }: Props) {
  const [state, setState] = useState<"loading" | "ok" | "login">("loading");

  useEffect(() => {
    ensureSession()
      .then((session) => {
        if (!session) return devLogin ? setState("login") : window.location.replace(APP_ROUTES.launcher);
        if (!getAppIds(session).includes(appId)) return window.location.replace(APP_ROUTES.launcher);
        setState("ok");
      });
  }, [appId, devLogin]);

  if (state === "loading") return null;              // or a spinner
  if (state === "login") return <LoginPage onSuccess={() => window.location.reload()} />;
  return <>{children}</>;
}
```

The guard is async on purpose: cross-app navigation is a full page load, so if the access token is held in memory, the app must recover it via the refresh cookie. If ETS stores the token in localStorage today, `ensureSession()` simply returns it.

### Release flow

1. Developer opens a PR in `commutr-web-shared` with a changeset (`npx changeset`).
2. On merge, the Changesets GitHub Action opens a "Version packages" PR; merging it publishes the new version.
3. Renovate/Dependabot in `commutr-ets-web` and `commutr-crd-web` raises upgrade PRs.
4. **Breaking changes to `@commutr/auth` require a major version and a coordinated release with both teams.** Prefer additive changes.

## 8. Launcher (login + app chooser)

Routes:

| Path | Behaviour |
|---|---|
| `/` , `/login` | Login form (`<LoginPage>`). If already logged in, skip straight to routing |
| `/choose-app` | ETS / CRD cards for users with both App IDs |
| anything else | **Legacy redirect**: `window.location.replace('/ets' + pathname + search)` |

Routing after login:

```ts
async function routeUser() {
  const session = await ensureSession();
  if (!session) return;                                  // stay on login
  const ids = getAppIds(session);

  if (ids.length === 0) return showNoAccessMessage();    // never redirect → avoids loops
  if (ids.length === 1) {
    return window.location.replace(ids[0] === APP_IDS.ETS ? APP_ROUTES.ets : APP_ROUTES.crd);
  }
  navigate(APP_ROUTES.chooser);                          // both apps
}
```

- Use `window.location` (full navigation) to move between apps — they are separate builds.
- The legacy redirect keeps old ETS bookmarks and links in existing emails/notifications working, because before this change every path belonged to ETS.
- Each app's header shows an **app switcher** link (to `/choose-app`) for users with both App IDs.

## 9. App configuration (ETS / CRD)

`vite.config.ts` (CRD shown)

```ts
export default defineConfig({
  base: "/crd/",
  plugins: [react()],
  server: {
    port: 5175,
    proxy: {
      // mirror the gateway; regex key must come first
      "^/api/v1/(Auth|me|refresh-token|Users/reset-password|Users/check-exists|Users/change-password)": {
        target: "https://dev-auth.commutr.in",
        changeOrigin: true,
        cookieDomainRewrite: "localhost",
      },
      "/crd-api": {
        target: "https://dev-crd.commutr.in",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/crd-api/, "/api"),
      },
    },
  },
});
```

ETS: `base: "/ets/"`, port `5174`, proxy auth paths + `/api` → dev-core.
Launcher: `base: "/"`, port `5173`, proxy auth paths only.

Router and guard:

```tsx
<BrowserRouter basename={import.meta.env.BASE_URL}>
  <AppGuard appId={APP_IDS.CRD} devLogin={import.meta.env.DEV}>
    <AppRoutes />
  </AppGuard>
</BrowserRouter>
```

API clients:

```ts
export const authApi = createApiClient(API_BASE.auth);
export const crdApi  = createApiClient(API_BASE.crd);   // ETS uses API_BASE.ets
```

Checklist for each app:

- [ ] Every `fetch`/axios base URL starts with `/` (absolute)
- [ ] No hard-coded `href="/something"` that should be inside the app — use router `<Link>`
- [ ] Public-folder assets referenced via `import.meta.env.BASE_URL`, not `/logo.png`
- [ ] Logout uses `logout()` from `@commutr/auth`

## 10. Local development

Each app runs standalone — no need to clone the launcher or gateway:

```bash
npm run dev
# open http://localhost:5175/crd/
```

- Not logged in → the guard renders `<LoginPage>` (because `devLogin` is true in dev).
- Vite proxies API calls to the dev backends, mirroring the gateway, so cookies and paths behave as in production.
- Testing unpublished changes to `@commutr/auth`: use `yalc publish` in the shared repo and `yalc add @commutr/auth` in the app (or `npm link`).

Full-stack check on one machine (optional): run `docker compose up` for gateway + all three apps on `commutr-net` and open `http://localhost/`.

## 11. CI/CD and deployment

**Principle:** build images in GitHub Actions, push to GHCR, and have EC2 only `pull` + restart its own container. Building on EC2 lets one team's build starve the other's running app of CPU/RAM.

`commutr-crd-web/.github/workflows/deploy.yml`

```yaml
name: deploy
on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/build-push-action@v6
        with:
          push: true
          tags: |
            ghcr.io/<org>/commutr-crd-web:${{ github.sha }}
            ghcr.io/<org>/commutr-crd-web:latest
          secrets: |
            npm_token=${{ secrets.GITHUB_TOKEN }}

      - uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /opt/commutr/crd-web
            echo "TAG=${{ github.sha }}" > .env
            docker compose pull
            docker compose up -d
            docker image prune -f
```

Notes:

- For `GITHUB_TOKEN` to read `@commutr/auth`, grant the app repo access in the package's settings (Package → Manage access). Otherwise use a PAT with `read:packages` as `NPM_TOKEN`.
- The `.env` file on EC2 records the running tag — this is the rollback point.
- Use one EC2 directory per service: `/opt/commutr/{gateway,launcher,ets-web,crd-web}`.
- Ideally, give each team's deploy SSH user permission only for its own directory/service.
- A container restart causes a few seconds of unavailability for that app only. If that is unacceptable later, introduce blue/green containers behind the gateway.

## 12. Backend dependencies (information only, no changes)

| Dependency | Why it matters | Status |
|---|---|---|
| Login or `GET /api/v1/me` returns the user's App IDs | The launcher cannot route without it | **Verify in Phase 0** |
| CrdCore host and API base path | Needed for the `/crd-api/` rewrite | **Ask CrdCore owners** |
| Tenant is resolved from Origin/Referer/JWT/header, not Host | The gateway already overwrites Host today, so path routing does not change this | Low risk — confirm Referer is parsed by host only |
| CORS | Not relevant — all API calls are same-origin via the gateway | Resolved |

**Explicitly out of scope** (backend recommendations from earlier drafts that are *not* part of this plan): adding App ID claims to the JWT, server-side App ID enforcement in EtsCore/CrdCore, sharing TenantProvider, per-app RBAC, shared NuGet packages.

## 13. Risks and open items

1. **App ID gating in the frontend is not security.** If the backend does not enforce App IDs, a CRD-only user can call EtsCore APIs directly. This cannot be fixed on the frontend. **Raise it in writing with the backend owners.**
2. **SSL.** The gateway listens on 80. Confirm HTTPS is terminated upstream (ALB or host-level). If users hit port 80 directly, auth cookies travel unencrypted — fix independently of this work.
3. **Launcher/shared ownership** must be assigned before Phase 1.
4. **Shared single EC2.** Separate images remove build-time coupling, but all apps share one machine's resources. Monitor; move to S3 + CloudFront later without architectural changes if needed (paths and `base` stay identical).
5. **Old URLs.** Covered by the launcher's legacy redirect; verify the most-used deep links in Phase 6.

---

# Part 2 — Step-by-step implementation guide

## Phase 0 — Verify before building

Do not start Phase 1 until every item is answered.

1. **App IDs:** log in as a test user who has both apps, call `GET /api/v1/me` (and inspect the login response). Record the exact field name and shape of the App IDs. Update `getAppIds()` accordingly.
   - If App IDs are **not** returned anywhere, stop: this requires a backend change and the plan must be renegotiated.
2. **CrdCore:** get the dev/staging/prod hosts and API base path. Confirm whether CRD also needs EtsCore APIs.
3. **Auth storage:** document how the current ETS app stores the access token (memory / localStorage) and how refresh works. This is moved as-is into `@commutr/auth`.
4. **Ownership:** name the owner of `commutr-gateway`, `commutr-launcher`, `commutr-web-shared`.
5. **SSL:** confirm where HTTPS terminates.
6. **GitHub org name:** decide the npm scope (`@commutr` vs `@<org>`).
7. **Upload size:** check if the current ETS Nginx sets `client_max_body_size`.

## Phase 1 — Shared package repo

1. Create `commutr-web-shared` with `packages/auth` (and optionally `packages/ui`).
2. Configure Vite library mode; mark `react`, `react-dom`, `react-router-dom`, `axios` as peer dependencies.
3. Move the current ETS auth code (token storage, axios interceptors, refresh, logout, login form) into `packages/auth` **without behaviour changes**.
4. Add `contract.ts`, `getAppIds()`, `ensureSession()`, `<AppGuard>` as in §7.
5. Add Changesets and the release workflow; publish `@commutr/auth@1.0.0` to GitHub Packages.
6. Add `.npmrc` template for consumers:
   ```
   @commutr:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
   ```

## Phase 2 — Extract the gateway (no user-visible change)

Goal: move API proxying out of the ETS container while ETS still serves at `/`.

1. On EC2, create the shared network once:
   ```bash
   docker network create commutr-net
   ```
2. Create `commutr-gateway` with the config from §5, **temporarily** routing `/` to `ets-web` instead of `launcher`:
   ```nginx
   location / {
       resolver 127.0.0.11 ipv6=off valid=10s;
       set $ets_web http://ets-web:80;
       proxy_pass $ets_web;
       proxy_set_header Host $host;
   }
   ```
   Leave out the `/ets/`, `/crd/` and `/crd-api/` blocks for now.
3. Attach the current ETS container to `commutr-net` with the name `ets-web` and **remove its published host port** from its compose file.
4. Start the gateway on port 80 (stop whatever currently binds port 80 first — plan a short maintenance window).
5. Verify: login, refresh, normal ETS usage, file uploads. Behaviour must be identical.
6. In `commutr-ets-web`, delete the API `location` blocks from the container's Nginx config (the gateway now handles `/api` before requests reach ETS). Redeploy ETS and re-verify.

## Phase 3 — Move ETS to /ets/ and launch the launcher

1. **ETS repo** (`commutr-ets-web`):
   - `vite.config.ts` → `base: "/ets/"`
   - `<BrowserRouter basename={import.meta.env.BASE_URL}>`
   - Make every API base URL absolute; switch to `createApiClient` from `@commutr/auth`
   - Wrap the app in `<AppGuard appId={APP_IDS.ETS} devLogin={import.meta.env.DEV}>`
   - Replace the container Nginx config with §6 (`ets` version); Dockerfile copies `dist` to `/usr/share/nginx/html/ets`
   - Fix public-asset and hard-coded paths (§9 checklist)
   - Build and push the image, **but do not change the gateway yet**
2. **Launcher repo** (`commutr-launcher`):
   - Vite app, `base: "/"`, using `<LoginPage>` and the routing logic from §8
   - Implement `/choose-app` and the **legacy catch-all redirect** to `/ets/<path>`
   - Build, push, and run the `launcher` container on `commutr-net`
3. **Cutover — gateway change** (this is the single switch-over moment):
   - Replace the temporary `/` block with the final `/` → `launcher` block
   - Add the `/ets` and `/ets/` blocks
   - Deploy the new `ets-web` image and the new gateway together
4. Verify:
   - `/` shows login; an ETS-only user lands on `/ets/` after login
   - An old bookmark like `/bookings/123` redirects to `/ets/bookings/123`
   - Deep link + browser refresh on `/ets/...` works
   - Logout returns to `/` and clears the session

## Phase 4 — Build and deploy CRD

1. CRD team scaffolds `commutr-crd-web` (Vite + React), `base: "/crd/"`, port 5175, proxy config from §9.
2. Install `@commutr/auth`; wrap the app in `<AppGuard appId={APP_IDS.CRD} ...>`; use `createApiClient(API_BASE.crd)`.
3. Add `nginx.conf`, `Dockerfile`, `docker-compose.yml` as in §6.
4. Add the `/crd`, `/crd/` and `/crd-api/` blocks to the gateway (with `CRD_HOST` env) and deploy the gateway **before** the first CRD deploy. The `/crd/` route will return 502 until `crd-web` exists — that is expected; do not link to it yet.
5. Deploy `crd-web`.
6. Enable the CRD card in the launcher's chooser and the app switcher link in both apps' headers.

## Phase 5 — Per-repo CI/CD

1. Add the workflow from §11 to `commutr-ets-web`, `commutr-crd-web`, `commutr-launcher` and `commutr-gateway` (adjust names/paths).
2. Configure secrets per repo: `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`.
3. On EC2, run `docker login ghcr.io` once with a PAT that has `read:packages`.
4. Grant each app repo read access to the `@commutr/auth` package.
5. Enable Renovate or Dependabot in both app repos for `@commutr/*` updates.
6. Protect `main` in each repo; require PR review from that team.

## Phase 6 — Verification checklist

**Routing**
- [ ] `/` → launcher; `/ets` → 301 `/ets/`; `/crd` → 301 `/crd/`
- [ ] Deep links + hard refresh work in all three apps
- [ ] Legacy ETS URLs redirect to `/ets/...`

**Auth / session**
- [ ] ETS-only user → straight to ETS; CRD-only → straight to CRD; both → chooser
- [ ] User with no App IDs sees a message, no redirect loop
- [ ] Switching ETS ↔ CRD does not ask for login again
- [ ] Token refresh works in both apps
- [ ] Logout in either app logs out of both
- [ ] CRD-only user opening `/ets/` is sent back to the launcher

**APIs**
- [ ] Auth calls reach dev-auth; ETS calls reach EtsCore; `/crd-api/*` reaches CrdCore as `/api/*`
- [ ] Tenant is resolved correctly for at least two different tenant domains
- [ ] File uploads work (body size)

**Independence**
- [ ] Deploying `crd-web` causes no errors or reloads in ETS
- [ ] Restarting any app container does not produce 502s on the others
- [ ] Each image works in staging and production without rebuilding (only gateway env differs)

**Caching**
- [ ] `index.html` served with `Cache-Control: no-cache`
- [ ] `/assets/*` served with `immutable`
- [ ] A new deploy is visible after a normal refresh

## Rollback

| What failed | Action |
|---|---|
| An app deploy | On EC2: `cd /opt/commutr/<app> && echo "TAG=<previous-sha>" > .env && docker compose up -d` |
| Gateway change | Same procedure in `/opt/commutr/gateway` with the previous gateway tag |
| Phase 3 cutover | Roll the gateway back to the Phase 2 tag (`/` → `ets-web`) **and** roll `ets-web` back to its pre-`/ets/` tag |
| `@commutr/auth` release | Pin the previous version in the affected app and redeploy; publish a patch |
