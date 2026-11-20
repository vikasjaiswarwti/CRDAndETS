// Framework-agnostic token store (no React, no Redux).
// Same-origin apps (/, /ets/, /crd/) read and write the same key.

export const TOKEN_KEY = "commutr_access_token";

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // storage unavailable (private mode / blocked) — ignore
  }
};

export const clearToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
};

/**
 * Fires when ANOTHER tab changes the token (the `storage` event never fires in
 * the tab that made the change). newToken === null means it was cleared (logout).
 */
export const onTokenChange = (
  cb: (newToken: string | null, oldToken: string | null) => void,
): (() => void) => {
  const handler = (e: StorageEvent) => {
    if (e.key === TOKEN_KEY) cb(e.newValue, e.oldValue);
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
};
