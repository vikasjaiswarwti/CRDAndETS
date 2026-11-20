// tailwind.config.ts
// ─────────────────────────────────────────────────────────────────────────────
// All color values reference CSS custom properties defined in commutr-variables.css.
// To change a color: edit commutr-variables.css only — Tailwind classes update automatically.
//
// Tailwind v4 note:
//   • No `content` array — v4 scans via Vite plugin automatically
//   • Extend colors via this config OR via @theme in CSS (we use config for team clarity)
// ─────────────────────────────────────────────────────────────────────────────

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",

  theme: {
    extend: {
      colors: {
        /* ── Brand greens ── */
        green: {
          50: "var(--color-green-50)",
          200: "var(--color-green-200)",
          300: "var(--color-green-300)",
          400: "var(--color-green-400)",
          500: "var(--color-green-500)",
          600: "var(--color-green-600)",
          700: "var(--color-green-700)",
          800: "var(--color-green-800)",
          950: "var(--color-green-950)",
        },

        /* ── Grey scale ── */
        grey: {
          50: "var(--color-grey-50)",
          100: "var(--color-grey-100)",
          500: "var(--color-grey-500)",
        },

        /* ── Accent ── */
        blue: {
          400: "var(--color-blue-400)",
        },

        /* ── Semantic aliases — use these in components ── */
        primary: {
          DEFAULT: "var(--color-brand-primary)",
          hover: "var(--color-brand-hover)",
          active: "var(--color-brand-active)",
          subtle: "var(--color-brand-subtle)",
          text: "var(--color-brand-text)",
        },

        brand: {
          primary: "var(--color-brand-primary)",
          hover: "var(--color-brand-hover)",
          subtle: "var(--color-brand-subtle)",
        },

        /* ── Status ── */
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
        info: "var(--color-info)",

        /* ── Surfaces ── */
        surface: "var(--color-bg-card)",
        page: "var(--color-bg-page)",
        sidebar: "var(--color-bg-sidebar)",

        /* ── Text ── */
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",
      },

      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
        mono: ["var(--font-mono)"],
      },

      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },

      boxShadow: {
        card: "var(--shadow-card)",
        sidebar: "var(--shadow-sidebar)",
      },

      /* Sidebar width tokens as spacing values */
      spacing: {
        "sidebar-expanded": "var(--sidebar-width-expanded)",
        "sidebar-collapsed": "var(--sidebar-width-collapsed)",
        header: "var(--header-height)",
      },

      transitionTimingFunction: {
        sidebar: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },

  plugins: [],
};

export default config;
