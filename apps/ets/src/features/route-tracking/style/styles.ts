// ============================================================
// styles.ts — Shared style tokens and helpers
// ============================================================

import type { RouteStatus, BoardingStatus } from "../types/tracking.types";

// ── Palette ─────────────────────────────────────────────────
export const colors = {
  primary: "#2563eb",
  primaryLight: "#eff6ff",
  primaryBorder: "#bfdbfe",

  success: "#15803d",
  successLight: "#f0fdf4",
  successBorder: "#bbf7d0",

  danger: "#dc2626",
  dangerLight: "#fef2f2",
  dangerBorder: "#fecaca",

  warning: "#f59e0b",
  warningLight: "#fffbeb",
  warningBorder: "#fde68a",

  purple: "#6366f1",
  purpleLight: "#e0e7ff",
  blueinfo: "#2F44CC",
  brandGreen: "#3E9B73",

  gray50: "#f8fafc",
  gray100: "#f1f5f9",
  gray200: "#e2e8f0",
  gray400: "#94a3b8",
  gray500: "#64748b",
  gray600: "#475569",
  gray800: "#1e293b",
  gray900: "#0f172a",

  white: "#ffffff",
  pink: "#ec4899",
} as const;

// ── Card ─────────────────────────────────────────────────────
export const card: React.CSSProperties = {
  background: colors.white,
  border: `1px solid ${colors.gray200}`,
  borderRadius: 10,
  padding: "12px 14px",
};

// ── RouteStatus → badge colours ──────────────────────────────
export const routeStatusStyle: Record<RouteStatus, React.CSSProperties> = {
  Completed: { background: "#e6f4ea", color: "#1a7340", border: "1px solid #b7dfca" },
  Ongoing: { background: "#fff3cd", color: "#856404", border: "1px solid #ffd97d" },
  Delayed: { background: "#fde8e8", color: "#991b1b", border: "1px solid #fca5a5" },
};

// ── BoardingStatus → badge colours ──────────────────────────
export const boardingStatusStyle: Record<BoardingStatus, React.CSSProperties> = {
  Boarded: { background: colors.successLight, color: colors.success, border: `1px solid ${colors.success}33` },
  "No Show": { background: colors.dangerLight, color: colors.danger, border: `1px solid ${colors.danger}33` },
  Pending: { background: colors.warningLight, color: "#92400e", border: `1px solid ${colors.warningBorder}` },
};

// ── Toggle switch ─────────────────────────────────────────────
export const toggleTrack = (checked: boolean): React.CSSProperties => ({
  position: "absolute",
  inset: 0,
  background: checked ? colors.primary : colors.gray200,
  borderRadius: 18,
  transition: "background 0.2s",
});

export const toggleThumb = (checked: boolean): React.CSSProperties => ({
  position: "absolute",
  top: 2,
  left: checked ? 16 : 2,
  width: 14,
  height: 14,
  background: colors.white,
  borderRadius: "50%",
  transition: "left 0.2s",
  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
});

// Need to import React for CSSProperties — re-export for convenience
import React from "react";