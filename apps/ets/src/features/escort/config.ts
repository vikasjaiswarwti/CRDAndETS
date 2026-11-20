// src/features/menu-management/config.ts

export const ESCORT_CONFIG = {
  canCreate: true, // ← flip true when commit 2 is ready to go live
  canUpdate: true, // ← flip true when commit 3 is ready to go live
  canDelete: false,
  canBulk: true,
} as const;
