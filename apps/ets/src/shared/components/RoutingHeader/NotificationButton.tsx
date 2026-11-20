import React from "react";
import { T } from "../../../styles/tokens";

const NotificationButton = () => {
  return (
    <button
      style={s.iconBtn}
      aria-label="Notifications"
      onClick={() => window.open("/routing/security", "_blank")}
    >
      <BellIcon />
      <span style={s.badge} />
    </button>
  );
};

export default NotificationButton;
/* ── Styles ──────────────────────────────────────────────────────────────── */
export const s: Record<string, React.CSSProperties> = {
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
};

const BellIcon = () => (
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
