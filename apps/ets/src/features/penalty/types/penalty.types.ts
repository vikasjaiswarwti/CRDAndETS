// ─── Lookup types (from GET endpoints) ────────────────────────────────────────

export interface PenaltyApplicable {
  ApplicableID: number;
  ApplicableName: string;
}

export interface SelectOption {
  label: string;
  value: string | number;
}
export interface PenaltyApplicableOn {
  PenaltyApplicableOnID: number;
  PenaltyApplicableOnName: string;
}

export interface PenaltyApplicableReason {
  PenaltyTypeid: number;
  Penalty_type: string;
}

// ─── Main entity ───────────────────────────────────────────────────────────────

export interface Penalty {
  sno: number;
  rowNumber: number;
  locCode: number;
  locName: string;
  billingID: number;
  billingRange: string;
  tripId: number;
  amount: number;
  applicableId: number;
  applicableName: string;
  applicableOnId: number;
  applicableOnName: string;
  penaltyTypeId: number;
  penaltyReason: string;
  remarks: string;
  status: string;
  statusCode: number;
  createdBy: string;
  createdOn: string;
  totalCount: number;
}

// ─── DTOs ──────────────────────────────────────────────────────────────────────

export interface PenaltyCreateDto {
  SNO: number;          // 0 for new
  LocCode: number;
  BillingID: number;
  DSID: number;
  ApplicableOnId: number;
  PenaltyType_id: number;
  Amount: number;
  Remarks: string;
  Status: number;
}

// ─── List params (body for POST list endpoint) ─────────────────────────────────

export interface PenaltyListParams {
  LocCode: number;
  Status: number;
  BillingID: number;
  SearchText: string;
  Page: number;
  PageSize: number;
}

// ─── Report params ─────────────────────────────────────────────────────────────

export interface PenaltyReportParams {
  LocCode: number;
  BillingID: number;
}

// ─── Paginated response — match actual API shape ───────────────────────────────

export interface PenaltyListResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
