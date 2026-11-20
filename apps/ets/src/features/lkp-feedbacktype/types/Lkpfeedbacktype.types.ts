export interface LkpFeedbackType {
  feedbackType_ID: string;
  feedbackTypeID: number;
  feedbackType: string;
  isActive: boolean;
  createdBy: string;
  createdOn: string | null;
}

export interface CreateLkpFeedbackTypeDto {
  feedbackType: string;
  isActive: boolean;
}

export interface UpdateLkpFeedbackTypeDto extends CreateLkpFeedbackTypeDto {
  id: string;
}

export interface LkpFeedbackTypeListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
