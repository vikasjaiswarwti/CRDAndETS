import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc"; // ✅ SWC plugin
// import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // URL prefix this app is served under.
  //   unset / "/"  -> standalone (current behaviour, served at root)
  //   "/ets/"      -> served by the gateway under /ets/ (multi-app setup)
  // Must start and end with "/". Also exposed to code as import.meta.env.BASE_URL.
  const base = env.VITE_APP_BASE || "/";

  return {
    base,
    plugins: [react(), tailwindcss()],
    // resolve: {
    //   alias: {
    //     "@": path.resolve(__dirname, "./src"),
    //   },
    // },

    // One React/Redux instance for the whole workspace + pre-bundle them up front,
    // so Vite never re-optimizes mid-session (that causes "useState is not defined").
    cacheDir: "node_modules/.vite-ets",
    resolve: { dedupe: ["react", "react-dom", "react-redux", "@reduxjs/toolkit", "react-router-dom"] },
    optimizeDeps: {
      include: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "react-redux", "@reduxjs/toolkit", "@reduxjs/toolkit/query", "@reduxjs/toolkit/query/react", "react-router-dom"],
    },
    
    server: {
      // Explicit IPv4: the launcher proxies to 127.0.0.1:3000. "localhost" can resolve to
      // ::1 on Windows/Node 17+ and the proxy then times out (ETIMEDOUT).
      host: "127.0.0.1",
      port: 3000,
      strictPort: true, // fail loudly instead of silently moving to 3001 (the launcher proxies to 3000)
      proxy: {
        "^/api/v1/(Auth|me|refresh-token|Users/reset-password|Users/check-exists|Users/change-password)":
          {
            target: "https://dev-auth.commutr.in",
            // target: "https://identity.commutr.in",
            changeOrigin: true,
            secure: false,
          },
        "/api": {
          target: "https://dev-core.commutr.in",
          // target: "https://core.commutr.in",
          changeOrigin: true,
          secure: false,
        },
      },
    },

    build: {
      outDir: "dist",
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-redux", "@reduxjs/toolkit"],
            router: ["react-router-dom"],
          },
        },
        onwarn(warning, warn) {
          // Suppress the @microsoft/signalr pure annotation warnings
          if (
            warning.code === "INVALID_ANNOTATION" &&
            warning.id?.includes("@microsoft/signalr")
          ) {
            return;
          }
          warn(warning);
        },
      },
    },
  };
});
