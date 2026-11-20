// src/features/dashboard/registry/dashboardRegistry.ts
// ─────────────────────────────────────────────────────────────────────────────
// Role slug → Dashboard component.
// Open/Closed: add ONE entry here for each new role. Nothing else changes.
// Keys must be LOWERCASE — they match the normalised roles from the API.
// ─────────────────────────────────────────────────────────────────────────────

import { lazy, type ComponentType } from "react";

export const DASHBOARD_REGISTRY: Record<string, ComponentType> = {
  admin: lazy(() => import("../../features/dashboard/admin/AdminDashboard")),
  //   supervisor: lazy(() => import("../supervisor/SupervisorDashboard")),
  employee: lazy(
    () => import("../../features/dashboard/user/EmployeeDashboard"),
  ),
  "transport manager": lazy(
    () => import("../../features/dashboard/admin/AdminDashboard"),
  ),
  vendor: lazy(() => import("../../features/dashboard/admin/AdminDashboard")),
  escort: lazy(() => import("../../features/dashboard/escort/EscortDashboard")),
  "ltr admin": lazy(
    () => import("../../features/pocforqr/pages/VendorManagementPage"),
  ),
};

/**
 * Returns the dashboard component for the active role.
 * Falls back to EmployeeDashboard — never returns undefined.
 */
export const resolveDashboardComponent = (
  activeRole: string | null,
): ComponentType => {
  // console.log(activeRole, "activeRole")
  if (activeRole && DASHBOARD_REGISTRY[activeRole]) {
    return DASHBOARD_REGISTRY[activeRole];
  }
  if (import.meta.env.DEV && activeRole) {
    console.warn(
      `[dashboardRegistry] No dashboard for role "${activeRole}". Using EmployeeDashboard fallback.`,
    );
  }
  return DASHBOARD_REGISTRY["employee"];
};
