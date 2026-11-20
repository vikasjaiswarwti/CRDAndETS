import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// Served by the gateway under /crd/ (same origin as ETS and the launcher).
export default defineConfig({
  base: "/crd/",
  plugins: [react()],
  // One React/Redux instance for the whole workspace + pre-bundle them up front,
  // so Vite never re-optimizes mid-session (that causes "useState is not defined").
  cacheDir: "node_modules/.vite-crd",
  resolve: { dedupe: ["react", "react-dom", "react-redux", "@reduxjs/toolkit", "react-router-dom"] },
  optimizeDeps: {
    include: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "react-redux", "@reduxjs/toolkit", "@reduxjs/toolkit/query", "@reduxjs/toolkit/query/react", "react-router-dom"],
  },
  
  server: {
    host: "127.0.0.1", // same reason as ETS: avoid IPv6/IPv4 localhost mismatch
    port: 5175,
    strictPort: true,
    proxy: {
      // Mirrors the gateway. Regex key must come first.
      "^/api/v1/(Auth|me|refresh-token|Users/reset-password|Users/check-exists|Users/change-password)":
        {
          target: "https://dev-auth.commutr.in",
          changeOrigin: true,
          secure: false,
        },
      // Browser calls /crd-api/...; CrdCore receives /api/...
      // TODO: confirm CrdCore host + base path (Phase 0).
      "/crd-api": {
        target: "https://dev-crd.commutr.in",
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/crd-api/, "/api"),
      },
    },
  },
  build: { outDir: "dist", sourcemap: true },
});
