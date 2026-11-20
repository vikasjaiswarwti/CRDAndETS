export interface AddressChange {
  profileUpdate_Id: string;
  id: number;
  empID: number | null;
  locCode: number | null;
  locationName: string | null;
  city: string;
  pin: number | null;
  state: string | null;
  stateCode: number;
  mobileNo: string | null;
  emerContactNo: string | null;
  geocodeID: number | null;
  emp_Lat: number | null;
  emp_Lng: number | null;
  remarks: string | null;
  address: string | null;
  actionType: string | null;
  nodal_Pick: string | null;
  nodal_Drop: string | null;
  updatE_DATE: string | null;
  effectivedate: string | null;
  rejection_Remark: string | null;
  createdBy: string;
  createdOn: string;
  modBy: string | null;
  modOn: string | null;
  employeeName: string | null;
  status: string | null;
}

export interface CreateAddressChangeDto {
  empID: number;
  locCode: number | null;
  city: string;
  pin: number | null;
  state: string | null;
  stateCode: number;
  mobileNo: string | null;
  emerContactNo: string | null;
  geocodeID: number;
  emp_Lat: number;
  emp_Lng: number;
  remarks: string | null;
  address: string | null;
  actionType: string | null;
  nodal_Pick: string | null;
  nodal_Drop: string | null;
  updatE_DATE: string | null;
  effectivedate: string | null;
  rejection_Remark: string | null;
}

export interface UpdateAddressChangeDto extends CreateAddressChangeDto {
  profileUpdate_Id: string;
}

export interface ApproveRejectDto {
  profileUpdate_Id: string;
  actionType: "A" | "R";
  rejectionRemark: string | null;
}

export interface EmployeeApprovalRequest {
  empIds: number[];
  actionType: "A" | "R"; // e.g. "A" (Approve), "R" (Reject)
  rejectionRemark: string | null;
}

// API returns a plain array — we normalize it into PaginatedResponse in transformResponse
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export type AddressChangeStatus = "Pending" | "Approved" | "Rejected";

export interface AddressChangeListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  status?: AddressChangeStatus | string;
  page: number;
  pageSize: number;
}
