// Apps the logged-in user can access (from the login response `apps` array).
// Framework-agnostic, same-origin shared across / , /ets/ , /crd/.
// Written by the launcher (or standalone ETS login); read by the app switcher
// and the per-app guard.

export interface AppInfo {
  appId: number;
  appName: string;
  refreshTokenType?: number;
}

export const APPS_KEY = "commutr_apps";

export const getApps = (): AppInfo[] => {
  try {
    const raw = localStorage.getItem(APPS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as AppInfo[]) : [];
  } catch {
    return [];
  }
};

export const setApps = (apps: AppInfo[] | undefined | null): void => {
  try {
    localStorage.setItem(APPS_KEY, JSON.stringify(apps ?? []));
  } catch {
    // storage unavailable — ignore
  }
};

export const clearApps = (): void => {
  try {
    localStorage.removeItem(APPS_KEY);
  } catch {
    // ignore
  }
};

/**
 * True when the stored list is known and does NOT include appId.
 * An empty/unknown list returns false so we never lock out a user whose apps
 * were not stored (e.g. session created before this change).
 */
export const lacksAppAccess = (appId: number): boolean => {
  const apps = getApps();
  return apps.length > 0 && !apps.some((a) => a.appId === appId);
};
