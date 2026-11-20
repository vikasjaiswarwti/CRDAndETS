// Namespaced localStorage for app-specific persistence.
//
// ETS, CRD and auth share ONE origin, therefore ONE localStorage. Any key that
// is not intentionally shared must be prefixed with the app name so apps can
// never read or overwrite each other's data:
//
//   shared on purpose (see tokenStore / appsStore):  commutr_access_token, commutr_apps
//   app-private (this helper):                       crd:<key>, ets:<key>, ...
//
// Values are JSON. All access is try/catch-guarded (private mode, quota, etc.).

export interface AppStorage {
  get<T>(key: string, fallback: T): T;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  /** Remove every key that belongs to this app (call on logout). */
  clear(): void;
}

export const createAppStorage = (appKey: string): AppStorage => {
  const prefix = `${appKey}:`;

  return {
    get<T>(key: string, fallback: T): T {
      try {
        const raw = localStorage.getItem(prefix + key);
        return raw === null ? fallback : (JSON.parse(raw) as T);
      } catch {
        return fallback;
      }
    },
    set<T>(key: string, value: T): void {
      try {
        localStorage.setItem(prefix + key, JSON.stringify(value));
      } catch {
        // storage unavailable or full — ignore
      }
    },
    remove(key: string): void {
      try {
        localStorage.removeItem(prefix + key);
      } catch {
        // ignore
      }
    },
    clear(): void {
      try {
        Object.keys(localStorage)
          .filter((k) => k.startsWith(prefix))
          .forEach((k) => localStorage.removeItem(k));
      } catch {
        // ignore
      }
    },
  };
};
