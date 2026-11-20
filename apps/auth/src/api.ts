import { getTenant as sharedGetTenant, getToken, type AppInfo } from "@commutr/shared";

const getTenant = () =>
  sharedGetTenant((import.meta.env.VITE_X_TENENT_ID as string) ?? "");

export interface LoginResponse {
  accessToken: string;
  user?: { name?: string; email?: string; [k: string]: unknown };
  roles?: string[];
  accessAppId?: string;
  apps?: AppInfo[];
}

// Response shape not confirmed yet - accessToken treated as optional.
export interface SwitchAppResponse {
  accessToken?: string;
}

async function post<T>(path: string, body: unknown, withAuth: boolean): Promise<T> {
  const headers = new Headers({
    "Content-Type": "application/json",
    "X-Tenant": getTenant(),
  });
  const token = getToken();
  if (withAuth && token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(path, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    credentials: "include",
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const b = await res.json();
      message = b?.detail ?? b?.title ?? b?.message ?? message;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(message);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : {}) as T;
}

export const login = (userName: string, password: string) =>
  post<LoginResponse>("/api/v1/Auth/login", { userName, password }, false);

export const switchApp = (appId: number) =>
  post<SwitchAppResponse>("/api/v1/Auth/switch-app", { appId }, true);
