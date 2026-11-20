// src/shared/components/layouts/MainLayout/MainLayout.tsx
// ETS wrapper around the shared shell (@commutr/ui AppShell).
// Owns ETS-only concerns: Redux menu/sidebar state, DPDPA consent, and the
// fullscreen routes that skip the shell. All presentation is in the package.

import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppShell } from "@commutr/ui/layout";
import { Header } from "../Header/Header";
import { useNavigation } from "../../../../features/navigation/hooks/useNavigation";
import { useSidebarAutoCollapse } from "../../../customHooks/useSidebarAutoCollapse";
import { MobileHeader } from "../Header/MobileHeader";
import { MobileActionsDrawer } from "../Header/MobileActionsDrawer";
import { useAppSelector } from "../../../../app/store";
import { selectCurrentUser } from "../../../../features/auth/slices/authSlice";
import { selectVisibleMenus } from "../../../../features/navigation/slices/navigationSlice";
import {
  DpdpaConsent,
  hasDpdpaConsent,
} from "../../../../features/auth/components/DpdpaConsent";
import { useGetApplicationConfigurationQuery } from "../../../../features/new-app-control/services/Appcontrolapi";

const FULLSCREEN_PATHS = [
  "/routing/route-maker",
  "/routing/route-tracking",
  "/routing/security",
  "/routing/shuttle-tracking",
  "/routing/track-shift",
  "/routing/multiple-trip-view",
  "/routing/trip-life-cycle",
];

export const MainLayout: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const currentUser = useAppSelector(selectCurrentUser);
  const menuItems = useAppSelector(selectVisibleMenus);
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);
  const hasStoredConsent = hasDpdpaConsent();
  const { data: applicationConfiguration } =
    useGetApplicationConfigurationQuery(
      { LocCode: 1 },
      { skip: !currentUser || hasStoredConsent },
    );

  // ── ALL hooks must be called unconditionally, before any early returns ────
  useSidebarAutoCollapse();
  const { collapsed, toggleSidebar, isLoading, isHydrated } = useNavigation();

  const isFullscreen = FULLSCREEN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  const isConsent = applicationConfiguration?.BasicSetting?.IsDPDPA === true;

  if (currentUser && isConsent && !hasStoredConsent) {
    return <DpdpaConsent />;
  }

  // ── Fullscreen mode — bare canvas, no sidebar ─────────────────────────────
  if (isFullscreen) {
    return (
      <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
        <Outlet />
      </div>
    );
  }

  return (
    <AppShell
      menu={menuItems}
      isMenuLoading={isLoading || !isHydrated}
      collapsed={collapsed}
      onToggleCollapsed={toggleSidebar}
      pathname={pathname}
      navigate={navigate}
      homePath="/dashboard"
      header={<Header />}
      renderMobileHeader={(openNav) => (
        <>
          <MobileActionsDrawer
            open={mobileActionsOpen}
            onClose={() => setMobileActionsOpen(false)}
          />
          <MobileHeader
            onMenuClick={openNav}
            onActionsClick={() => setMobileActionsOpen(true)}
          />
        </>
      )}
    >
      <Outlet />
    </AppShell>
  );
};
