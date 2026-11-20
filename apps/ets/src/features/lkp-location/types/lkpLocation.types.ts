// ─── Entity (field names match GET response exactly) ──────────────────────────
export interface LkpLocation {
  lkpLocation_Id: string;
  locCode: number;
  locName: string;
  lat: number | null;
  lng: number | null;
  address: string | null;
  city: string | null;
  state: string | null;
  dispName: string | null;
  locGroup: string | null;
  cityZone: string | null;
  helpDeskContactNumber: string | null;
  sosContactNumber: string | null;
  driverAppIVRNumber: string | null; // uppercase IVR — matches GET response
  userAppIVRNumber: string | null; // uppercase IVR — matches GET response
  active: boolean | null;
  isAutoPenalty: boolean | null;
  createdBy: string;
  createdOn: string;
  modBy: string | null;
  modOn: string | null;
}

// ─── Create DTO (field names match POST body exactly) ─────────────────────────
// NOTE: POST/PUT body uses lowercase "Ivr" (driverAppIvrNumber / userAppIvrNumber)
//       while GET response returns uppercase "IVR". Both are intentional per API.
export interface CreateLkpLocationDto {
  locCode: number;
  locName: string;
  lat: number | null;
  lng: number | null;
  address: string | null;
  city: string | null;
  state: string | null;
  dispName: string | null;
  locGroup: string | null;
  cityZone: string | null;
  helpDeskContactNumber: string | null;
  sosContactNumber: string | null;
  driverAppIvrNumber: string | null; // lowercase Ivr — matches POST/PUT body
  userAppIvrNumber: string | null; // lowercase Ivr — matches POST/PUT body
  active: boolean | null;
  isAutoPenalty: boolean | null;
}

// ─── Update DTO ───────────────────────────────────────────────────────────────
export interface UpdateLkpLocationDto extends CreateLkpLocationDto {
  id: string; // mapped from lkpLocation_Id before PUT call
}

// ─── List Params ──────────────────────────────────────────────────────────────
export interface LkpLocationListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}

// ─── Paginated Response (normalised via transformResponse) ────────────────────
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
