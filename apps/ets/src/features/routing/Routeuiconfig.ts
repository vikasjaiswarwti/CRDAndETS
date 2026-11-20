// src/features/routeManagement/constants/RouteUIConfig.ts
// ─────────────────────────────────────────────────────────────────────────────
// Central config for all font sizes, spacing, and radii used across
// Route Management components. Adjust here to rescale the entire feature.
// ─────────────────────────────────────────────────────────────────────────────

export const RM_FONT = {
  /** Column header labels (uppercase) */
  colHeader: 11,
  /** Small badges, sub-labels, helper text */
  xs: 10,
  /** Badge text, secondary info */
  sm: 11,
  /** Base body text */
  base: 11,
  /** Primary cell text, panel titles */
  md: 13,
  /** Page subtitle */
  lg: 13,
  /** Page title */
  xl: 20,
  /** Stat card values */
  stat: 20,
} as const;

export const RM_SPACE = {
  /** Page outer padding */
  pagePad: 14,
  /** Gap between page sections */
  pageGap: 12,
  /** Panel header padding */
  panelHeaderPad: "10px 14px 8px",
  /** Table cell padding */
  cellPad: "8px 10px",
  /** Checkbox cell padding */
  checkboxPad: "0 10px",
  /** Footer padding */
  footerPad: "8px 8px",
  /** Stat card padding */
  statCardPad: "10px 12px",
  /** Gap inside stat card */
  statCardGap: 10,
  /** Grid gap between stat cards */
  statsGap: 8,
  /** Grid gap between the two panels */
  tablesGap: 10,
  /** Row height (visual via cell padding — not fixed height) */
  rowCellVPad: 8,
} as const;

export const RM_RADIUS = {
  card: 10,
  badge: 999,
  btn: 6,
  icon: 8,
} as const;

export const RM_COLOR = {
  green900: "#1B4332",
  green800: "#166534",
  green600: "#059669",
  green500: "#10B981",
  green100: "#D1FAE5",
  green50: "#ECFDF5",

  amber600: "#D97706",
  amber50: "#FFFBEB",
  amber100: "#FEF3C7",

  yellow500: "#EAB308",

  red500: "#EF4444",
  orange600: "#C2410C",
  orange50: "#FFF7ED",
  orange100: "#FED7AA",

  blue500: "#3B82F6",
  blue50: "#EFF6FF",

  gray900: "#111827",
  gray800: "#1F2937",
  gray700: "#374151",
  gray600: "#4B5563",
  gray500: "#6B7280",
  gray400: "#4B4B4B",
  gray300: "#D1D5DB",
  gray200: "#E5E7EB",
  gray100: "#F3F4F6",
  gray50: "#F9FAFB",
  white: "#FFFFFF",

  border: "0.5px solid #E5E7EB",
  // borderRow: "0.5px solid #F3F4F6",
  borderRow: "0.5px solid #D1D5DB",
  borderFooter: "1px solid #F3F4F6",

  selectedBg: "rgba(209,250,229,0.40)",
  hoverBg: "rgba(249,250,251,0.85)",

  shadow: "0 1px 3px rgba(0,0,0,0.05)",
} as const;

export const DARK_POPOVER = {
  trigger: "hover" as const,
  arrow: { pointAtCenter: true },
  mouseEnterDelay: 0.25,
  mouseLeaveDelay: 0.05,
  color: "rgba(15,23,42,0.93)",
  overlayInnerStyle: {
    padding: "4px 8px",
    borderRadius: 8,
    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
    fontSize: 8,
    fontWeight: 500,
    color: "#fff",
    letterSpacing: "0.01em",
    lineHeight: 1.5,
  },
  overlayStyle: {
    backdropFilter: "blur(4px)",
  },
};

export const LIGHT_POPOVER = {
  trigger: "hover" as const,
  arrow: { pointAtCenter: true },
  mouseEnterDelay: 0.25,
  mouseLeaveDelay: 0.05,

  color: "#FFFFFF",

  overlayInnerStyle: {
    padding: "4px 8px",
    borderRadius: 8,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    fontSize: 11,
    fontWeight: 500,
    color: "#111827", // dark text
    letterSpacing: "0.01em",
    lineHeight: 1.5,
    border: "1px solid #E5E7EB",
  },

  overlayStyle: {
    backdropFilter: "blur(4px)",
  },
};
export const RM_FilterLabel: React.CSSProperties =
{
  fontSize: 13,
  fontWeight: 700,
  color: "#374151",
  flexShrink: 0,
  whiteSpace: "nowrap",
}
