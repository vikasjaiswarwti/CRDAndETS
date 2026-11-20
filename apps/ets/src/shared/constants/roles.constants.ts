// src/shared/constants/roles.constants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Only file to edit when adding a new role.
//
// To add a new role:
//   1. Add its lowercase slug to ROLE_PRIORITY_ORDER at the right position
//   2. Add its label to ROLE_LABEL_MAP
//   3. Register its dashboard component in dashboardRegistry.ts
//   ← nothing else changes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * First match wins when a user holds multiple roles.
 * Lower index = higher priority.
 *
 * The backend sends roles with any casing ("Vendor", "Employee").
 * resolveActiveRole() lowercases before comparing so casing never matters here.
 */
export const ROLE_PRIORITY_ORDER = [
  "admin",
  "supervisor",
  "transport manager",
  "manager",
  "employee",
  "vendor",
] as const;

export type AppRole = (typeof ROLE_PRIORITY_ORDER)[number];

export const ROLE_LABEL_MAP: Record<string, string> = {
  admin: "Administrator",
  supervisor: "Supervisor",
  "transport manager": "Transport Manager",
  manager: "Manager",
  employee: "Employee",
  vendor: "Vendor",
};

/**
 * Pure function — no side effects, safe to call anywhere.
 *
 * Takes the raw roles array from the API (any casing), returns the
 * highest-priority role slug in lowercase, or null if nothing matches.
 *
 * @example
 * resolveActiveRole(["Vendor"])             // → "vendor"
 * resolveActiveRole(["Vendor","Employee"])  // → "employee"  (higher priority)
 * resolveActiveRole([])                     // → null
 */
export const resolveActiveRole = (apiRoles: string[]): string | null => {
  if (!apiRoles.length) return null;

  const normalised = apiRoles.map((r) => r.toLowerCase());

  // Walk priority list top-to-bottom, return first match
  const match = ROLE_PRIORITY_ORDER.find((p) => normalised.includes(p));

  // Graceful fallback: unrecognised role → use first role from API
  return match ?? normalised[0] ?? null;
};
