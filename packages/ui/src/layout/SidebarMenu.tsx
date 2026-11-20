// src/features/navigation/components/Sidebar/SidebarMenu.tsx
import React, { useState, useEffect } from "react";
import { useShellNav } from "./navContext";
import type { MenuItem } from "./menu.types";
import type { TooltipProps as UILibTooltipProps } from "../ui-lib/types";
import { T } from "../tokens";
import CollapsedMenuPopover from "./CollapsedMenuPopover";

interface SidebarMenuProps {
  items: MenuItem[];
  depth?: number;
  collapsed?: boolean;
  Tooltip?: React.ComponentType<UILibTooltipProps>;
}

// ── Recursively find the first navigable leaf URL ─────────────────────────────
const findFirstLeafUrl = (item: MenuItem): string | null => {
  if (!item.children?.length) return item.routeUrl || null;

  const sorted = [...item.children]
    .filter((c) => c.isAssigned)
    .sort((a, b) => a.orderNo - b.orderNo);

  for (const child of sorted) {
    const url = findFirstLeafUrl(child);
    if (url) return url;
  }
  return null;
};

export const SidebarMenu: React.FC<SidebarMenuProps> = ({
  items,
  depth = 0,
  collapsed = false,
  Tooltip,
}) => {
  // console.log(items, "items");
  const { navigate, pathname } = useShellNav();
  const location = { pathname };
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  // Auto-open the parent whose child is currently active
  useEffect(() => {
    const findActiveParent = (list: MenuItem[]): string | null => {
      for (const item of list) {
        if (item.children?.length) {
          const hasActive = item.children.some(
            (c) =>
              c.routeUrl === location.pathname ||
              findActiveParent([c]) !== null,
          );
          if (hasActive) return item.menuId;
        }
      }
      return null;
    };

    const activeParentId = findActiveParent(items);
    if (activeParentId !== null) setOpenItemId(activeParentId);
  }, [location.pathname, items]);

  const isActive = (url: string) => !!url && location.pathname === url;

  const hasActiveDescendant = (item: MenuItem): boolean =>
    !!item.children?.some(
      (c) => isActive(c.routeUrl) || hasActiveDescendant(c),
    );

  const sorted = [...items]
    .filter((i) => i.isAssigned && i.isShow)
    .sort((a, b) => a.orderNo - b.orderNo);

  if (!sorted.length) return null;

  const handleItemClick = (item: MenuItem) => {
    const hasChildren = !!item.children?.length;

    // if (hasChildren) {
    //     setOpenItemId((prev) => (prev === item.menuId ? null : item.menuId));
    //     const firstUrl = findFirstLeafUrl(item);
    //     if (firstUrl) navigate(firstUrl);
    // } else if (item.routeUrl) {
    //     navigate(item.routeUrl);
    // }

    if (hasChildren) {
      setOpenItemId((prev) => (prev === item.menuId ? null : item.menuId));
      return;
    }

    if (item.routeUrl) {
      navigate(item.routeUrl);
    }
  };

  return (
    <ul
      style={{
        listStyle: "none",
        // marginTop: "1px",
        padding: depth === 0 ? "0 10px" : "0 4px 0 1px",
        position: "relative",
      }}
    >
      {/* Vertical connector line for sub-menus */}
      {depth > 0 && (
        <div
          style={{
            position: "absolute",
            left: "1px",
            top: "0",
            bottom: "0",
            width: "2px",
            backgroundColor: "var(--color-border)",
            zIndex: 0,
          }}
        />
      )}

      {sorted.map((item) => {
        const hasChildren = !!item.children?.length;
        const isOpen = openItemId === item.menuId;
        const active = isActive(item.routeUrl);
        const softActive = !active && hasActiveDescendant(item);

        const btn = (
          <MenuButton
            item={item}
            active={active}
            softActive={softActive}
            isOpen={isOpen}
            hasChildren={hasChildren}
            isCollapsed={collapsed && depth === 0}
            depth={depth}
            onClick={() => handleItemClick(item)}
          />
        );

        return (
          <li key={item.menuId} style={{ marginBottom: 1 }}>
            {collapsed && depth === 0 ? (
              hasChildren ? (
                <CollapsedMenuPopover item={item}>{btn}</CollapsedMenuPopover>
              ) : Tooltip ? (
                <Tooltip title={item.menuName} placement="right">
                  {btn}
                </Tooltip>
              ) : (
                btn
              )
            ) : (
              btn
            )}

            {hasChildren && !collapsed && (
              <div
                style={{
                  overflow: "hidden",
                  maxHeight: isOpen ? 9999 : 0,
                  opacity: isOpen ? 1 : 0,
                  transition:
                    "max-height 0.3s ease, opacity var(--transition-fast)",
                  marginTop: isOpen ? 1 : 0,
                }}
              >
                <SidebarMenu
                  items={item.children!}
                  depth={depth + 1}
                  collapsed={false}
                  Tooltip={Tooltip}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

/* ── MenuButton ──────────────────────────────────────────────────────────── */
interface MenuButtonProps {
  item: MenuItem;
  active: boolean;
  softActive: boolean;
  isOpen: boolean;
  hasChildren: boolean;
  isCollapsed: boolean;
  depth: number;
  onClick: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({
  item,
  active,
  softActive,
  isOpen,
  hasChildren,
  isCollapsed,
  depth,
  onClick,
}) => {
  const [hovered, setHovered] = useState(false);

  const isTopLevel = depth === 0;
  const isSubLevel = depth > 0;

  let bg = "transparent";
  if ((active || softActive) && isTopLevel) bg = T.sidebar.activeBg;
  else if (active && isSubLevel) bg = T.sidebar.activeSubBg;
  else if (hovered) bg = T.sidebar.hoverBg;

  const chevronColor =
    (active || softActive) && isTopLevel
      ? T.sidebar.activeText
      : T.text.placeholder;

  const textColor: string =
    (active || softActive) && isTopLevel
      ? T.sidebar.activeText
      : T.sidebar.defaultText;

  const iconColor: string =
    (active || softActive) && isTopLevel
      ? T.sidebar.activeText
      : T.sidebar.defaultText;

  const paddingV = isTopLevel ? 8 : 6;
  const paddingLeft = isCollapsed ? 12 : isSubLevel ? 12 : 8;
  const paddingRight = isCollapsed ? 12 : 8;
  const showAccent = isSubLevel && active;

  return (
    <div style={{ position: "relative" }}>
      {/* Active accent bar for sub-items */}
      {showAccent && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 2,
            background: "var(--color-brand-primary)",
            borderRadius: "0 2px 2px 0",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
      )}

      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-current={active ? "page" : undefined}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "flex-start",
          gap: isCollapsed ? 3 : 6,
          paddingTop: paddingV,
          paddingBottom: paddingV,
          paddingLeft,
          paddingRight,
          border: "none",
          borderRadius: T.radius.sm,
          fontWeight: 600,
          background: bg,
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          color: textColor,
          transition:
            "background var(--transition-fast), color var(--transition-fast)",
          outline: "none",
          textAlign: "left",
          minHeight: isTopLevel ? 36 : 32,
        }}
      >
        {isTopLevel && item.icon && (
          <MenuIcon name={item.icon} color={iconColor} size={14} />
        )}

        {!isCollapsed && (
          <>
            <span
              style={{
                flex: 1,
                fontSize: isTopLevel
                  ? ("var(--sidebar-text-body-sm-size)" as unknown as number)
                  : ("var(--sidebar-text-label-sm-size)" as unknown as number),
                fontWeight: active ? 600 : isTopLevel ? 500 : 400,
                color:
                  isSubLevel && !active
                    ? "var(--color-text-secondary)"
                    : textColor,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1.5,
                transition: "color var(--transition-fast)",
              }}
            >
              {item.menuName}
            </span>

            {hasChildren && (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={chevronColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  flexShrink: 0,
                  transition: "transform var(--transition-normal)",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            )}
          </>
        )}
      </button>
    </div>
  );
};

/* ── Icon Map ────────────────────────────────────────────────────────────── */
const ICONS: Record<string, string> = {
  "layout-dashboard":
    "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z|M9 22V12h6v10",
  computer:
    "M20 18H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2zM8 21h8M12 17v4",
  users:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2|M23 21v-2a4 4 0 0 0-3-3.87|M16 3.13a4 4 0 0 1 0 7.75",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z|M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  truck:
    "M1 3h15v13H1z|M16 8h4l3 3v5h-7V8z|M5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z|M18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  car: "M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2|M14 17H9|M16 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0|M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0",
  Car: "M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2|M14 17H9|M16 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0|M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0",
  fleet:
    "M1 3h15v13H1z|M16 8h4l3 3v5h-7V8z|M5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z|M18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  System:
    "M20 18H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2zM8 21h8M12 17v4",
  "user-check":
    "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2|M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z|M17 11l2 2 4-4",
  "user-plus":
    "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2|M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z|M20 8v6|M23 11h-6",
  "building-2":
    "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18z|M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2|M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2|M10 6h4|M10 10h4|M10 14h4|M10 18h4",
  "id-card":
    "M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5z|M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z|M4 20v-1a4 4 0 0 1 4-4h.5|M16 8h2|M16 12h2|M16 16h2",
  "plus-circle": "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z|M12 8v8|M8 12h8",
  navigation: "M3 11l19-9-9 19-2-8-8-2z",
  "map-pin":
    "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z|M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9|M13.73 21a2 2 0 0 1-3.46 0",
  "file-text":
    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z|M14 2v6h6|M16 13H8|M16 17H8|M10 9H8",
  "bar-chart": "M18 20V10|M12 20V4|M6 20v-6",
  map: `
M4 19c0-2.5 2-4.5 4.5-4.5S13 16.5 13 19
M8.5 14.5v-2
M8.5 10.5v-2
M8.5 6.5V5
M8.5 5a2.5 2.5 0 1 0 0 .01
M8.5 19a2.5 2.5 0 1 0 0 .01
M14 8l2-2 4 4
M20 10V6h-4
`,
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  grid: "M3 3h7v7H3z|M14 3h7v7h-7z|M14 14h7v7h-7z|M3 14h7v7H3z",
  "clipboard-list":
    "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2|M9 12h6|M9 16h6|M9 8h6",
  package:
    "M12 2l10 6.5v7L12 22 2 15.5v-7L12 2z|M12 22v-6.5|M22 8.5l-10 7-10-7",
  "credit-card": "M1 4h22v16H1z|M1 10h22",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  "dollar-sign": "M12 1v22|M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  "-": "",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2|M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  clock: "M12 7v5l3 2|M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z",
  route: "M3 6h6|M3 18h6|M15 6h6|M15 18h6|M9 6a3 3 0 1 0 0 6h6a3 3 0 1 1 0 6",
  report: `
M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z
M14 2v6h6
M8 17v-4
M12 17v-7
M16 17v-2
`,
  lookup: `M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z`,
  "security-hat":
    "M3 10L12 5L21 10|M5 10V14C5 17.5 8 20 12 20C16 20 19 17.5 19 14V10|M3 10H21|M12 13a1.5 1.5 0 1 0 0.01 0",
  billing:
    "M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z|M16 8H8|M16 12H8|M13 16H8",
  tripmanagement:
    "C6 22 4.343 22 3 22C3 20.343 4.343 19 6 19C7.657 19 9 20.343 9 22C9 23.657 7.657 25 6 25Z|M9 19H17.5A3.5 3.5 0 0 0 17.5 12H6.5A3.5 3.5 0 0 1 6.5 5H15|C18 8 16.343 8 15 8C15 6.343 16.343 5 18 5C19.657 5 21 6.343 21 5C21 7.657 19.657 8 18 8Z",
  trackingpanel:
    "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0|m9 10 2 2 4-4",
  feedback:
    "M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z|M20 9a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1",
};

interface MenuIconProps {
  name: string;
  color: string;
  size?: number;
}

const MenuIcon: React.FC<MenuIconProps> = ({ name, color, size = 16 }) => {
  const pathData = ICONS[name];
  if (!pathData) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, transition: "stroke var(--transition-fast)" }}
      aria-hidden
    >
      {pathData.split("|").map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
};
