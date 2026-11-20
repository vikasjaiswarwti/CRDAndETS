import React from "react";
import type { MenuItem } from "./menu.types";
import { useShellNav } from "./navContext";
import { SidebarMenu } from "./SidebarMenu";
import CommutrLogoFull from "../assets/commutr.svg";

const DRAWER_WIDTH = 260;

export const MobileSidebarDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  logoUrl?: string;
  homePath?: string;
}> = ({ open, onClose, menuItems, logoUrl = CommutrLogoFull, homePath = "/" }) => {
  const { navigate } = useShellNav();

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 1099,
          }}
        />
      )}
      <div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          width: DRAWER_WIDTH,
          background: "var(--color-bg-sidebar)",
          borderRight: "1px solid var(--color-border)",
          zIndex: 1100,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform var(--transition-normal)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "var(--header-height)" as unknown as number,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 14px",
            borderBottom: "1px solid var(--color-border)",
            flexShrink: 0,
          }}
        >
          <img
            src={logoUrl}
            alt="COMMUTR"
            style={{ height: 24, cursor: "pointer" }}
            onClick={() => {
              navigate(homePath);
              onClose();
            }}
          />
          {/* <button
            onClick={onClose}
            aria-label="Close search"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="var(--color-text-danger)"
                strokeWidth="2"
              />
              <path
                d="M9 9L15 15M15 9L9 15"
                stroke="var(--color-text-danger)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button> */}
        </div>
        <nav
          className="scrollbar-thin"
          style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}
        >
          <SidebarMenu items={menuItems} depth={0} collapsed={false} />
        </nav>
      </div>
    </>
  );
};
