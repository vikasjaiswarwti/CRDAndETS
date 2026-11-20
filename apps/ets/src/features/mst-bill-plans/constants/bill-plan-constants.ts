// ─── Status Map ────────────────────────────────────────────────────────────
export const STATUS_MAP = {
  active:   { label: 'Active',   color: 'green' },
  inactive: { label: 'Inactive', color: 'red'   },
} as const;

// ─── Active / Status Options ───────────────────────────────────────────────
export const ACTIVE_OPTIONS = [
  { value: 'true',  label: 'Active'   },
  { value: 'false', label: 'Inactive' },
] as const;

export const ACTIVE_LABEL_MAP = Object.fromEntries(
  ACTIVE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<string, string>;

// ─── Location Code Options ─────────────────────────────────────────────────
// Extend this list as location codes are defined in your system
export const LOC_CODE_OPTIONS = [
  { value: 1, label: 'Location 1' },
  { value: 2, label: 'Location 2' },
] as const;

export const LOC_CODE_LABEL_MAP = Object.fromEntries(
  LOC_CODE_OPTIONS.map((o) => [String(o.value), o.label]),
) as Record<string, string>;