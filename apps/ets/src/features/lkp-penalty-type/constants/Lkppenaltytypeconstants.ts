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

export const APPLICABLE_TO_OPTIONS = [
  { value: 1, label: "Driver" },
  { value: 2, label: "Passenger" },
  { value: 3, label: "Both" },
] as const;
