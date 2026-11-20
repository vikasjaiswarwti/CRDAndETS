// src/shared/lib/ui-lib/theme/antdTheme.ts
//
// ─── COMMUTR Design System — Ant Design Token Overrides ──────────────────────
//
//  Import this object into your ConfigProvider at the app root:
//
//    import { antdTheme } from './shared/lib/ui-lib/theme/antdTheme';
//    <ConfigProvider theme={antdTheme}>...</ConfigProvider>
//
// ─────────────────────────────────────────────────────────────────────────────

import type { ThemeConfig } from "antd";

export const antdTheme: ThemeConfig = {
  token: {
    // ── Brand colours ──────────────────────────────────────────────────────
    colorPrimary: "#1B4332",
    colorSuccess: "#52796F",
    colorLink: "#1B4332",
    colorLinkHover: "#52796F",

    // ── Typography ─────────────────────────────────────────────────────────
    fontFamily:
      "'DM Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,
    colorText: "#1a202c",
    colorTextSecondary: "#718096",

    // ── Borders & radius ───────────────────────────────────────────────────
    borderRadius: 8,
    colorBorder: "#B7E4C7",
    colorBorderSecondary: "#e8f5ee",

    // ── Backgrounds ────────────────────────────────────────────────────────
    colorBgContainer: "#ffffff",
    colorBgLayout: "#F7FAF8",
    colorFillAlter: "#F0FAF4", // table stripe / form field bg

    // ── Shadows ────────────────────────────────────────────────────────────
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    boxShadowSecondary: "0 2px 8px rgba(27,67,50,0.12)",
  },
  components: {
    // ── Table ──────────────────────────────────────────────────────────────
    Table: {
      headerBg: "#F8FBF9",
      headerColor: "#52796F",
      headerSortActiveBg: "#EEF7F2",
      rowHoverBg: "#F0FAF4",
      borderColor: "#e8f5ee",
      cellPaddingBlock: 14,
      cellPaddingInline: 16,
    },

    // ── Form inputs ────────────────────────────────────────────────────────
    Input: {
      activeBorderColor: "#1B4332",
      hoverBorderColor: "#52796F",
      activeShadow: "0 0 0 2px rgba(27,67,50,0.12)",
      colorBgContainer: "#F0FAF4",
    },
    Select: {
      colorBgContainer: "#F0FAF4",
      optionSelectedBg: "#e8f5ee",
      optionActiveBg: "#f0faf4",
    },
    InputNumber: {
      activeBorderColor: "#1B4332",
      activeShadow: "0 0 0 2px rgba(27,67,50,0.12)",
      colorBgContainer: "#F0FAF4",
    },

    // ── Switch (isActive toggle) ────────────────────────────────────────────
    Switch: {
      colorPrimary: "#1B4332",
      colorPrimaryHover: "#52796F",
    },

    // ── Button ─────────────────────────────────────────────────────────────
    Button: {
      primaryColor: "#ffffff",
      colorPrimary: "#1B4332",
      colorPrimaryHover: "#52796F",
      colorPrimaryActive: "#0d2b1e",
      defaultBorderColor: "#B7E4C7",
      defaultColor: "#52796F",
    },

    // ── Modal ──────────────────────────────────────────────────────────────
    Modal: {
      borderRadiusLG: 16,
      paddingContentHorizontalLG: 28,
      // Greenish overlay — applied via styles.mask in each Modal call
    },

    // ── Pagination ─────────────────────────────────────────────────────────
    Pagination: {
      colorPrimary: "#1B4332",
      colorPrimaryHover: "#52796F",
      itemActiveBg: "#1B4332",
    },

    // ── Tag / Badge ────────────────────────────────────────────────────────
    Tag: {
      defaultBg: "#e8f5ee",
      defaultColor: "#1B4332",
    },
  },
};
