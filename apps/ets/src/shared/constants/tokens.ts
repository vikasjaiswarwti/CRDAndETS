/**
 * useTokens — single source of truth for colors, spacing, radius, shadows
 * and typography used across the Vehicle Compliance / Vehicle QR module.
 *
 * Reconstructed from every `color.*`, `spacing.*`, `radius.*`, `shadow.*`
 * and `font.*` key referenced across the dashboard, modals, and stat cards
 * (primary green matches the #3E9B73 branding used for active states,
 * "Fully Compliant" badges, and primary buttons throughout the screens).
 *
 * Exposed as a hook so call sites can later swap this for a real
 * ThemeContext / useUILibrary theme provider without touching every
 * component — for now it just returns the static TOKENS object below.
 */
import { useMemo } from "react";

export const TOKENS = {
  color: {
    primary: "#3E9B73",
    primaryDark: "#1B4332",
    primaryLight: "#EAFAF1",
    surface: "#FFFFFF",
    border: "#E5E7EB",
    borderMid: "#D1D5DB",
    textPrimary: "#111827",
    textSecondary: "#6B7280",
    textDisabled: "#9CA3AF",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 14,
    xl: 18,
  },
  radius: {
    sm: 4,
    md: 6,
    lg: 10,
    xl: 16,
    pill: 999,
  },
  shadow: {
    card: "0 1px 3px rgba(0, 0, 0, 0.08)",
    panel: "0 4px 16px rgba(0, 0, 0, 0.08)",
  },
  font: {
    sizeXs: 10,
    sizeSm: 12,
    sizeMd: 14,
    sizeLg: 16,
    weightMedium: 500,
    weightSemibold: 600,
    weightBold: 700,
  },
} as const;

export type Tokens = typeof TOKENS;

export const useTokens = (): Tokens => {
  // useMemo so consumers get a stable reference across renders
  return useMemo(() => TOKENS, []);
};

export default useTokens;
