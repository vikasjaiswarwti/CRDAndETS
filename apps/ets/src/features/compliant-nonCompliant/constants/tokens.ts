/**
 * tokens.ts — tighter spacing to match the compact design in the screenshots.
 * All margins/paddings in this feature come from here — never hardcoded.
 * To merge to shared: move file + update import path only.
 */

export const BRAND = {
  primary: "#16a34a",
  primaryLight: "#dcfce7",
  primaryMid: "#22c55e",
  primaryDark: "#15803d",
  warning: "#f59e0b",
  warningLight: "#fff7e6",
  error: "#ef4444",
  errorLight: "#fee2e2",
  info: "#3b82f6",
  infoLight: "#dbeafe",
  textPrimary: "#1a1a1a",
  textSecondary: "#6b7280",
  textDisabled: "#bfbfbf",
  border: "#e8e8e8",
  borderMid: "#d9d9d9",
  surface: "#ffffff",
  background: "#f5f6fa",
} as const;

// ── Compact spacing — every px comes from here, never hardcoded in components ─
export const SPACING = {
  xs: 2, // 2px  — icon gaps, tiny nudges
  sm: 4, // 6px  — between inline elements
  md: 10, // 10px — inner card padding, row gaps
  lg: 14, // 14px — section gaps
  xl: 18, // 18px — page section gaps
  xxl: 24, // 24px — between major blocks
} as const;

export const RADIUS = {
  sm: 4,
  md: 6,
  lg: 10,
  xl: 14,
  pill: 999,
} as const;

export const SHADOW = {
  card: "0 1px 3px rgba(0,0,0,0.05)",
  panel: "0 2px 6px rgba(0,0,0,0.07)",
  modal: "0 8px 24px rgba(0,0,0,0.12)",
} as const;

export const FONT = {
  sizeXs: 10,
  sizeSm: 11,
  sizeMd: 13,
  sizeLg: 14,
  sizeXl: 16,
  sizeH5: 18,
  sizeH4: 20,
  weightNormal: 400,
  weightMedium: 500,
  weightSemibold: 600,
  weightBold: 700,
} as const;

export function useTokens() {
  return {
    color: BRAND,
    spacing: SPACING,
    radius: RADIUS,
    shadow: SHADOW,
    font: FONT,
  } as const;
}
