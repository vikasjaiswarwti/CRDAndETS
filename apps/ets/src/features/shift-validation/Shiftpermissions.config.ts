/**
 * PERMISSION CONFIGURATION
 * ─────────────────────────────────────────────────────────────────────────────
 * This is the ONLY file you touch to change what a role can do in shift-validation.
 * Add/remove roles here. Feature code reads from this — zero logic scattered elsewhere.
 */

export type ShiftPermissionRole = 'admin' | 'manager' | 'viewer' | 'operator';

export interface ShiftPermissions {
  canView: boolean;
  canFetch: boolean;
  canModifyNormal: boolean;
  canModifyUserWise: boolean;
  canModifyDeptWise: boolean;
  canModifyLobWise: boolean;
  canModifyProcessWise: boolean;
}

const PERMISSION_MAP: Record<ShiftPermissionRole, ShiftPermissions> = {
  admin: {
    canView: true,
    canFetch: true,
    canModifyNormal: true,
    canModifyUserWise: true,
    canModifyDeptWise: true,
    canModifyLobWise: true,
    canModifyProcessWise: true,
  },
  manager: {
    canView: true,
    canFetch: true,
    canModifyNormal: false,
    canModifyUserWise: true,
    canModifyDeptWise: true,
    canModifyLobWise: true,
    canModifyProcessWise: true,
  },
  operator: {
    canView: true,
    canFetch: true,
    canModifyNormal: false,
    canModifyUserWise: false,
    canModifyDeptWise: false,
    canModifyLobWise: false,
    canModifyProcessWise: false,
  },
  viewer: {
    canView: true,
    canFetch: true,
    canModifyNormal: false,
    canModifyUserWise: false,
    canModifyDeptWise: false,
    canModifyLobWise: false,
    canModifyProcessWise: false,
  },
};

export const VALIDATE_TYPE_MODIFY_KEY: Record<
  number,
  keyof ShiftPermissions
> = {
  1: 'canModifyNormal',
  2: 'canModifyUserWise',
  3: 'canModifyDeptWise',
  4: 'canModifyLobWise',
  5: 'canModifyProcessWise',
};

export function getShiftPermissions(role: ShiftPermissionRole): ShiftPermissions {
  return PERMISSION_MAP[role] ?? PERMISSION_MAP.viewer;
}

export function canModifyMode(
  permissions: ShiftPermissions,
  validateType: number,
): boolean {
  const key = VALIDATE_TYPE_MODIFY_KEY[validateType];
  return key ? permissions[key] : false;
}