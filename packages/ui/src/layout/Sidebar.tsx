// src/features/navigation/components/Sidebar.tsx

import React, { useState } from "react";
import { SidebarMenu } from "./SidebarMenu";
import { useShellNav } from "./navContext";
import type { MenuItem } from "./menu.types";
import { useUILibrary } from "../ui-lib/ui-library-context";
import { T } from "../tokens";

import CommutrLogoFull from "../assets/commutr.svg";
import CommutrLogoCollapsed from "../assets/cmtr.svg";

import { SidebarSkeleton } from "./SidebarSkeleton";


export interface SidebarProps {
  menuItems: MenuItem[];
  collapsed: boolean;
  onToggleCollapsed: () => void;
  isLoading?: boolean;
  logoFull?: string;
  logoCollapsed?: string;
  homePath?: string;
  versionLabel?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  menuItems,
  collapsed,
  onToggleCollapsed: toggleSidebar,
  isLoading = false,
  logoFull = CommutrLogoFull,
  logoCollapsed = CommutrLogoCollapsed,
  homePath = "/",
  versionLabel = "v1.0.0",
}) => {
  const { Tooltip } = useUILibrary();

  const { navigate } = useShellNav();

  const [isCollapsedHovering, setIsCollapsedHovering] = useState(false);

  const width = collapsed
    ? T.layout.sidebarCollapsed
    : T.layout.sidebarExpanded;

  const showSkeleton = isLoading;

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width,
        transition: "width var(--transition-normal)",
        zIndex: 100,
        background: "var(--color-bg-sidebar)",
        borderRight: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ── Top bar ───────────────────────────────────────── */}
      <div
        style={{
          height: "var(--header-height)" as unknown as number,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: collapsed ? "0" : "0 10px 0 10px",
          flexShrink: 0,
          transition: "padding var(--transition-normal)",
          position: "relative",
        }}
      >
        {/* ── Expanded Logo ───────────────────────────── */}
        {!collapsed && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
              }}
              onClick={() => navigate(homePath)}
            >
              <img
                src={logoFull}
                alt="COMMUTR"
                style={{
                  height: 24,
                  width: "98%",
                  objectFit: "contain",
                  userSelect: "none",
                  display: "block",
                }}
              />
            </div>

            <CollapseButton collapsed={collapsed} onClick={toggleSidebar} />
          </>
        )}

        {/* ── Collapsed Logo State ───────────────────── */}
        {collapsed && (
          <div
            onMouseEnter={() => setIsCollapsedHovering(true)}
            onMouseLeave={() => setIsCollapsedHovering(false)}
            style={{
              position: "relative",
              // width: 40,
              // height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* CMTR Logo */}
            <img
              src={logoCollapsed}
              alt="CMTR"
              style={{
                height: 40,
                width: 70,
                objectFit: "contain",
                transition: "opacity 0.2s ease",
                opacity: isCollapsedHovering ? 0 : 1,
              }}
            />

            {/* Hover Expand Button */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: isCollapsedHovering ? 1 : 0,
                pointerEvents: isCollapsedHovering ? "auto" : "none",
                transition: "opacity 0.2s ease",
              }}
            >
              <CollapseButton collapsed={collapsed} onClick={toggleSidebar} />
            </div>
          </div>
        )}
      </div>

      {/* ── Divider ───────────────────────────────────── */}
      <div style={{ padding: "0 10px" }}>
        <div
          style={{
            height: "1px",
            background: "var(--color-border)",
            width: "100%",
          }}
        />
      </div>

      {/* ── Navigation menu ───────────────────────────── */}
      <nav
        className="scrollbar-thin"
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "8px 0",
        }}
      >
        {showSkeleton ? (
          <SidebarSkeleton />
        ) : (
          <SidebarMenu
            items={menuItems}
            depth={0}
            collapsed={collapsed}
            Tooltip={Tooltip}
          />
        )}
      </nav>

      {/* ── Footer ───────────────────────────────────── */}
      {!collapsed && (
        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            padding: "10px 0",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              display: "block",
              textAlign: "center",
              fontSize: "var(--text-overline-size)" as unknown as number,
              color: "var(--color-text-muted)",
            }}
          >
            {versionLabel}
          </span>
        </div>
      )}
    </div>
  );
};

/* ── Collapse Button ─────────────────────────────────────────────────────── */
const CollapseButton: React.FC<{
  collapsed: boolean;
  onClick: () => void;
}> = ({ collapsed, onClick }) => (
  <button
    onClick={onClick}
    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    style={{
      background: "var(--color-brand-subtle)",
      border: "1px solid var(--color-green-200)",
      padding: "3px 4px",
      cursor: "pointer",
      color: "var(--color-brand-primary)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: T.radius.sm,
      flexShrink: 0,
      transition:
        "background var(--transition-fast), color var(--transition-fast)",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "var(--color-brand-primary)";
      e.currentTarget.style.color = "#ffffff";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "var(--color-brand-subtle)";
      e.currentTarget.style.color = "var(--color-brand-primary)";
    }}
  >
    {collapsed ? <ChevronsRightIcon /> : <ChevronsLeftIcon />}
  </button>
);

const ChevronsLeftIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="11 17 6 12 11 7" />
    <polyline points="18 17 13 12 18 7" />
  </svg>
);

const ChevronsRightIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="13 17 18 12 13 7" />
    <polyline points="6 17 11 12 6 7" />
  </svg>
);
