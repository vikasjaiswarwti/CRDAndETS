import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// Launcher: login + app chooser, served at "/".
//
// In dev this server also acts as the GATEWAY (mirrors the Nginx gateway) so
// that "/", "/ets/" and "/crd/" share ONE origin (localhost:5173) and therefore
// share the token in localStorage. Run everything with `npm run dev:stack`.
const ETS_DEV = "http://127.0.0.1:3000";
const CRD_DEV = "http://127.0.0.1:5175";

// Dev target for CrdCore APIs (/crd-api/* -> /api/*). The real CrdCore host does not exist yet
// ("dev-crd.commutr.in" does not resolve), so in LOCAL DEV this defaults to the EtsCore dev
// server, which already serves RoleManagement / Menu / RoleMenuMapping / Permissions.
// => in dev, CRD screens show EtsCore data. Set CRD_API_TARGET=https://<real-crd-host> to change.
const CRD_API_TARGET = process.env.CRD_API_TARGET ?? "https://dev-core.commutr.in";

export default defineConfig({
  base: "/",
  plugins: [react()],
  // One React/Redux instance for the whole workspace + pre-bundle them up front,
  // so Vite never re-optimizes mid-session (that causes "useState is not defined").
  cacheDir: "node_modules/.vite-auth",
  resolve: { dedupe: ["react", "react-dom", "react-router-dom"] },
  optimizeDeps: {
    include: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "react-router-dom"],
  },
  
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // ── Frontend apps (must be running via dev:stack) ──
      "/ets": { target: ETS_DEV, changeOrigin: true, ws: true },
      "/crd/": { target: CRD_DEV, changeOrigin: true, ws: true },
      "/crd": { target: CRD_DEV, changeOrigin: true, ws: true },

      // ── APIs (same order/rules as the gateway; regex key first) ──
      "^/api/v1/(Auth|me|refresh-token|Users/reset-password|Users/check-exists|Users/change-password)":
        {
          target: "https://dev-auth.commutr.in",
          changeOrigin: true,
          secure: false,
        },
      // Browser calls /crd-api/...; CrdCore receives /api/...
      "/crd-api": {
        target: CRD_API_TARGET,
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/crd-api/, "/api"),
      },
      "/hubs": {
        target: "https://dev-core.commutr.in",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      "/api": {
        target: "https://dev-core.commutr.in",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: { outDir: "dist", sourcemap: true },
});
