// src/features/role-management/constants/roleConstants.ts

export const ROLE_STATUS_MAP = {
  true: { label: "Active", color: "success" },
  false: { label: "Inactive", color: "error" },
} as const;

export const ACTIVE_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
] as const;

export const ACTIVE_LABEL_MAP = Object.fromEntries(
  ACTIVE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<string, string>;
