// src/features/routeManagement/hooks/useRoutePermissions.ts
//
// Central hook that resolves what the current user can do in Route Management.
//
// HOW TO USE:
//   const permissions = useRoutePermissions();
//   // Then pass to tables, action dropdowns, etc.
//
// HOW TO ADD ROLES:
//   1. Get the user's role from your auth store (useSelector, useAuth, etc.)
//   2. Add a case in getPermissionsForRole()
//   3. Done — all components auto-adapt because they read permissions, not roles.
//
// HOW TO MAKE IT ROLE-DRIVEN (future):
//   Replace `const role = "ADMIN"` with `const { role } = useSelector(selectCurrentUser)`

import {
  FULL_ACCESS_PERMISSIONS,
  READ_ONLY_PERMISSIONS,
} from "../constants/RouteConstants";
import type { RouteManagementPermissions } from "../types/RouteTypes";

// Extend this union as your backend defines more roles
type UserRole = "ADMIN" | "MANAGER" | "VIEWER" | "OPERATOR";

function getPermissionsForRole(role: UserRole): RouteManagementPermissions {
  switch (role) {
    case "ADMIN":
      return FULL_ACCESS_PERMISSIONS;

    case "MANAGER":
      return {
        ...FULL_ACCESS_PERMISSIONS,
        canDeleteRoutes: false, // managers can't delete
      };

    case "OPERATOR":
      return {
        ...FULL_ACCESS_PERMISSIONS,
        canDeleteRoutes: false,
        canCopyRoutes: false,
        canUploadVehicleFile: false,
      };

    case "VIEWER":
      return READ_ONLY_PERMISSIONS;

    default:
      return READ_ONLY_PERMISSIONS;
  }
}

export function useRoutePermissions(): RouteManagementPermissions {
  // ── Swap this line when auth store is ready ──────────────────────────────
  // const role = useSelector(selectCurrentUser)?.role as UserRole ?? "VIEWER";
  const role: UserRole = "ADMIN"; // hardcoded until auth is wired up
  // ────────────────────────────────────────────────────────────────────────

  return getPermissionsForRole(role);
}
