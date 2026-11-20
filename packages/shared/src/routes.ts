// Cross-app URL contract. All values are absolute and independent of any app's
// Vite `base` / router basename.

export const APP_IDS = { ETS: 1, CRD: 2 } as const;

export const APP_ROUTES = {
  launcher: "/",
  chooser: "/choose-app",
  ets: "/ets/",
  crd: "/crd/",
} as const;

/** Landing path for an app id, or the launcher chooser if unknown. */
export const getAppRoute = (appId: number): string =>
  appId === APP_IDS.ETS
    ? APP_ROUTES.ets
    : appId === APP_IDS.CRD
      ? APP_ROUTES.crd
      : APP_ROUTES.chooser;

/** App id that owns a path (/ets/... -> 1, /crd/... -> 2), else null. */
export const getAppIdForPath = (path: string): number | null =>
  path.startsWith(APP_ROUTES.ets)
    ? APP_IDS.ETS
    : path.startsWith(APP_ROUTES.crd)
      ? APP_IDS.CRD
      : null;

/**
 * True when the page is served under /ets/ or /crd/ (behind the gateway).
 * Uses the URL, not import.meta.env, so it works from inside a library.
 */
export const isSubPathApp = (): boolean =>
  getAppIdForPath(window.location.pathname) !== null;

/**
 * Only same-origin paths inside a known app are valid post-login targets.
 * Prevents open redirects via ?redirectUrl=https://evil.example.
 */
export const isSafeRedirect = (url: string | null | undefined): url is string =>
  !!url &&
  url.startsWith("/") &&
  !url.startsWith("//") &&
  !url.includes("\\") &&
  getAppIdForPath(url) !== null;

/**
 * Where an unauthenticated / logged-out user must be sent.
 *  - Standalone (localhost dev at "/"): the app's own /login.
 *  - Under /ets/ or /crd/: the launcher, which owns login.
 * withRedirect appends ?redirectUrl=<current path> for "session missing"
 * redirects (not for an explicit logout).
 */
export const getLoginUrl = (withRedirect = false): string => {
  if (!isSubPathApp()) return "/login";
  if (!withRedirect) return APP_ROUTES.launcher;

  const current = window.location.pathname + window.location.search;
  return isSafeRedirect(current)
    ? `${APP_ROUTES.launcher}?redirectUrl=${encodeURIComponent(current)}`
    : APP_ROUTES.launcher;
};

/** Reads and validates ?redirectUrl= from the current URL. */
export const readRedirectUrl = (): string | null => {
  const url = new URLSearchParams(window.location.search).get("redirectUrl");
  return isSafeRedirect(url) ? url : null;
};
