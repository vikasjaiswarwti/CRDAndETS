export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
export type ReportRow = Record<string, unknown>;

// -------------------
export interface SelectOption {
  label: string;
  value: number;
}
export interface BillingCalculationResponse {
  errorCode: number;
  dB_Response: string;
}
// Shared required metadata
export interface CommonRateCardMeta {
  RateCard: string;
  RateTitle: string;
}
// Dynamic payload where all slab fields are optional
export interface OptionalSlabPayload {
  [key: string]: unknown;
}

// Combined type: Common required fields + Optional dynamic fields
export type DynamicTariffSlab = CommonRateCardMeta & OptionalSlabPayload;
// Add this interface alongside the others
export interface PenaltyReportRequest {
    LocCode: number;
    BillingID: number;
}