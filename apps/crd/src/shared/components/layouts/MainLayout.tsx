// CRD page chrome = the SAME shell as ETS (@commutr/ui AppShell). CRD only
// supplies data from its own store: menu, sidebar state, user, handlers.
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppShell,
  AppHeader,
  OrgBadge,
  type HeaderMenuItem,
} from "@commutr/ui/layout";
import { useAppDispatch, useAppSelector } from "../../../app/store";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import {
  selectCollapsed,
  selectMenus,
  selectNavLoading,
  toggleCollapsed,
} from "../../../features/navigation/slices/navigationSlice";
import { ROUTES } from "../../constants/app.constants";

export const MainLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const menus = useAppSelector(selectMenus);
  const collapsed = useAppSelector(selectCollapsed);
  const isLoading = useAppSelector(selectNavLoading);
  const { user, otherApps, handleLogout, handleSwitchApp } = useAuth();

  const userMenuItems: HeaderMenuItem[] = [
    ...otherApps.map((a) => ({
      key: `switch-app-${a.appId}`,
      label: `Switch to ${a.appName}`,
      onClick: () => {
        handleSwitchApp(a.appId).catch(() => {});
      },
    })),
    ...(otherApps.length ? [{ type: "divider" as const, key: "divider-1" }] : []),
    { key: "logout", label: "Logout", danger: true, onClick: handleLogout },
  ];

  return (
    <AppShell
      menu={menus}
      isMenuLoading={isLoading}
      collapsed={collapsed}
      onToggleCollapsed={() => dispatch(toggleCollapsed())}
      pathname={pathname}
      navigate={navigate}
      homePath={ROUTES.DASHBOARD}
      header={
        <AppHeader
          left={<OrgBadge name="Corporate Car Rental" />}
          userName={user?.name ?? user?.email}
          userMenuItems={userMenuItems}
        />
      }
    >
      <Outlet />
    </AppShell>
  );
};
