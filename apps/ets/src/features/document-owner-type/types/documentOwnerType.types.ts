// ─── Entity ────────────────────────────────────────────────────────────────
export interface DocumentOwnerType {
  docOwnerType_Id: string; // GUID (primary key for API)
  docOwnerTypeId: number; // Auto-incremented display ID
  docOwnerTypeName: string;
  active: boolean;
  createdBy: string;
  createdOn: string;
  modBy: string | null;
  modOn: string | null;
}

// ─── DTOs ──────────────────────────────────────────────────────────────────
export interface CreateDocumentOwnerTypeDto {
  docOwnerTypeName: string;
  active: boolean;
}

export interface UpdateDocumentOwnerTypeDto extends CreateDocumentOwnerTypeDto {
  id: string; // Matches the GUID used in URL and payload
}

// ─── List Params ───────────────────────────────────────────────────────────
export interface DocumentOwnerTypeListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}

// ─── Paginated Response ────────────────────────────────────────────────────
// Using shared generic type for consistency across the project
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
