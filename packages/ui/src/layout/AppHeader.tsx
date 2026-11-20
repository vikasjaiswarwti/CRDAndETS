// Presentational top bar shared by every Commutr app.
// Apps fill the slots: `left` (e.g. organisation badge), `actions` (search,
// notifications, toggles) and pass the user + dropdown menu items.
// No Redux / router / feature imports here.

import React from "react";
import { useUILibrary } from "../ui-lib/ui-library-context";
import { T } from "../tokens";

export interface HeaderMenuItem {
  key: string;
  label?: React.ReactNode;
  danger?: boolean;
  type?: "divider";
  onClick?: () => void;
}

export interface AppHeaderProps {
  left?: React.ReactNode;
  actions?: React.ReactNode;
  userName?: string;
  userMenuItems?: HeaderMenuItem[];
}

const initialsOf = (name?: string) => {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "AM";
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
};

export const AppHeader: React.FC<AppHeaderProps> = ({
  left,
  actions,
  userName,
  userMenuItems = [],
}) => {
  const { Dropdown } = useUILibrary();

  return (
    <header style={s.header}>
      <div style={s.topRow}>
        <div>{left}</div>

        <div style={s.rightGroup}>
          {actions}

          <Dropdown
            menu={{ items: userMenuItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <button style={s.avatarBtn}>
              <div style={s.avatar}>{initialsOf(userName)}</div>
              <ChevronDownIcon />
            </button>
          </Dropdown>
        </div>
      </div>

      <div style={s.separator} />
    </header>
  );
};

/** Pill for the organisation / app name, matching ETS's header. */
export const OrgBadge: React.FC<{ name: string; icon?: React.ReactNode }> = ({
  name,
  icon = <CorporateIcon />,
}) => (
  <div style={s.orgBadge}>
    {icon}
    <span style={s.orgName}>{name}</span>
  </div>
);

export const HeaderIconButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { dot?: boolean }
> = ({ dot, children, ...rest }) => (
  <button style={s.iconBtn} {...rest}>
    {children}
    {dot && <span style={s.badge} />}
  </button>
);

/* ── Styles ──────────────────────────────────────────────────────────────── */
const s: Record<string, React.CSSProperties> = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 99,
    height: "var(--header-height)" as unknown as number,
    background: "var(--color-bg-header)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxSizing: "border-box",
    width: "100%",
    flexShrink: 0,
  },
  topRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    padding: "0 12px",
  },
  separator: {
    height: 1,
    margin: "0 12px",
    background: "var(--color-border)",
    flexShrink: 0,
  },
  orgBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "5px 12px 5px 9px",
    borderRadius: 8,
    background: "var(--color-brand-primary-subtle, rgba(99,102,241,0.08))",
    border:
      "1px solid var(--color-brand-primary-border, rgba(99,102,241,0.18))",
  },
  orgName: {
    fontSize: "var(--text-label-md-size)" as unknown as number,
    fontWeight: 700,
    color: "var(--color-brand-primary)",
    letterSpacing: "-0.01em",
    lineHeight: 1,
  },
  rightGroup: {
    display: "flex",
    alignItems: "center",
    gap: 20,
  },
  iconBtn: {
    position: "relative",
    background: "none",
    border: "none",
    padding: 6,
    cursor: "pointer",
    color: "var(--color-text-tertiary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: T.radius.md,
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    background: "var(--color-brand-primary)",
    borderRadius: "50%",
    border: "2px solid var(--color-bg-header)",
  },
  avatarBtn: {
    background: "none",
    border: "none",
    padding: "4px 6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    borderRadius: T.radius.md,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "var(--color-brand-primary)",
    color: "#fff",
    fontSize: "var(--text-label-sm-size)" as unknown as number,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
};

/* ── SVG Icons ───────────────────────────────────────────────────────────── */
export const CorporateIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--color-brand-primary)"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
  </svg>
);

export const BellIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke={T.text.placeholder}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
