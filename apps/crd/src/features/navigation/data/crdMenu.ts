import type { MenuItem } from "@commutr/ui/layout";
import { ROUTES } from "../../../shared/constants/app.constants";

// Static CRD menu (same MenuItem shape ETS receives from its API).
// routeUrl is relative to the router basename (/crd/).
// `icon` is a key from the shared sidebar icon set.
const node = (
  menuId: string,
  menuName: string,
  orderNo: number,
  icon: string,
  routeUrl: string,
  children: MenuItem[] | null = null,
  parentMenuId: string | null = null,
): MenuItem => ({
  menuId,
  menuName,
  parentMenuId,
  orderNo,
  isAssigned: true,
  isShow: true,
  routeUrl,
  icon,
  children,
});

export const CRD_MENU: MenuItem[] = [
  node("dashboard", "Dashboard", 1, "layout-dashboard", "/dashboard"),
  node("booking", "Booking", 2, "car", "", [
    node("booking-create", "Create Booking", 1, "plus-circle", "/bookings/create", null, "booking"),
    node("booking-all", "All Bookings", 2, "grid", "/bookings", null, "booking"),
  ]),
  // System Administration (shared screen from @commutr/system-admin).
  // TODO: hide for non-admin users once CrdCore exposes roles for the signed-in user.
  node("system-admin", "System Administration", 3, "settings", "", [
    node("system-admin-access", "Roles & Permissions", 1, "settings", ROUTES.SYSTEM_ADMIN_ACCESS, null, "system-admin"),
  ]),
];
