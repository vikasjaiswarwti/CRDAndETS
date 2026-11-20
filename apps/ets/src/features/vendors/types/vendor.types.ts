export interface Vendor {
  mstVendor_Id: string;
  locCode: number | null;
  transporterId:number;
  locCodes: number[];
  vendorName: string;
  bpId: number;
  singlePlan: boolean;
  prefixTag: string | null;
  address: string | null;
  mobile: string | null;
  emailId: string | null;
  remarks: string | null;
  active: boolean;
  contactFrom: string | null; // assuming time string e.g. "09:00"
  contactTo: string | null;
  // Add any audit fields if returned by API (createdAt, etc.)
}

export interface CreateVendorDto {
  locCode: number | null;
  vendorName: string;
  bpId: number;
  singlePlan: boolean;
  prefixTag: string | null;
  address: string | null;
  mobile: string | null;
  emailId: string | null;
  remarks: string | null;
  active: boolean;
  contactFrom: string | null;
  contactTo: string | null;
}

export interface UpdateVendorDto extends CreateVendorDto {
  mstVendor_Id: string;
}

export interface VendorListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
  location?: string | number;
  vendorName?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
