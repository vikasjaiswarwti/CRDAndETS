export const GENDER_OPTIONS = [
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
  { value: "O", label: "Other" },
];

export const GENDER_LABEL_MAP = Object.fromEntries(
  GENDER_OPTIONS.map((o) => [o.value, o.label]),
) as Record<string, string>;

export const EMP_TYPE_OPTIONS = [
  { value: "1", label: "Permanent" },
  { value: "2", label: "Contract" },
  { value: "3", label: "Intern" },
  { value: "4", label: "Consultant" },
];

export const EMP_TYPE_LABEL_MAP = Object.fromEntries(
  EMP_TYPE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<string, string>;

export const EMP_TYPE_ID_MAP: Record<string, number> = {
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
};

export const SPECIAL_NEEDS_OPTIONS = [
  { value: "none", label: "None" },
  { value: "pregnancy", label: "Pregnancy" },
  { value: "specially abled", label: "Specially Abled" },
];

export const STATUS_MAP = {
  pending: { label: "Pending", color: "orange" },
  approved: { label: "Approved", color: "green" },
  rejected: { label: "Rejected", color: "red" },
  active: { label: "Active", color: "green" },
  inactive: { label: "Inactive", color: "red" },
} as const;
export const ACTIVE_MAP = {
  true: { label: "Active", color: "green" },
  false: { label: "InActive", color: "red" },

} as const;

// Indian States for address auto-fill fallback
export const INDIA_STATES = [
  { value: "1", label: "Delhi" },
  { value: "MH", label: "Maharashtra" },
  { value: "KA", label: "Karnataka" },
  { value: "TN", label: "Tamil Nadu" },
  { value: "GJ", label: "Gujarat" },
  { value: "RJ", label: "Rajasthan" },
  { value: "UP", label: "Uttar Pradesh" },
  { value: "WB", label: "West Bengal" },
  { value: "HR", label: "Haryana" },
  { value: "PB", label: "Punjab" },
];

