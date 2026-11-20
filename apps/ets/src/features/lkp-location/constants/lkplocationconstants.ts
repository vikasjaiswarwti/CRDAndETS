// ─── Status map (used by col.status with renderAs: 'toggle') ─────────────────
export const STATUS_MAP = {
  active:   { label: 'Active',   color: 'green' },
  inactive: { label: 'Inactive', color: 'red'   },
} as const;

// ─── Active / Inactive options ────────────────────────────────────────────────
export const ACTIVE_OPTIONS = [
  { value: 'true',  label: 'Active'   },
  { value: 'false', label: 'Inactive' },
] as const;

export const ACTIVE_LABEL_MAP = Object.fromEntries(
  ACTIVE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<string, string>;

// ─── Auto-Penalty options ─────────────────────────────────────────────────────
export const AUTO_PENALTY_OPTIONS = [
  { value: 'true',  label: 'Yes' },
  { value: 'false', label: 'No'  },
] as const;

export const AUTO_PENALTY_LABEL_MAP = Object.fromEntries(
  AUTO_PENALTY_OPTIONS.map((o) => [o.value, o.label]),
) as Record<string, string>;