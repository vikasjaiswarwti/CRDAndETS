// ─── constants/designTokens.ts ────────────────────────────────────────────────
// Light-theme design tokens — matches the COMMUTR product screenshots.
// Single source of truth for all inline styles across the Route Maker feature.

export const T = {
  panelW: 340,
  surface: "#FFFFFF",
  surfaceAlt: "#F8F9FC",
  textSub: "#6B7280",
  // subtle:
  // ── Surfaces ────────────────────────────────────────────────────────────────
  bg: "#F5F6FA", // page / app background
  panel: "#FFFFFF", // sidebar, panels, drawers
  card: "#FFFFFF", // card backgrounds
  cardHover: "#F8FAFC", // card hover state
  overlay: "rgba(15, 23, 42, 0.45)", // modal/drawer backdrop

  // ── Borders ─────────────────────────────────────────────────────────────────
  border: "#E2E8F0", // default border
  borderMd: "#CBD5E1", // medium emphasis border
  borderFocus: "#16A34A", // focus ring

  borderStrong: "#16A34A", //need to change from token
  successBorder: "#16A34A",

  // ── Text ────────────────────────────────────────────────────────────────────
  text: "#1A202C", // primary text
  textSm: "#374151", // secondary text
  muted: "#6B7280", // muted / placeholder
  mutedLight: "#9CA3AF",
  inverse: "#FFFFFF", // text on dark backgrounds
  accentHover: "#15803D",

  // ── Brand / accent ──────────────────────────────────────────────────────────
  accent: "#16A34A", // COMMUTR green (primary CTA)
  accentBg: "#F0FDF4", // green tint background
  accentDark: "#15803D", // green hover
  accentBorder: "#86EFAC",

  // ── Semantic ─────────────────────────────────────────────────────────────────
  success: "#16A34A",
  successBg: "#F0FDF4",
  warn: "#D97706",
  warnBg: "#FFFBEB",
  warnBorder: "#FCD34D",
  danger: "#DC2626",
  dangerBg: "#FEF2F2",
  dangerBgCancelled: "#FEE2E2", // recommended
  info: "#2563EB",
  infoBg: "#EFF6FF",
  infoBorder: "#93C5FD",
  hyperlink:"#0000ff",

  // ── Route card active states ──────────────────────────────────────────────
  selectedBlue: "#2563EB", // first selected route card border
  selectedYellow: "#CA8A04", // second selected route card border
  selectedBlueBg: "#EFF6FF",
  selectedYellowBg: "#FEFCE8",

  // ── Spacing scale (px) ───────────────────────────────────────────────────
  sp2: 2,
  sp4: 4,
  sp6: 6,
  sp8: 8,
  sp10: 10,
  sp12: 12,
  sp14: 14,
  sp16: 16,
  sp20: 20,
  sp24: 24,

  // ── Typography ───────────────────────────────────────────────────────────
  fontXs: 10,
  fontSm: 12,
  fontBase: 13,
  fontMd: 14,
  fontLg: 16,
  fontXl: 18,

  // ── Shape ────────────────────────────────────────────────────────────────
  radius: 8,
  radiusSm: 4,
  radiusMd: 10,
  radiusLg: 12,

  radiusXl: 16,
  radiusFull: 9999,

  // ── Shadow ───────────────────────────────────────────────────────────────
  shadow: "0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)",
  shadowMd: "0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -1px rgba(0,0,0,0.06)",
  shadowLg:
    "0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -2px rgba(0,0,0,0.05)",
  shadowXl:
    "0 20px 25px -5px rgba(0,0,0,0.10), 0 10px 10px -5px rgba(0,0,0,0.04)",

  // ── Layout dimensions ────────────────────────────────────────────────────
  headerH: 45, // px — AppHeader height
  statsH: 46, // px — KpiStatsBar height
  sidebarW: 300, // px — LeftSidebar width
  sidebarCollapsedW: 0, // px — collapsed sidebar width
  routeStackW: 380, // px — RouteStackPanel width

  // ── Shimmer ────────────────────────────────────────────────────────────────
  shimmerBase: "#E5E7EB",
  shimmerShine: "#F3F4F6",

  flagColor: "#820000",
} as const;

// ─── Route palette ────────────────────────────────────────────────────────────
// Ordered; wraps for routes beyond 8.
export const ROUTE_PALETTE: string[] = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#8B5CF6", // violet
  "#06B6D4", // cyan
  "#EC4899", // pink
  "#F97316", // orange
  "#0D9488", // teal
];

/**
 * Returns a stable hex color for a given vehicleId / route index.
 * colorMap (built once by buildColorMap) is the preferred lookup; this
 * is a fallback for direct-render scenarios.
 */
export function routeColor(idx: number): string {
  return ROUTE_PALETTE[idx % ROUTE_PALETTE.length];
}

export function buildColorMap(
  routes: { VehicleId: number }[],
): Record<number, string> {
  const map: Record<number, string> = {};
  routes.forEach((r, i) => {
    map[r.VehicleId] = routeColor(i);
  });
  return map;
}
