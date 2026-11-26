# Commutr UI — Monorepo & Deployment Guide

Turborepo monorepo containing the Commutr frontends, deployed on a single EC2
host as independent Docker containers behind an nginx gateway.

- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Multi-tenancy](#multi-tenancy)
- [Local development](#local-development)
- [Deploying to EC2](#deploying-to-ec2)
- [Redeploying one app](#redeploying-one-app)
- [Gateway routing](#gateway-routing)
- [Performance notes](#performance-notes)
- [Troubleshooting](#troubleshooting)
- [Known gaps / next steps](#known-gaps--next-steps)

## Architecture

```
Browser ──► :80  gateway (nginx)
                  ├─ /          → launcher  (login + app chooser)   apps/auth
                  ├─ /ets/      → ets-web   (ETS app)               apps/ets
                  ├─ /crd/      → crd-web   (CRD app)               apps/crd
                  ├─ /api/v1/(Auth|me|refresh-token|Users/...)  → Auth API
                  ├─ /api/      → EtsCore API
                  ├─ /hubs/     → EtsCore SignalR (WebSocket)
                  └─ /crd-api/  → CrdCore API  (rewritten to /api/)
```

- Every app is a **static build** served by its own nginx container.
- Only the **gateway** publishes a host port (80). `launcher`, `ets-web` and
  `crd-web` are reachable only inside the Docker network `commutr-net`, by
  container name.
- All apps share **one origin**, so the login token in `localStorage` is shared.
- This is route-level micro-frontends in a monorepo: independent build, image
  and deploy per app; shared code lives in `packages/` and is resolved at build
  time (no runtime module federation).

| Container  | Image               | Built from                               | Served at |
|------------|---------------------|------------------------------------------|-----------|
| `gateway`  | `commutr-gateway`   | `apps/auth/infra/gateway/Dockerfile`     | `:80`     |
| `launcher` | `commutr-launcher`  | `apps/auth/infra/launcher/Dockerfile`    | `/`       |
| `ets-web`  | `commutr-ets-web`   | `apps/ets/infra/ets-web/Dockerfile`      | `/ets/`   |
| `crd-web`  | `commutr-crd-web`   | `apps/crd/Dockerfile`                    | `/crd/`   |

## Repository layout

```
apps/
  auth/                 launcher (login + app chooser), Vite base "/"
    infra/gateway/      gateway Dockerfile + nginx template
    infra/launcher/     launcher Dockerfile + nginx.conf
  ets/                  ETS app, Vite base "/ets/"
    infra/ets-web/      Dockerfile + nginx.conf
  crd/                  CRD app, Vite base "/crd/"
packages/
  shared/               @commutr/shared (tenant helper, auth core, ...)
  ui/                   @commutr/ui
turbo.json
.dockerignore
```

Root scripts: `npm run dev:stack`, `build:ets`, `build:crd`, `build:auth`.

## Multi-tenancy

One deployment serves **all corporates**. The tenant is resolved at runtime from
the hostname in [packages/shared/src/tenant.ts](packages/shared/src/tenant.ts):

```ts
hostname === "localhost" ? devTenant : hostname.split(".")[0]
```

`acme.commutr.in` sends `X-Tenant: acme`. `VITE_X_TENENT_ID` is only used on
localhost. Consequences:

- Never build or run a container per corporate.
- A new corporate needs DNS (`<tenant>.commutr.in`) and a backend tenant record,
  not a frontend deployment.
- The backend tenant id must equal the subdomain exactly.
- Use a **wildcard DNS record** (`*.commutr.in`) and a **wildcard certificate**.

## Local development

```bash
npm ci
npm run dev:stack     # launcher :5173, ETS :3000, CRD :5175 on one origin
```

The auth dev server (`localhost:5173`) proxies `/ets`, `/crd` and the APIs the
same way the production gateway does.

## Deploying to EC2

### 1. Prerequisites

- EC2 instance (Linux), security group allowing inbound **80** (and **443** if
  TLS terminates on the instance), SSH from your IP only.
- Docker installed, and the user in the `docker` group.
- Port 80 free on the host (nothing else bound to it).

```bash
docker network create commutr-net
git clone <repo-url> && cd <repo>
```

### 2. Create the ETS env file on the server

`.env` files are gitignored. Vite bakes `VITE_*` values into the JavaScript at
**build time**, so create `apps/ets/.env.production` on the server before
building. Use same-origin API paths (for example `VITE_API_BASE_URL_SIGNALR=""`)
so the browser calls the gateway, not the backends directly.

### 3. Build the images (always from the repo root)

```bash
docker build -f apps/ets/infra/ets-web/Dockerfile --build-arg VITE_APP_BASE=/ets/ -t commutr-ets-web .
docker build -f apps/crd/Dockerfile -t commutr-crd-web .
docker build -f apps/auth/infra/launcher/Dockerfile -t commutr-launcher .
docker build -f apps/auth/infra/gateway/Dockerfile -t commutr-gateway apps/auth/infra/gateway
```

The three app Dockerfiles use the **repo root** as build context because the apps
depend on `packages/*`. The ETS build takes about 4 minutes.

### 4. Run

```bash
docker run -d --name ets-web  --network commutr-net --restart unless-stopped --cpu-shares 2048 commutr-ets-web
docker run -d --name crd-web  --network commutr-net --restart unless-stopped --cpu-shares 2048 commutr-crd-web
docker run -d --name launcher --network commutr-net --restart unless-stopped --cpu-shares 2048 commutr-launcher
docker run -d --name gateway  --network commutr-net -p 80:80 --restart unless-stopped --cpu-shares 2048 \
  -e AUTH_HOST=dev-auth.commutr.in \
  -e CORE_HOST=dev-core.commutr.in \
  -e CRD_HOST=dev-crd.commutr.in \
  commutr-gateway
```

### 5. Verify

```bash
curl -I http://127.0.0.1/healthz      # 200 ok (gateway)
curl -I http://127.0.0.1/             # launcher
curl -I http://127.0.0.1/ets/         # ETS
curl -I http://127.0.0.1/crd/         # CRD
```

## Redeploying one app

Only the app that changed needs a rebuild. The others keep running.

```bash
git pull

# example: CRD only
docker build -f apps/crd/Dockerfile -t commutr-crd-web .
docker rm -f crd-web
docker run -d --name crd-web --network commutr-net --restart unless-stopped --cpu-shares 2048 commutr-crd-web
docker restart gateway          # re-resolve the replaced container
```

Rebuild the gateway (fast, no Node build) only when
`apps/auth/infra/gateway/templates/default.conf.template` changes. If
`packages/ui` or `packages/shared` change, rebuild every app that depends on them.

## Gateway routing

Config: [default.conf.template](apps/auth/infra/gateway/templates/default.conf.template).
`AUTH_HOST`, `CORE_HOST` and `CRD_HOST` are substituted at container start via
envsubst (see `NGINX_ENVSUBST_FILTER` in the gateway Dockerfile).

- Proxy targets use `set $var` + `proxy_pass $var` with a resolver, so nginx
  re-resolves names and does not fail to start if a container is briefly absent.
- `/hubs/` carries SignalR WebSockets (upgrade headers, 1-hour timeouts,
  buffering off).
- `client_max_body_size 50m` allows Excel/document uploads.
- The gateway **gzips** responses. See the next section for why.

### TLS

The gateway itself speaks HTTP on port 80. For HTTPS either terminate TLS in
front of it (load balancer or CDN with a wildcard cert) or put a certificate on
the host and proxy to the gateway. If the gateway runs behind a host nginx,
bind it to localhost instead (`-p 127.0.0.1:8090:80`) and proxy to that port,
forwarding `Upgrade`/`Connection` headers for SignalR.

## Performance notes

- **Gzip is done at the gateway.** The gateway reaches upstreams over HTTP/1.0
  (the nginx proxy default), and nginx skips gzip for HTTP/1.0 requests, so gzip
  in the app containers never runs. Compressing at the gateway cut the main ETS
  bundle from 2.76 MB to about 0.75 MB. The app nginx configs also enable gzip,
  which helps only if the app container is ever hit directly.
- Hashed files under `/ets/assets/` and `/crd/assets/` are served
  `Cache-Control: public, max-age=31536000, immutable`. `index.html` is
  `no-cache`, so a deploy is picked up on the next load.
- Production builds ship source maps (about 10 MB for ETS and CRD each). The
  browser only fetches them with DevTools open; consider turning off
  `build.sourcemap` to shrink images.
- Main bundles are about 2.5–2.7 MB before compression. Code-splitting heavy
  libraries is the main lever if first load is still slow.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `port is already allocated` on `-p 80:80` | Something else binds 80 | `sudo ss -ltnp \| grep ':80 '`; stop it, or bind the gateway to `127.0.0.1:8090` behind a host nginx |
| Container name already in use | Failed/old container holds the name | `docker rm -f <name>` |
| ETS/CRD build: `COPY ... not found` | Build run from the app folder | Build from the **repo root** with `-f` |
| ETS build: `TS18003 No inputs were found ... tsconfig.node.json` | `apps/ets/vite.config.ts` was gitignored and missing on the server | It is now tracked; `git pull` |
| Welcome page instead of the app at the domain | Domain points to another server or load balancer | Compare `nslookup <domain>` with the instance public IP |
| Timeout from the internet | Security group blocks 80 | Allow inbound HTTP |
| Gzip test shows no encoding | `curl -I` sends HEAD, which is never compressed; or HTTP/1.0 upstream | Test with a GET: `curl -s -o /dev/null -D - -H "Accept-Encoding: gzip" <url>` |
| `ets-web`/`crd-web` exit (137 / 0) | Stopped externally, not an nginx crash | `docker start`, check `docker logs` |
| Slow page, stuck cursor, "Aw, Snap!" | Host memory/CPU pressure, or a browser-side loop | `free -m`, `docker stats`; check the browser console and `chrome://crashes` |

Host health checks:

```bash
free -m
uptime
docker stats --no-stream | sort -k3 -h | tail
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
docker logs --tail 50 <container>
```

The EC2 host also runs backend services (Kafka, Grafana, Prometheus, APIs).
Memory is tight and swap is in use. One container (kafka-ui) was observed using
about 3 GB and 4,000 threads; capping it (`docker update --cpus 1 kafka-ui`) or
moving the frontends to their own instance removes the contention.

## Known gaps / next steps

- **HTTPS** is not configured on the instance itself.
- **No CI/CD.** Deploys are manual: a GitHub Actions workflow could SSH in and
  run the pull / build / run steps, or build and push images to a registry
  (the `docker-compose.yml` files reference `ghcr.io/<org>/...` placeholders).
- **One-command deploy script** (`deploy.sh` that rebuilds a single app).
- **Bundle size:** code-split large dependencies; drop production source maps.
- **Monitoring:** health checks on the app containers and restart alerts.
