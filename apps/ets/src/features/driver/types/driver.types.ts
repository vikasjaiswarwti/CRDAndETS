// ─── Raw API response shape (snake_case from backend) ───────────────────────
export interface DriverRaw {
  driver_Id: string;
  driverId: number | string;
  driverName: string;
  fatherName: string | null;
  presentAddress: string | null;
  permanentAddress: string | null;
  licenseNo: string | null;
  locCode: number;
  locationName: string;
  transporterId: number;
  mobileNo: string;
  alternateMobileNo: string | null;
  licenseExpDate: string | null;
  driverLicenceAuthority: string;
  licenseIssueDate: string | null;
  inductionDate: string | null;
  driverType: string | null;
  bloodGroup: string | null;
  policeVerification: boolean;
  policeVerificationExpDate: string | null;
  govtIdProof: string;
  transporterName: string;
  lastInternalVerificationDate: string | null;
  externalVerificationExpDate: string | null;
  externalVerificationAgency: string | null;
  trainingStatus: string | null;
  currentStatus: string | null;
  lastTrainingDate: string | null;
  privateBGVExpDate: string | null;
  remarks: string | null;
  active: boolean;
  dob: string | null;
  gender: string | null;
  profileImageDoc: string | null;
  licenseExpDoc: string | null;
  policeVerificationExpDoc: string | null;
  lastTrainingDoc: string | null;
  govtIdDoc: string | null;
}

// ─── Normalized entity (camelCase — used throughout feature code) ────────────  update packet
export interface Driver {
  driver_Id: string;
  driverId: number | string;
  driverName: string;
  fatherName: string | null;
  presentAddress: string | null;
  permanentAddress: string | null;
  licenseNo: string | null;
  locCode: number;
  locationName: string;
  transporterId: number;
  mobileNo: string;
  alternateMobileNo: string | null;
  licenseExpDate: string | null;
  driverLicenceAuthority: string;
  licenseIssueDate: string | null;
  inductionDate: string | null;
  driverType: string | null;
  bloodGroup: string | null;
  policeVerification: boolean;
  policeVerificationExpDate: string | null;
  govtIdProof: string;
  transporterName: string;
  lastInternalVerificationDate: string | null;
  externalVerificationExpDate: string | null;
  externalVerificationAgency: string | null;
  trainingStatus: string | null;
  currentStatus: string | null;
  lastTrainingDate: string | null;
  privateBGVExpDate: string | null;
  remarks: string | null;
  active: boolean;
  dob: string | null;
  gender: string | null;
  profileImageDoc: string | null;
  licenseExpDoc: string | null;
  policeVerificationExpDoc: string | null;
  lastTrainingDoc: string | null;
  govtIdDoc: string | null;
}

// ─── DTOs ────────────────────────────────────────────────────────────────────
export interface CreateDriverDto {
  locCode: number;
  transporterId: number;
  driverName: string;
  fatherName?: string | null;
  presentAddress?: string | null;
  permanentAddress: string;
  dob?: string | null;
  gender?: string | null;
  mobileNo: string;
  alternateMobileNo?: string | null;
  licenseNo: string;
  licenseExpDate?: string | null;
  driverLicenceAuthority: string;
  licenseIssueDate?: string | null;
  inductionDate?: string | null;
  driverType?: string | null;
  bloodGroup?: string | null;
  policeVerification?: boolean;
  policeVerificationExpDate?: string | null;
  govtIdProof: string;
  lastInternalVerificationDate?: string | null;
  externalVerificationExpDate?: string | null;
  externalVerificationAgency?: string | null;
  trainingStatus?: string | null;
  currentStatus?: string | null;
  lastTrainingDate?: string | null;
  privateBGVExpDate?: string | null;
  remarks?: string | null;
  active: boolean;
  profileImageDoc: string | null;
  licenseExpDoc: string | null;
  policeVerificationExpDoc: string | null;
  lastTrainingDoc: string | null;
  govtIdDoc: string | null;
}

export interface UpdateDriverDto extends CreateDriverDto {
  driver_Id: string,
  driverId: string;// driver_Id UUID
}

// ─── List params ─────────────────────────────────────────────────────────────
export interface DriverListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
  vendorName?: string;
  location?: string | number;
}

// ─── Paginated response (normalized) ─────────────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean,
  hasPrevPage: boolean,

}

// ─── Mappers ─────────────────────────────────────────────────────────────────
export const mapDriverResponseToEntity = (raw: DriverRaw): Driver => ({
  driver_Id: raw.driver_Id,
  driverId: raw.driverId,
  driverName: raw.driverName,
  fatherName: raw.fatherName,
  presentAddress: raw.presentAddress,
  permanentAddress: raw.permanentAddress,
  licenseNo: raw.licenseNo,
  locCode: raw.locCode,
  transporterId: raw.transporterId,
  locationName: raw.locationName,
  transporterName: raw.transporterName,
  mobileNo: raw.mobileNo,
  alternateMobileNo: raw.alternateMobileNo,
  licenseExpDate: raw.licenseExpDate,
  driverLicenceAuthority: raw.driverLicenceAuthority,
  licenseIssueDate: raw.licenseIssueDate,
  inductionDate: raw.inductionDate,
  driverType: raw.driverType,
  bloodGroup: raw.bloodGroup,
  policeVerification: raw.policeVerification,
  policeVerificationExpDate: raw.policeVerificationExpDate,
  govtIdProof: raw.govtIdProof,
  lastInternalVerificationDate: raw.lastInternalVerificationDate,
  externalVerificationExpDate: raw.externalVerificationExpDate,
  externalVerificationAgency: raw.externalVerificationAgency,
  trainingStatus: raw.trainingStatus,
  currentStatus: raw.currentStatus,
  lastTrainingDate: raw.lastTrainingDate,
  privateBGVExpDate: raw.privateBGVExpDate,
  remarks: raw.remarks,
  active: raw.active,
  dob: raw.dob,
  gender: raw.gender,
  profileImageDoc: raw.profileImageDoc,
  licenseExpDoc: raw.licenseExpDoc,
  policeVerificationExpDoc: raw.policeVerificationExpDoc,
  lastTrainingDoc: raw.lastTrainingDoc,
  govtIdDoc: raw.govtIdDoc,
});

export const mapDriverEntityToRequest = (data: CreateDriverDto | UpdateDriverDto) => ({
  locCode: data.locCode,
  transporterId: data.transporterId,
  driverName: data.driverName,
  fatherName: data.fatherName ?? null,
  presentAddress: data.presentAddress ?? null,
  permanentAddress: data.permanentAddress,
  dob: data.dob ?? null,
  gender: data.gender ?? null,
  mobileNo: data.mobileNo,
  alternateMobileNo: data.alternateMobileNo ?? null,
  licenseNo: data.licenseNo,
  licenseExpDate: data.licenseExpDate ?? null,
  driverLicenceAuthority: data.driverLicenceAuthority,
  licenseIssueDate: data.licenseIssueDate ?? null,
  inductionDate: data.inductionDate ?? null,
  driverType: data.driverType ?? null,
  bloodGroup: data.bloodGroup ?? null,
  policeVerification: data.policeVerification ?? true,
  policeVerificationExpDate: data.policeVerificationExpDate ?? null,
  govtIdProof: data.govtIdProof,
  lastInternalVerificationDate: data.lastInternalVerificationDate ?? null,
  externalVerificationExpDate: data.externalVerificationExpDate ?? null,
  externalVerificationAgency: data.externalVerificationAgency ?? null,
  trainingStatus: data.trainingStatus ?? null,
  currentStatus: data.currentStatus ?? null,
  lastTrainingDate: data.lastTrainingDate ?? null,
  privateBGVExpDate: data.privateBGVExpDate ?? null,
  remarks: data.remarks ?? null,
  active: data.active,
  profileImageDoc: data.profileImageDoc,
  licenseExpDoc: data.licenseExpDoc,
  policeVerificationExpDoc: data.policeVerificationExpDoc,
  lastTrainingDoc: data.lastTrainingDoc,
  govtIdDoc: data.govtIdDoc,
});
export interface DriverFormDto {
  // Identity
  profileImage?: File | null;
  officeCode?: string | null;
  vendor?: string | null;
  driverName: string;
  dob?: string | null;
  gender: "Male" | "Female" | "Other" | "";
  fatherName?: string | null;
  // Communication
  primaryMobile: string;
  altMobile?: string | null;
  bloodGroup?: string | null;
  // Licensing
  licenseNumber: string;
  licenseExpiry?: string | null;
  licenseDoc?: File | null;
  authority?: string | null;
  // Govt ID
  govtIdType?: string | null;
  govtIdNumber?: string | null;
  idVerificationDate?: string | null;
  // Residential
  presentAddress?: string | null;
  permanentAddress?: string | null;
  sameAsPresent?: boolean;
  // Training & Lifecycle
  trainingStatus?: string | null;
  lastTrainingDate?: string | null;
  driverType?: string | null;
  currentStatus?: string | null;
  remarks?: string | null;
  // Compliance & BGV
  privateBgvDate?: string | null;
  externalBgvAgency?: string | null;
  externalBgvExpiry?: string | null;
  policeVerified?: string | null;
  pvExpiry?: string | null;
  lastInternalVerification?: string | null;
}

export interface DriverFormProps {
  editingRecord?: (DriverFormDto & { id?: string }) | null;
  onSubmit: (values: DriverFormDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  officeOptions?: { label: string; value: string }[];
  vendorOptions?: { label: string; value: string }[];
}