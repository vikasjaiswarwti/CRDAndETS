// ─── Shared ───────────────────────────────────────────────────────────────────
export type DashboardView = "Vehicle" | "Driver";
export type DateFilter = 7 | 15 | 30 | "custom";

// ─── Compliance ───────────────────────────────────────────────────────────────
export type ComplianceTab =
  | "active"
  | "pending"
  | "inactive"
  | "reachingNonCompliance" | "blacklisted";

export type DriverTab = "active" | "inactive" | "blacklisted" | "pending";

/**
 * Shape after transformResponse field-mapping in VehicleComplianceApi.getVehicleList.
 * All expiry dates use camelCase suffixed with "Date".
 */
// export interface VehicleCompliance {
//   id: string;
//   vehicleNo: string;
//   vehicleType: string | number;
//   transporterName: string;
//   locationName: string;
//   make: string;
//   model: string;
//   ownerName: string;
//   ownerType: string;
//   status: number | null;
//   currentStatus: number | null;
//   isGpsInstalled: boolean;
//   // Expiry dates — mapped from snake_case API fields
//   registrationExpDate: string | null;
//   insuranceExpDate: string | null;
//   fitnessExpDate: string | null;
//   permitExpDate: string | null;
//   pucExpDate: string | null;
//   roadTaxExpDate: string | null;
//   // Doc links
//   insuranceDoc: string | null;
//   fitnessDoc: string | null;
//   permitDoc: string | null;
//   registrationDoc: string | null;
//   // Alert counts
//   expiringDocumentCount: number;
//   expiringDocuments: string[];
//   expiredDocumentCount: number;
//   expiredDocuments: string[];
// }
export interface VehicleCompliance {
  // ── Transformed camelCase (from transformResponse) ─────────────────────
  id: string;
  vehicleNo: string;
  vehicleType: string | number;
  transporterName: string;
  locationName: string;
  make: string;
  model: string;
  ownerName: string;
  ownerType: string;
  status: number | null;
  currentStatus: number | null;
  isGpsInstalled: boolean;
  registrationExpDate: string | null;
  insuranceExpDate: string | null;
  fitnessExpDate: string | null;
  permitExpDate: string | null;
  pucExpDate: string | null;
  roadTaxExpDate: string | null;
  insuranceDoc: string | null;
  fitnessDoc: string | null;
  permitDoc: string | null;
  registrationDoc: string | null;
  expiringDocumentCount: number;
  expiringDocuments: string[];
  expiredDocumentCount: number;
  expiredDocuments: string[];

  // ── Raw snake_case fields preserved from API ────────────────────────────
  vehicleId?: number;
  vehicle_Id?: string;
  vehicle_Registration_No?: string;
  vehicleTypeCode?: number;
  vehicleTypeName?: string;
  transporterId?: number;
  vehicle_Status?: number;
  driverId?: number | null;
  locCode?: number | null;
  vehicle_Registration_Date?: string | null;
  vehicle_Induction_Date?: string | null;
  registration_Exp_Date?: string | null;
  insurance_Expiry_Date?: string | null;
  fitness_Expiry_Date?: string | null;
  permit_Expiry_Date?: string | null;
  puc_Expiry_Date?: string | null;
  road_Tax_Validity_Expiry?: string | null;
  firstAid_Kid_Date?: string | null;
  fire_Extinguisher_Date?: string | null;
  chassis_No?: string | null;
  owner_Name?: string | null;
  owner_Address?: string | null;
  owner_Type?: string | null;
  gps_Installation_Date?: string | null;
  gpsProviderCode?: number | null;
  fuelTypeCode?: number | null;
  fuelTypeName?: string | null;
  current_Status?: number | null;
  currentStatusName?: string | null;
  makeYear?: string | null;
  remarks?: string | null;
  // Doc fields from list API
  registrationExpiryDate_Doc?: string | null;
  insuranceExpiryDate_Doc?: string | null;
  fitnessExpiryDate_Doc?: string | null;
  permitExpiryDate_Doc?: string | null;
  pucExpiryDate_Doc?: string | null;
  roadTaxExpiryDate_Doc?: string | null;
  firstAidKitDateExpiry_Doc?: string | null;
  fireExtinguisherExp_Doc?: string | null;
  allDocuments_Doc?: string | null;
}

export interface VehicleComplianceStats {
  totalVehicle: number;
  insuranceExpiry: number;
  pending: number;
  active: number;
  inactive: number;
  permitExpiry: number;
  roadTaxExpiry: number;
  fitnessExpiry: number;
}

export interface ComplianceTabCounts {
  pending: number;
  active: number;
  inactive: number;
  reachingNonCompliance: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// export interface UploadCompliancePayload {
//   id: string;
//   insuranceExpiry?: string;
//   roadTaxExpiry?: string;
//   roadTaxLifetime?: boolean;
//   pollutionExpiry?: string;
//   permitType?: string;
//   commercialExpiry?: string;
//   fitnessExpiry?: string;
//   vehicleServiceDate?: string;
//   vehicleOwnership?: string;
//   fixedDeviceStatus?: string;
//   fixedDeviceDate?: string;
// }

// ─── Compliance status (numeric codes returned by the vehicle list API) ───────
/** Numeric status code on VehicleCompliance.status / currentStatus */
export type VehicleComplianceStatus = number | null;

// ─── Approval Dashboard ───────────────────────────────────────────────────────
export type ApprovalFilterStatus = "Pending" | "Reject" | "System Reject";
export type DocumentType = "Insurance" | "RC" | "Permit" | "Fitness";
export type ApprovalAction = "approve" | "reject";

/** Shape returned by GET /api/v1/VehicleStages items */
export interface VehicleApproval {
  id: string;
  vehicleNo: string;
  vehicleType: string;
  locationName?: string;
  registrationExpDate: string | null;
  insuranceExpDate: string | null;
  fitnessExpDate: string | null;
  pucExpDate: string | null;
  permitExpDate: string | null;
  roadTaxExpDate: string | null;
  // Document URLs — mapped from *_Doc fields in API response
  registrationDoc: string | null;
  insuranceDoc: string | null;
  fitnessDoc: string | null;
  permitDoc: string | null;
  pucDoc: string | null;
  status: ApprovalFilterStatus | string;
  office?: string;
  submittedOn?: string;
  documentsPending?: string[];
}

export interface ApproveRejectPayload {
  id: string;
  action: ApprovalAction;
  remarks?: string;
}

// ─── Driver Compliance (list row from GET /api/v1/Drivers) ────────────────────
export interface DriverComplianceRow {
  /** driver_Id (GUID) from API */
  id: string;
  driverName: string;
  licenseNo: string;
  mobileNo: string;
  alternateMobileNo?: string;
  vehicleNo?: string;
  locationName?: string;
  locationCode?: number;
  transporterName?: string;
  driverType?: string;
  bloodGroup?: string;
  gender?: string;
  dob?: string | null;
  inductionDate?: string | null;
  licenseExpDate?: string | null;
  licenseIssueDate?: string | null;
  policeVerificationExpDate?: string | null;
  trainingStatus?: string;
  /** 1 = Active, 0 = Inactive, null = unknown */
  currentStatus?: number | null;
  /** "Active" | "Inactive" | "" — use this for the Status column */
  currentStatusName?: string;
  /** Normalised alias for currentStatusName — drives col.status() */
  status: string;
  remarks?: string;
  profileImageDoc?: string | null;
  licenseExpDoc?: string | null;
  policeVerificationExpDoc?: string | null;
  govtIdDoc?: string | null;
  lastTrainingDoc?: string | null;
}

// ─── Driver Approval (list row from GET /api/v1/DriverStages) ─────────────────
export interface DriverApproval {
  id: string;
  driverName: string;
  licenseNo: string;
  mobileNo: string;
  locationName?: string;
  status: string;
  submittedOn?: string;
  // Document URLs
  licenseDoc?: string | null;
  policeVerificationDoc?: string | null;
  trainingDoc?: string | null;
  govtIdDoc?: string | null;
  profileDoc?: string | null;
}

export interface UploadCompliancePayload {
  id: string;
  insuranceDoc?: File;
  permitDoc?: File;
  fitnessDoc?: File;
}
