// ─── Status Map ───────────────────────────────────────────────────────────────
export const STATUS_MAP = {
  active:   { label: 'Yes',   color: 'green' },
  inactive: { label: 'No', color: 'red'   },
} as const;

interface SelectProp {
  label:string;
  value:string | number | any;
}
// ─── isActive Options ─────────────────────────────────────────────────────────
export const ACTIVE_OPTIONS:SelectProp[] = [
  { value: 'true',  label: 'Yes'   },
  { value: 'false', label: 'No' },
];

export const ACTIVE_LABEL_MAP = Object.fromEntries(
  ACTIVE_OPTIONS.map((o) => [o.value, o.label])
) as Record<string, string>;

// ─── Trip Type Options ────────────────────────────────────────────────────────
export const TRIP_TYPE_OPTIONS:SelectProp[] = [
  { value: 1, label: 'Login'  },
  { value: 2, label: 'Logout'    },
 
];

export const TRIP_TYPE_LABEL_MAP = Object.fromEntries(
  TRIP_TYPE_OPTIONS.map((o) => [o.value, o.label])
) as Record<string, string>;

// ─── Shift Options (typical shift IDs — adjust if backend provides enum) ──────
export const SHIFT_OPTIONS = [
  { value: '1', label: 'Morning Shift' },
  { value: '2', label: 'Afternoon Shift' },
  { value: '3', label: 'Night Shift'   },
] as const;

export const SHIFT_LABEL_MAP = Object.fromEntries(
  SHIFT_OPTIONS.map((o) => [o.value, o.label])
) as Record<string, string>;

