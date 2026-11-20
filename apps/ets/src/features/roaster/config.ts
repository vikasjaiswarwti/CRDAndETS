// ─────────────────────────────────────────────────────────────────────────────
// FILE 1: src/features/roster/config.ts
// Configurable permissions for schedule actions — same pattern as LOCATION_CONFIG
// ─────────────────────────────────────────────────────────────────────────────

export const SCHEDULE_CONFIG = {
  canCreate: true,
  canEdit: true, // shows Edit icon in table
  canCancel: true, // shows Cancel icon in table
} as const;

export const ADHOC_REQUEST_CONFIG = {
  allowMultipleEmployees: false,
} as const;
