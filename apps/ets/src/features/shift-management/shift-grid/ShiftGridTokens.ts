// shared/components/shift-grid/ShiftGridTokens.tsx
// ════════════════════════════════════════════════════════════
//  COMMUTR — Shift Module Design Token System  v4
//  Brand primary = forest green #1B5C3A
//  v4 changes: toolbarH 72, rowH 74, searchW 240,
//              + toolbarBtnH, paginationPillSz, rowCardGap, rowCardR
//  v4.1: added shadow.modal for ShiftActionModal
// ════════════════════════════════════════════════════════════

export const TOKENS = {
  color: {
    primary: "#1B5C3A",
    primaryHover: "#154D30",
    primaryActive: "#0F3D25",
    primaryLight: "#E8F5EE",
    primaryBorder: "#A8D5BC",

    success: "#16A34A",
    successLight: "#DCFCE7",
    warning: "#D97706",
    warningBright: "#F59E0B",
    warningLight: "#FEF3C7",
    danger: "#EF4444",
    dangerLight: "#FEF2F2",
    info: "#3B82F6",
    infoLight: "#EFF6FF",
    indigo: "#6366F1",
    indigoLight: "#EDE9FE",
    pink: "#DB2777",
    pinkLight: "#FCE7F3",

    white: "#FFFFFF",
    bg: "#F8FAFC",
    bgSub: "#F9FAFB",
    bgHover: "#F4F7F5",

    border: "#E5E7EB",
    borderFocus: "#1B5C3A",
    divider: "#F1F5F9",

    text: "#111827",
    textSub: "#374151",
    textMuted: "#6B7280",
    textSubtle: "#9CA3AF",
    textPlaceholder: "#CBD5E1",

    errorText: "#DC2626",
    errorBg: "#FEF2F2",
    errorBorder: "#EF4444",
  },

  font: {
    size: {
      micro: 9,
      xs: 10,
      sm: 11,
      base: 12,
      md: 13,
      lg: 14,
      xl: 16,
      "2xl": 19,
    },
    weight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      heavy: 800,
    },
    ls: {
      tight: "-0.025em",
      normal: "0",
      wide: "0.02em",
      wider: "0.04em",
      widest: "0.08em",
    },
    lh: {
      tight: 1.2,
      snug: 1.375,
      normal: 1.5,
    },
    family: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
  },

  space: {
    0: 0,
    0.5: 2,
    1: 4,
    1.5: 6,
    2: 8,
    2.5: 10,
    3: 12,
    3.5: 14,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    10: 40,
    12: 48,
  },

  radius: {
    sm: 4,
    md: 6,
    lg: 8,
    xl: 10,
    "2xl": 12,
    "3xl": 14,
    "4xl": 16,
    "5xl": 20,
    full: 9999,
  },

  shadow: {
    xs: "0 1px 2px rgba(0,0,0,0.05)",
    sm: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
    md: "0 4px 8px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
    lg: "0 8px 24px rgba(0,0,0,0.1)",
    modal: "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
    drawer: "-6px 0 32px rgba(0,0,0,0.1), -1px 0 6px rgba(0,0,0,0.05)",
    popover: "0 4px 16px rgba(15,23,42,0.12), 0 1px 4px rgba(15,23,42,0.06)",
    header: "0 1px 0 rgba(0,0,0,0.04)",
    inset: "inset 0 1px 2px rgba(0,0,0,0.05)",
    focus: (color: string) => `0 0 0 2px ${color}33`,
    cb: (color: string) => `0 1px 4px ${color}55`,
  },

  zIndex: {
    base: 1,
    sticky: 10,
    header: 20,
    dropdown: 30,
    modal: 100,
    drawer: 110,
    popover: 120,
    tooltip: 200,
  },

  component: {
    // ── Layout ──────────────────────────────────────────────
    pageHeaderH: 56,
    filterCardP: 14,
    bodyPadding: 18,
    toolbarH: 72, // ← v4: 40→72 per spec
    rowH: 74, // ← v4: 46→74 per spec
    rowCardGap: 8, // ← v4: gap between card rows
    rowCardR: 12, // ← v4: border-radius of card rows
    expansionP: 12,
    paginationH: 56, // ← v4: taller to fit 36px pills
    bulkSaveBarH: 44,

    // ── Buttons ─────────────────────────────────────────────
    toolbarBtnH: 40, // ← v4: primary toolbar CTA height
    paginationPillSz: 36, // ← v4: pagination pill size
    btnXl: 34,
    btnMd: 30,
    btnSm: 26,
    btnXs: 22,

    // ── Inputs ──────────────────────────────────────────────
    inputH: 28,
    drawerInputH: 32,
    inputHSm: 26,
    searchW: 240, // ← v4: 200→240 per spec
    numCellW: 40,
    numCellWLg: 52,
    dropCellW: 90,

    // ── Table columns (min-width) ────────────────────────────
    colShiftTime: 160,
    colDropTime: 120,
    colBool: 52,
    colNum: 60,
    colAvgSpeed: 76,
    colActions: 80,

    // ── Checkbox ────────────────────────────────────────────
    cbSize: 16,
    cbRadius: 4,

    // ── TimeTag ─────────────────────────────────────────────
    timeBandIconW: 24,
    timeBandIconH: 24,
    timeBandIconR: 7,
    timeBandIconSz: 12,

    // ── Chip / filter button ─────────────────────────────────
    chipH: 26,
    chipPadH: 10,

    // ── Drawer ──────────────────────────────────────────────
    drawerW: 320,
    drawerR: 20,

    // ── Popover ─────────────────────────────────────────────
    popoverW: 218,

    // ── Shared ──────────────────────────────────────────────
    headerPadH: 24, // horizontal padding for header + rows
  },

  transition: {
    fast: "all 0.10s ease",
    normal: "all 0.15s ease",
    slow: "all 0.24s cubic-bezier(0.4, 0, 0.2, 1)",
    drawer: "transform 0.24s cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;

// ── Named shorthand exports ───────────────────────────────────────────────────
export const C = TOKENS.color;
export const F = TOKENS.font;
export const SP = TOKENS.space;
export const R = TOKENS.radius;
export const SH = TOKENS.shadow;
export const Z = TOKENS.zIndex;
export const CM = TOKENS.component;
export const TR = TOKENS.transition;

// ── Shared column template ────────────────────────────────────────────────────
// Used by both ShiftGridHeader and ShiftGridRow to guarantee pixel-perfect
// column alignment between the sticky header and all data rows.
//
// Col map:
//  1 ShiftTime  | 2 DropShift | 3 PickOcc | 4 DropOcc | 5 Peak
//  6 GuardPick  | 7 GuardDrop | 8 AdhocPick | 9 AdhocDrop
//  10 SafeMale  | 11 SafeFemale | 12 AvgSpeed | 13 Actions
export const COL_TEMPLATE =
  "minmax(160px,1fr) 120px 60px 60px 52px 52px 52px 52px 52px 58px 58px 76px 80px";

export default TOKENS;
