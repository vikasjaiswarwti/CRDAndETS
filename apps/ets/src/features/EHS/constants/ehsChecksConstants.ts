// ─── Status Map ───────────────────────────────────────────────────────────────
// Used by col.status() in use{Feature}Table
export const STATUS_MAP = {
    active: { label: 'Active', color: 'green' },
    inactive: { label: 'Inactive', color: 'red' },
} as const;

// ─── Active / Inactive Options ────────────────────────────────────────────────
// Used in form field select dropdowns
export const ACTIVE_OPTIONS = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
] as const;

export const ACTIVE_LABEL_MAP = Object.fromEntries(
    ACTIVE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<string, string>;

// ─── EHS Type Options ─────────────────────────────────────────────────────────
// Extend this list as your domain grows; keep it here — never inline in a component
export const EHS_TYPE_OPTIONS = [
    { value: 'Fire Safety', label: 'Fire Safety' },
    { value: 'Electrical Safety', label: 'Electrical Safety' },
    { value: 'Chemical Handling', label: 'Chemical Handling' },
    { value: 'Personal Protection', label: 'Personal Protection' },
    { value: 'Emergency Procedures', label: 'Emergency Procedures' },
    { value: 'Environmental', label: 'Environmental' },
    { value: 'Health & Hygiene', label: 'Health & Hygiene' },
] as const;

export const EHS_TYPE_LABEL_MAP = Object.fromEntries(
    EHS_TYPE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<string, string>;