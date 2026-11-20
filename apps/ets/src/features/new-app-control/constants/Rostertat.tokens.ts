// rosterTAT.tokens.ts — compact design tokens
import type React from "react";

export const COLORS = {
  surface: "#ffffff",
  bg: "#f8fafc",
  bgHover: "#f1f5f9",
  border: "#e5e7eb",
  borderMd: "#d1d5db",
  text: "#111827",
  textSecondary: "#374151",
  textMuted: "#6b7280",
  textLight: "#9ca3af",
  primary: "#3b82f6",
  primaryLight: "#eff6ff",
  primaryBorder: "#bfdbfe",
  success: "#16a34a",
  successLight: "#f0fdf4",
  successText: "#15803d",
  error: "#dc2626",
  errorLight: "#fef2f2",
  saving: "#0284c7",
  savingLight: "#f0f9ff",
  // Legacy aliases for chips / helper files
  infoText: "#0369a1",
  infoLight: "#e0f2fe",
  warningText: "#92400e",
  warningLight: "#fef3c7",
  violet: "#7c3aed",
  violetLight: "#f5f3ff",
  indigo: "#4f46e5",
  indigoLight: "#eef2ff",
  red: "#dc2626",
  redLight: "#fef2f2",
  amber: "#d97706",
  amberLight: "#fffbeb",
  sky: "#0ea5e9",
  skyLight: "#e0f2fe",
  teal: "#0d9488",
  tealLight: "#f0fdfa",
} as const;

export const RADIUS = {
  sm: 3,
  md: 5,
  lg: 7,
  xl: 10,
  full: 9999,
} as const;

export const SPACING = {
  xs: 3,
  sm: 5,
  md: 8,
  lg: 11,
  xl: 14,
  "2xl": 18,
} as const;

export const FONT: Record<string, React.CSSProperties> = {
  label: { fontSize: 11, fontWeight: 500, color: "#6b7280" },
  fieldLabel: { fontSize: 11, fontWeight: 500, color: "#6b7280" },
  sectionTitle: { fontSize: 12, fontWeight: 600, color: "#111827" },
  pageTitle: { fontSize: 18, fontWeight: 700, color: "#111827" },
  cardTitle: { fontSize: 13, fontWeight: 600, color: "#111827" },
};

export const SHADOWS = {
  level1: "0 1px 2px rgba(0,0,0,0.05)",
  level2: "0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.03)",
  level3: "0 4px 12px rgba(0,0,0,0.09)",
} as const;

export const TRANSITION = {
  fast: "all 0.1s ease",
  normal: "all 0.15s ease",
} as const;
