// // src/shared/types/menu.types.ts

// export interface MenuItem {
//   menuId: number;
//   menuName: string;
//   parentMenuId: number | null;
//   orderNo: number;
//   isAssigned: boolean;
//   routeUrl: string | null;
//   icon: string | null; // Ant Design icon name as string
//   children: MenuItem[] | null;
// }

// // API Response wrapper type (if needed)
// export interface MenuApiResponse {
//   data: MenuItem[];
//   success: boolean;
//   message?: string;
// }

// // For single menu item response
// export interface MenuItemApiResponse {
//   data: MenuItem;
//   success: boolean;
//   message?: string;
// }

import type { MenuItem } from "@commutr/ui/layout";
export type { MenuItem };

// src/shared/types/navigation.types.ts
// ─────────────────────────────────────────────────────────────────────────────
// Exact shape of GET /api/v1/Users/user-menu.
// Field names match the JSON exactly — never rename here.
//
// NOTE: routeUrl from the backend has NO leading slash.
//   e.g. "fleet/vendor", "account/office"
// routeUtils.ts normalises them to "/fleet/vendor" before registering routes.
// ─────────────────────────────────────────────────────────────────────────────


/**
 * Raw envelope from GET /api/v1/Users/user-menu
 * Both menus AND roles come from this single endpoint.
 */
export interface UserMenuApiResponse {
  menus: MenuItem[];
  roles: string[]; // e.g. ["Vendor"], ["Employee"], ["Admin", "Supervisor"]
}
