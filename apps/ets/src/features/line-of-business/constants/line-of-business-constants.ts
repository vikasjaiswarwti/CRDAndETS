// ─── Status map (used by col.status in the table) ────────────────────────────
export const STATUS_MAP = {
  active: { label: "Active", color: "green" },
  inactive: { label: "Inactive", color: "red" },
} as const;

// ─── Active / Inactive select options ────────────────────────────────────────
export const ACTIVE_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
] as const;

export const ACTIVE_LABEL_MAP = Object.fromEntries(
  ACTIVE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<string, string>;
