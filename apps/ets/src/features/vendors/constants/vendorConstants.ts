export const STATUS_MAP = {
  true: { label: "Active", color: "green" },
  false: { label: "Inactive", color: "red" },
} as const;

export const ACTIVE_OPTIONS = [
  { value: true, label: "Active" },
  { value: false, label: "Inactive" },
] as const;

export const SINGLE_PLAN_OPTIONS = [
  { value: true, label: "Single Plan" },
  { value: false, label: "Multiple Plans" },
] as const;

// Derived label maps (useful for display and forms)
export const ACTIVE_LABEL_MAP = Object.fromEntries(
  ACTIVE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<string, string>;

export const SINGLE_PLAN_LABEL_MAP = Object.fromEntries(
  SINGLE_PLAN_OPTIONS.map((option) => [option.value, option.label]),
) as Record<string, string>;
