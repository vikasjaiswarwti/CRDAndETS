// ─── EHS Check Item ───────────────────────────────────────────────────────────
export interface EhsCheck {
  ehs_Id: number;
  status: string;
}

// ─── Main Entity ──────────────────────────────────────────────────────────────
export interface TransEhs {
  locCode: number;
  vehicleId: number;
  ehsChecks: EhsCheck[];
}

// ─── Create DTO (POST body) ───────────────────────────────────────────────────
export interface CreateTransEhsDto {
  locCode: number;
  vehicleId: number;
  ehsChecks: EhsCheck[];
}

// ─── API Response ─────────────────────────────────────────────────────────────
// Adjust this shape to match actual API response if different
export interface TransEhsResponse {
  success: boolean;
  message?: string;
  data?: TransEhs;
}