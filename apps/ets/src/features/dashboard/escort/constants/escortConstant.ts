
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
  { value:1, label: 'Login'  },
  { value: 2, label: 'Logout'    },
 
];

export const TRIP_TYPE_LABEL_MAP = Object.fromEntries(
  TRIP_TYPE_OPTIONS.map((o) => [o.value, o.label])
) as Record<string, string>;


