// ─── Entity ────────────────────────────────────────────────────────────────
export interface DocumentType {
  docType_Id: string; // GUID (primary key used in API URLs)
  docTypeId: number; // Auto-incremented display ID
  docOwnerTypeId: number;
  docOwnerTypeName: string;
  docTypeName: string;
  active: boolean;
  createdBy: string;
  createdOn: string;
  modBy: string | null;
  modOn: string | null;
}

// ─── DTOs ──────────────────────────────────────────────────────────────────
export interface CreateDocumentTypeDto {
  docOwnerTypeId: number;
  docTypeName: string;
  active: boolean;
}

export interface UpdateDocumentTypeDto extends CreateDocumentTypeDto {
  id: string; // GUID for update operation
}

// ─── List Params ───────────────────────────────────────────────────────────
export interface DocumentTypeListParams {
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
