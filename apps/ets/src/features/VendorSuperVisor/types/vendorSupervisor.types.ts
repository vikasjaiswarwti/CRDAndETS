// // ─── Vendor Supervisor Types ──────────────────────────────────────────────────

// export interface VendorSupervisor {
//   supervisorTransporterMap_Id: string;
//   empId: number;
//   transporterId: number;
//   /** All transporter IDs mapped to this supervisor */
//   transporterIds?: number[];
//   active: boolean;
//   firstName: string;
//   lastName: string;
//   emailId: string;
//   mobileNo: string;
//   locCode: number;
//   createdBy: string;
//   createdOn: string;
//   modBy: string | null;
//   modOn: string | null;
// }

// /** POST /VendorSuperVisors */
// export interface CreateVendorSupervisorDto {
//   firstName: string;
//   lastName: string;
//   mobileNo: string;
//   emailId: string;
//   locCode: number;
//   /** One or more transporter IDs to assign */
//   transporterIds: number[];
// }

// /** PUT /VendorSuperVisors/{id} */
// export interface UpdateVendorSupervisorDto {
//   transporterIds: number[];
//   active?: boolean;
// }

// export interface VendorSupervisorListParams {
//   searchTerm?: string;
//   sortColumn?: string;
//   sortOrder?: string;
//   page: number;
//   pageSize: number;
// }

// export interface PaginatedResponse<T> {
//   items: T[];
//   total: number;
//   page: number;
//   pageSize: number;
// }

// /** Response from GET /VendorSuperVisors/my-transporter-id */
// export interface MyTransporterIdResponse {
//   transporterId?: number | null;
//   transporterIds?: number[] | null;
// }

// ─── Vendor Supervisor Types ──────────────────────────────────────────────────

export interface VendorSupervisor {
  supervisorTransporterMap_Id: string;
  empId: number;
  transporterId: number;
  /** All transporter IDs mapped to this supervisor */
  transporterIds?: number[];
  active: boolean;
  firstName: string;
  lastName: string;
  emailId: string;
  mobileNo: string;
  locCode: number;
  createdBy: string;
  createdOn: string;
  modBy: string | null;
  modOn: string | null;
}

/** POST /VendorSuperVisors */
export interface CreateVendorSupervisorDto {
  firstName: string;
  lastName: string;
  mobileNo: string;
  emailId: string;
  locCode: number;
  /** One or more transporter IDs to assign */
  transporterIds: number[];
}

/** PUT /VendorSuperVisors/{id} */
export interface UpdateVendorSupervisorDto {
  transporterIds: number[];
  active?: boolean;
}

export interface VendorSupervisorListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** One transporter entry returned in my-transporter-id response */
export interface VendorTransporter {
  transporterId: number;
  vendorName: string;
}

/** Response from GET /VendorSuperVisors/my-transporter-id */
export interface MyTransporterIdResponse {
  transporterId?: number | null;
  transporterIds?: number[] | null;
  /** Full list with names — use this to build the vendor selector for multi-transporter vendors */
  transporters?: VendorTransporter[] | null;
}
