import {
  getApps,
  getAppRoute,
  getAppIdForPath,
  readRedirectUrl,
  setToken,
} from "@commutr/shared";
import { switchApp } from "./api";

/** Activate an app (switch-app), store any new token, then full-page navigate. */
export async function enterApp(appId: number, path?: string): Promise<void> {
  const res = await switchApp(appId);
  if (res.accessToken) setToken(res.accessToken);
  window.location.replace(path ?? getAppRoute(appId));
}

export type RouteResult = "no-access" | "choose" | "redirecting";

/**
 * Decide where a logged-in user goes:
 *  0 apps -> "no-access" (no redirect, avoids loops)
 *  ?redirectUrl for an app the user has -> that exact path
 *  1 app -> straight in
 *  2+ apps -> chooser
 */
export async function routeUser(): Promise<RouteResult> {
  const apps = getApps();
  if (apps.length === 0) return "no-access";

  const redirect = readRedirectUrl();
  const wanted = redirect ? getAppIdForPath(redirect) : null;
  if (redirect && wanted !== null && apps.some((a) => a.appId === wanted)) {
    await enterApp(wanted, redirect);
    return "redirecting";
  }

  if (apps.length === 1) {
    await enterApp(apps[0].appId);
    return "redirecting";
  }
  return "choose";
}
