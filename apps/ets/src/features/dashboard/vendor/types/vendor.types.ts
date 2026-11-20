// API returns a plain array, we normalize to this shape
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
export interface AddressChangeResponse {
  success: boolean;
  message?: string;
}

export interface AddressChangeRequest {
  empID: number;
  locCode: string | null;
  city: string;
  pin: String | null;
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
export interface VehicleListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
  vendorName?: string;
  location?: string | number;

}
export interface Vehicle {
  allDocuments_Doc: string | null;
  chassis_No: string | null;
  createdBy: string;
  createdOn: string; // RFC 3339 date-time
  current_Status: number | string | null;
  currentStatusName: string | null;
  driverId: number | string | null;
  driverName: String | null;
  fire_Extinguisher_Date: string | null;
  fireExtinguisherExp_Doc: string | null;
  firstAid_Kid_Date: string | null;
  firstAidKitDateExpiry_Doc: string | null;
  fitness_Expiry_Date: string | null;
  fitnessExpiryDate_Doc: string | null;
  fuelTypeCode: number | string | null;
  fuelTypeName: string | null;
  gps_Installation_Date: string | null;
  gpsProviderCode: number | string | null;
  insurance_Expiry_Date: string | null;
  insuranceExpiryDate_Doc: string | null;
  isGpsInstalled: boolean | null;
  locationName: string | null;
  locCode: number | string | null;
  make: string | null;
  makeYear: string | null;
  modBy: string | null;
  model: string | null;
  modOn: string | null;
  owner_Address: string | null;
  owner_Name: string | null;
  owner_Type: string | null;
  permit_Expiry_Date: string | null;
  permitExpiryDate_Doc: string | null;
  puc_Expiry_Date: string | null;
  pucExpiryDate_Doc: string | null;
  registration_Exp_Date: string | null;
  registrationExpiryDate_Doc: string | null;
  remarks: string | null;
  road_Tax_Validity_Expiry: string | null;
  roadTaxExpiryDate_Doc: string | null;
  transporterId: number | string | null;
  transporterName: string | null;
  vehicle_Id: string; // UUID
  vehicle_Induction_Date: string | null;
  vehicle_Registration_Date: string | null;
  vehicle_Registration_No: string;
  vehicle_Status: number | string | null;
  vehicleId: number | string;
  vehicleTypeCode: number | string | null;
  vehicleTypeName: string | null;
}

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
}
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
export interface AddressChangeListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}
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
}
export interface UserStageListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}
