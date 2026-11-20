export const STATUS_MAP = {
  active: { label: "Active", color: "green" },
  inactive: { label: "Inactive", color: "red" },
} as const;

export const ACTIVE_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
] as const;

export const ACTIVE_LABEL_MAP = Object.fromEntries(
  ACTIVE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<string, string>;

export const DAY_OPTIONS = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "7", label: "Sunday" },
] as const;

export const DAY_LABEL_MAP = Object.fromEntries(
  DAY_OPTIONS.map((o) => [o.value, o.label]),
) as Record<string, string>;
