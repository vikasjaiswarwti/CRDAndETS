// src/styles/tokens.ts
// ─────────────────────────────────────────────────────────────────────────────
// JavaScript bridge for CSS design tokens.
//
// Use these constants in React inline styles when you cannot use a Tailwind class
// or a CSS variable string directly (e.g. dynamic style objects, canvas, SVG attrs).
//
// Rule: if a value changes, update commutr-variables.css first, then mirror here.
// This file intentionally duplicates the raw hex so JS has access at runtime.
//
// For static styles, always prefer:
//   1. Tailwind utility classes  (className="text-primary bg-primary-subtle")
//   2. CSS variable strings      (style={{ color: "var(--color-brand-primary)" }})
//   3. These constants           (style={{ color: T.brand.primary }})
// ─────────────────────────────────────────────────────────────────────────────

export const T = {
  brand: {
    primary: "#005c3d" /* --color-green-600 / --color-brand-primary */,
    hover: "#004d32" /* --color-green-700 / --color-brand-hover   */,
    active: "#003d27" /* --color-green-800 / --color-brand-active  */,
    subtle: "#e5f3ed" /* --color-green-50  / --color-brand-subtle  */,
    subtleMid: "#97c8b0" /* --color-green-200                         */,
    text: "#003d27" /* --color-green-800 / --color-brand-text    */,
  },

  grey: {
    50: "#fcfcfc" /* --color-grey-50  */,
    100: "#e8e8e8" /* --color-grey-100 */,
    500: "#868686" /* --color-grey-500 */,
  },

  accent: "#3b55ff" /* --color-blue-400 */,

  text: {
    primary: "#111827" /* --color-text-primary   */,
    secondary: "#374151" /* --color-text-secondary */,
    tertiary: "#6b7280" /* --color-text-tertiary  */,
    muted: "#868686" /* --color-text-muted     */,
    placeholder: "#9ca3af" /* --color-text-placeholder */,
  },

  bg: {
    page: "#f7f8fa" /* --color-bg-page    */,
    card: "#ffffff" /* --color-bg-card    */,
    sidebar: "#ffffff" /* --color-bg-sidebar */,
    header: "#ffffff" /* --color-bg-header  */,
  },

  border: {
    default: "#e8e8e8" /* --color-border       */,
    input: "#d1d5db" /* --color-border-input */,
    focus: "#005c3d" /* --color-border-focus */,
  },

  sidebar: {
    activeBg: "#005c3d" /* --color-sidebar-active-bg      */,
    activeText: "#ffffff" /* --color-sidebar-active-text    */,
    activeSubBg: "#c8e6d4" /* --color-sidebar-active-sub-bg  */,
    hoverBg: "#e8f5ee" /* --color-sidebar-hover-bg       */,
    defaultText: "#005c3d" /* --color-sidebar-default-text   */,
  },

  status: {
    success: "#006c49" /* --color-success */,
    warning: "#f59e0b" /* --color-warning */,
    error: "#ef4444" /* --color-error   */,
    info: "#3b82f6" /* --color-info    */,
  },

  error: {
    bg: "#fef2f2",
    border: "#fca5a5",
    text: "#dc2626",
  },

  /* Layout */
  layout: {
    // sidebarExpanded: 220 /* px — --sidebar-width-expanded  */,
    sidebarExpanded: "15%",
    sidebarCollapsed: 64 /* px — --sidebar-width-collapsed */,
    headerHeight: 56 /* px — --header-height           */,
  },

  /* Radius */
  radius: {
    sm: "6px" /* --radius-sm  */,
    md: "8px" /* --radius-md  */,
    lg: "12px" /* --radius-lg  */,
    xl: "16px" /* --radius-xl  */,
    "2xl": "24px" /* --radius-2xl */,
  },

  /* Font */
  font: {
    sans: '"Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  formcss: {
    green: "#1B4332", // 
    greenDark: "#163b2c",
    greenMid: "#52796F",
    greenLight: "#B7E4C7",
    greenPale: "#F0FAF4",

    greyBorder: "#DCE3EA", // input border color
    greenAccent: "#4CAF82",
    borderFocus: "#4CAF82",
    pageBg: "#f8f9fa",  // form page BG

    inputBg: "#F5F7FA", // input background color
    lockedBg: "#eef3f0",
    sectionBorder: "#e0f0e8",
    error: "#e53e3e",
    label: "#52796F",
    text: "#1a3a2a",
    textMuted: "#6b8f7a",
    white:"#fff",

    iconColor: "#BFC9D1",
  },
  quickaction: {
    containerBg: "#ffffff",
    containerBorder: "#E8F5EE",

    /** Card tile */
    cardBg: "#E6F3ED",
    cardBorder: "#E8F5EE",
    cardBorderHover: "#1B4332",
    cardBorderSelected: "#1B4332",
    cardBgSelected: "#E6F3ED",

    /** Icon colour */
    iconStroke: "#1B4332",

    /** Label */
    labelColor: "#1B4332",

    /** Badge */
    badgeBg: "#F59E0B",   // amber-400 – matches the orange badge in the new UI
    badgeText: "#ffffff",

    /** Section heading */
    headingColor: "#111827",
  },
  page:{
    bg: "#f8f9fa",  // form page BG
  }
} as const;

export type TokenKey = typeof T;
