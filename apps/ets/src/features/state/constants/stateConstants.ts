// FILE 4 — constants/stateConstants.ts

// The State entity has no status / boolean field in the API response,
// so there is no STATUS_MAP needed here.
// Keep this file for any future select fields or label maps.

export const SORT_ORDER_OPTIONS = [
  { value: 'asc',  label: 'Ascending'  },
  { value: 'desc', label: 'Descending' },
] as const;

export const SORT_ORDER_LABEL_MAP = Object.fromEntries(
  SORT_ORDER_OPTIONS.map((o) => [o.value, o.label])
) as Record<string, string>;