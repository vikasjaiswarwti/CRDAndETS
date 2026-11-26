// CRD app constants.

/** Prefix for every app-private localStorage key ("crd:<key>"). Never change. */
export const APP_KEY = "crd";

/** Browser calls /crd-api/...; the gateway rewrites it to CrdCore's /api/... */
export const CRD_API_BASE = "/crd-api";

/** Identity (login / me / refresh / switch-app) is served at /api/v1/... */
export const AUTH_API_BASE = "";

export const ROUTES = {
  DASHBOARD: "/dashboard",
  BOOKINGS: "/bookings",
  CREATE_BOOKING: "/bookings/create",
  SYSTEM_ADMIN_ACCESS: "/system-administration/access",
} as const;

