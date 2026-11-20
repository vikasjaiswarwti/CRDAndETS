// ─── Employee Types ─────────────────────────────────────────────────────────
// Field names match backend API exactly — do not rename

export type Gender = "M" | "F" | "O";

export interface UserStage {
  id: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string;
  mobileNo: string;
  emailId: string;
  gender: Gender;
  address: string | null;
  city: string | null;
  state: string | null;
  stateCode: string | number;
  pin: string | null;
  phoneNo: string | null;
  emerContactNo: string | null;
  employeeId: string | null;
  empType: string | null;
  empTypeId: number;
  locCode: string | null;
  depCode: string | null;
  proCode: string | null;
  lobCode: string | null;
  geocodeId: string | null;
  areaId: number | null;
  zoneId: number | null;
  empLat: number | null;
  empLng: number | null;
  locationName: string | null;
  nodalPick: string | null;
  nodalDrop: string | null;
  supId: string | null;
  supervisorName: string | null;
  supEmployeeId: string | null;
  spoc: string | null;
  spocEmployeeId: string | null;
  useDayPickupPoint: boolean | null;
  specialNeeds: string | null;
  tpin: string | null;
  actionType: string | null;
  departmentName: string | null;
  projectName: string | null;
  regisLocation: string | null;
  ipAddress: string | null;
  createdAt?: string;
  userStage_Id?: string;
  isActive: boolean;
  status?: "pending" | "approved" | "rejected";
  ownTransport?: boolean;
  transport?: boolean;
  locality?: string;
}

// export interface ApprovedUser {
//   id: string;
//   userStage_Id: string;
//   firstName: string | null;
//   lastName: string;
//   mobileNo: string;
//   emailId: string;
//   gender: Gender;
//   empType: string | null;
//   employeeId: string | null;
//   departmentName: string | null;
//   projectName: string | null;
//   locationName: string | null;
//   isActive: boolean;
//   createdOn: string;
// }

export interface ApprovedUser {
  user_Id: string;
  id: string;
  userStage_Id: string;
  empId: number;

  firstName: string | null;
  middleName: string | null;
  lastName: string;

  gender: Gender;
  emailId: string;

  address: string | null;
  city: string | null;

  state: string | null;
  stateCode: string | number;
  pin: string | null;
  mobileNo: string;
  phoneNo: string | null;
  emerContactNo: string | null;

  employeeId: string | null;
  empType: string | null;
  empTypeId: number;
  locCode: string | null;
  depCode: string | null;
  proCode: string | null;
  lobCode: string | null;
  geocodeId: string | null;
  areaId: number | null;
  zoneId: number | null;
  empLat: number | null;
  empLng: number | null;

  special_Needs: number | null;

  locationName: string | null;

  lobName: string | null;
  nodalPick: string | null;
  nodalDrop: string | null;
  supId: string | null;
  supervisorName: string | null;
  supEmployeeId: string | null;
  spoc: string | null;
  spocEmployeeId: string | null;
  useDayPickupPoint: boolean | null;
  specialNeeds: string | null;
  tpin: string | null;
  actionType: string | null;
  departmentName: string | null;
  projectName: string | null;
  regisLocation: string | null;
  ipAddress: string | null;
  createdOn: string;
  isActive: boolean;
  status?: "pending" | "approved" | "rejected";
  ownTransport?: boolean;
  transport?: boolean;
  locationList?: { locCode: number; locName: string }[];
  noShowCount: Number;
}

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface CreateUserStageDto {
  id: string | null;
  locCode: string | null;
  depCode: string | null;
  proCode: string | null;
  lobCode: string | null;
  gender: Gender;
  city: string | null;
  pin: string | null;
  state: string | null;
  stateCode: string | number | null;
  phoneNo: string | null;
  emerContactNo: string | null;
  address: string | null;
  supId: string | null;
  empType: string | null;
  empTypeId: number;
  transport: string | null;
  useDayPickupPoint: boolean | null;
  nodalPick: string | null;
  nodalDrop: string | null;
  geocodeId: string | null;
  empLat: number | null;
  empLng: number | null;
  locationName: string | null;
  employeeId: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string;
  mobileNo: string;
  emailId: string;
  specialNeeds: string | null;
  supEmployeeId: string | null;
  spocEmployeeId: string | null;
  spoc: string | null;
  tpin: string | null;
  actionType: string | null;
  supervisorName: string | null;
  departmentName: string | null;
  projectName: string | null;
  regisLocation: string | null;
  ipAddress: string | null;
  locality: string | null;
}

export interface UpdateUserStageDto extends CreateUserStageDto {
  id: string;
}

// Admin register/edit form only — area & zone are assigned when editing an
// approved user, never during (public or admin) user creation.
export interface EmployeeFormDto extends CreateUserStageDto {
  areaId: number | null;
  zoneId: number | null;
}

export interface BulkCreateDto {
  users: CreateUserStageDto[];
}

// ─── List Params ──────────────────────────────────────────────────────────────

export interface UserStageListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}

export interface ApprovedUserListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
  isSystem?: boolean;
  locCode?: number;
}

// ─── Responses ────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Office-wise (locCode) flags telling the UI whether the Area / Zone
// dropdowns should be offered for the office currently being listed.
export interface ApprovedUsersResponse extends PaginatedResponse<ApprovedUser> {
  isAreaDDLEnabled: boolean;
  isZoneDDlEnabled: boolean;
}

// ─── Google Maps ──────────────────────────────────────────────────────────────

export interface AddressComponents {
  fullAddress: string;
  city: string;
  state: string;
  stateCode: string;
  pin: string;
  lat: number;
  lng: number;
  locality?: string; // ← add this field
}

// Add to your API Types section
export interface UpdateApprovedUserDto {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender?: string;
  address?: string;
  city?: string;
  stateCode?: number;
  pin?: string;
  mobileNo?: string;
  emercontactNo?: string | null;
  phoneNo?: string | null;
  emailId?: string;
  employeeId?: string;
  special_Needs?: number;
  locCode?: number;
  depCode?: string;
  proCode?: string;
  lobCode?: number;
  areaId?: number;
  zoneId?: number;
  supId?: string | null;
  supEmployeeId?: string | null;
  spoc?: string | null;
  spocEmployeeId?: string | null;
  empTypeId?: number;
  emp_Lat?: number;
  emp_Lng?: number;
  nodal_Pick?: string | null;
  nodal_Drop?: string | null;
  geocodeId?: string | null;
}

export interface CreateUserByRoleDto {
  firstName: string;
  lastName: string;
  emailId: string;
  mobileNo: string;
  locCode: number;
  roleName: string;
}
