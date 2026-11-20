import { lazy } from "react";
import type { ComponentType } from "react";

const RELOAD_KEY = "chunk_reload_at";

export const lazyWithRetry = (
  factory: () => Promise<{ default: ComponentType<any> }>,
) =>
  lazy(() =>
    factory().catch((err: unknown) => {
      const lastReload = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);

      if (Date.now() - lastReload > 30_000) {
        sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
        window.location.reload();
        return new Promise<never>(() => {});
      }

      // Already reloaded recently and still failing — genuine error
      throw err;
    }),
  );
