// Shape of a menu entry used by the shared sidebar.
// ETS gets it from GET /api/v1/Users/user-menu; CRD supplies a static list.
// routeUrl has a leading slash and is relative to the app's router basename.
// `icon` is a key into the sidebar ICONS map (e.g. "layout-dashboard", "car").
export interface MenuItem {
  menuId: string;
  menuName: string;
  parentMenuId: string | null;
  orderNo: number;
  isAssigned: boolean;
  routeUrl: string;
  icon: string;
  children: MenuItem[] | null;
  isShow: boolean;
}
