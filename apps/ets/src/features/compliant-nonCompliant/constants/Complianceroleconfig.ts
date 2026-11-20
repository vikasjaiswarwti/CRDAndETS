// src/features/vehicle-compliance/constants/complianceRoleConfig.ts

import { selectRoles } from "../../navigation/slices/navigationSlice";

// ─── Role constants — MUST be lowercase to match navigationSlice normalization ─
export const COMPLIANCE_ROLES = {
  ADMIN: "admin",
  VENDOR: "vendor",
  TRANSPORT_MANAGER: "transport manager",
} as const;

export type ComplianceRole =
  (typeof COMPLIANCE_ROLES)[keyof typeof COMPLIANCE_ROLES];

// ─── Auth selectors ────────────────────────────────────────────────────────────
// Reads from navigation slice — the single source of truth for roles.
// A user can hold multiple roles at once (e.g. ["employee", "transport manager"]),
// so this returns the full array rather than a single role.
export const selectAuthRole = (state: any): ComplianceRole[] => {
  return (selectRoles(state) ?? []) as ComplianceRole[];
};
// Vendor's transporterId — comes from auth slice user profile.
// Adjust path if your auth slice shape differs.
export const selectAuthTransporterId = (state: any): number | undefined =>
  (state.auth?.user?.transporterId as number) ?? undefined;

// ─── Query defaults ────────────────────────────────────────────────────────────
export const DEFAULT_EXPIRY_DAYS = 30;

// ─── Tab → API filter map ──────────────────────────────────────────────────────
export const TAB_FILTER_MAP: Record<
  string,
  "Active" | "Inactive" | "Pending" | "ReachingNonCompliance"
> = {
  active: "Active",
  inactive: "Inactive",
  pending: "Pending",
  reachingNonCompliance: "ReachingNonCompliance",
};
