export const EMPLOYEE_CONFIG = {
  canCreate: false,
  canEdit: true,
  canCancel: true,
  canTransport:true,
  canResetPassword: true,
  passwordPolicy: "strong" as "strong" | "weak",

  canBulk: false,
  canStageCreate: true,
  canStageEdit: true,
  canStageCancel: false,
  canStageBulk: true,
  // cancel Tab
  canApproveCancel: true,
  canEditCancel: false
} as const;
