// The shared Commutr page shell: sidebar + header + content area.
//
// Props-driven on purpose — it reads NO Redux store, calls NO API and imports
// nothing from any app. Each app supplies:
//   menu / isMenuLoading   what to show in the sidebar
//   collapsed / onToggle   sidebar state (Redux in ETS, useState in CRD)
//   pathname / navigate    from its router
//   header / mobileHeader  its top bar (usually <AppHeader .../>)
//   children               the page content (usually <Outlet />)

import React, { useMemo, useState } from "react";
import { T } from "../tokens";
import { Sidebar } from "./Sidebar";
import { MobileSidebarDrawer } from "./MobileSidebarDrawer";
import { ShellNavProvider } from "./navContext";
import { useIsMobile } from "./useIsMobile";
import type { MenuItem } from "./menu.types";

export interface AppShellProps {
  menu: MenuItem[];
  isMenuLoading?: boolean;

  collapsed: boolean;
  onToggleCollapsed: () => void;

  pathname: string;
  navigate: (to: string) => void;

  /** Desktop top bar. */
  header: React.ReactNode;
  /** Mobile top bar; receives a callback that opens the nav drawer. */
  renderMobileHeader?: (openNav: () => void) => React.ReactNode;

  /** Where the logo click goes (default "/"). */
  homePath?: string;
  logoFull?: string;
  logoCollapsed?: string;
  versionLabel?: string;

  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  menu,
  isMenuLoading = false,
  collapsed,
  onToggleCollapsed,
  pathname,
  navigate,
  header,
  renderMobileHeader,
  homePath = "/",
  logoFull,
  logoCollapsed,
  versionLabel,
  children,
}) => {
  const isMobile = useIsMobile();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const sidebarW = collapsed
    ? T.layout.sidebarCollapsed
    : T.layout.sidebarExpanded;

  const contentStyle = useMemo<React.CSSProperties>(
    () => ({
      marginLeft: isMobile ? 0 : sidebarW,
      transition: "margin-left var(--transition-normal)",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
    }),
    [sidebarW, isMobile],
  );

  const nav = useMemo(() => ({ pathname, navigate }), [pathname, navigate]);

  return (
    <ShellNavProvider value={nav}>
      <div style={{ minHeight: "100vh", background: "var(--color-bg-page)" }}>
        {isMobile ? (
          <MobileSidebarDrawer
            open={mobileNavOpen}
            onClose={() => setMobileNavOpen(false)}
            menuItems={menu}
            logoUrl={logoFull}
            homePath={homePath}
          />
        ) : (
          <Sidebar
            menuItems={menu}
            collapsed={collapsed}
            onToggleCollapsed={onToggleCollapsed}
            isLoading={isMenuLoading}
            logoFull={logoFull}
            logoCollapsed={logoCollapsed}
            homePath={homePath}
            versionLabel={versionLabel}
          />
        )}

        <div style={contentStyle}>
          {isMobile && renderMobileHeader
            ? renderMobileHeader(() => setMobileNavOpen(true))
            : header}
          <main style={{ flex: 1, overflowY: "auto" }}>{children}</main>
        </div>
      </div>
    </ShellNavProvider>
  );
};
