import type { PermissionKey } from "../types/SystemRolePermission.types";

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

/** The 5 permission columns shown in the Menu Access table */
export const PERMISSION_COLUMNS: Array<{
  key: PermissionKey;
  label: string;
  width: number;
}> = [
  { key: "view", label: "VIEW", width: 68 },
  { key: "create", label: "CREATE", width: 68 },
  { key: "edit", label: "EDIT", width: 68 },
  { key: "delete", label: "DELETE", width: 68 },
  { key: "export", label: "EXPORT", width: 68 },
];

/** Default permission set for a new menu row */
export const DEFAULT_PERMISSIONS: Record<PermissionKey, boolean> = {
  view: false,
  create: false,
  edit: false,
  delete: false,
  export: false,
};

export const ROLE_PAGE_SIZE = 50; // roles sidebar loads all at once (small list)
export const MENU_PAGE_SIZE = 100; // menus loaded all at once for permission grid


/** Set to false to disable automatic role-menu mapping after menu creation */
export const ENABLE_AUTO_ROLE_MAPPING = true;