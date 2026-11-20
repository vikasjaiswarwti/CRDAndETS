export interface DashboardApiResponse {
  kpi: string;
  tripSummary: string;
  userInfo: string;
  jsonOTAOTD: string;
  jsonAdhocRequest: string;
  jsonVehicleDriver: string;
  jsonSafetyandSecurity: string;
  jsonUniqueVehicleDriver: string;
  vehicleDriverCompliance: string;
  jsonVehicleDeployment: string;
  jsonFeedbackReport: string;
  jsonVehicleType: string;
  jsonVehicleUtilization: string;
}
export interface KPI {
  TotalUsers: number;
  TotalTrip: number;
  NoShow: number;
  AdhocActivities: number;
  ActiveDriver: number;
}

export interface TripSummary {
  TripDate: string;
  LoginTrips: number;
  LogoutTrips: number;
}

export interface UserInfo {
  RegisteredUsers: number;
  ActiveUsers: number;
  Inactive: number;
}

export interface OTAOTD {
  Perc_OTA: number;
  Perc_OTD: number;
}

export interface AdhocRequest {
  AdhocRequests_Pickup: number;
  AdhocRequests_Drop: number;
  AdhocRequests_Total: number;
}

export interface VehicleDriver {
  VehicleTotal: number;
  DriverTotal: number;
}

export interface SafetyAndSecurity {
  SingleFemaleTravelled: number;
  FemaleTravelled: number;
}

export interface VehicleDriverCompliance {
  VehicleCompliance: number;
  DriverCompliance: number;
}

export interface VehicleDeployment {
  VehicleDeployment: string;
  Total: number;
}

export interface FeedbackReport {
  TotalTrips: number;
  TotalUsers: number;
  TotalFeedbacks: number;
}

export interface VehicleType {
  VehicleTypeWise: string;
  Total: number;
}

export interface VehicleUtilization {
  ReportType: string;
  Total: number;
}
// ---------------------------

export interface UsersData {
  RegisteredUsers: number;
  NewJoiners: number;
  Attritions: number;
  NoShowLogin: number;
  NoShowLogout: number;
  NoShowTotal: number;
  LoginTrips: number;
  LogoutTrips: number;
  TotalTrips: number;
  UniqueUserTravelled: number;
  VendorSpocs: number;
  SingleFemaleTrips: number;
}

export interface OTAOTDData {
  Perc_OTA: number;
  Perc_OTD: number;
}

export interface AdhocRequestData {
  AdhocRequests_Pickup: number;
  AdhocRequests_Drop: number;
  AdhocRequests_Total: number;
}

export interface OccupancyData {
  PickOccupancy: number;
  DropOccupancy: number;
  OverallOccupancy: number;
}

export interface SafetySecurityData {
  FemaleTravelled: number;
  FemaletravelledinOddHours: number;
  ReachedConfirmations: number;
  EscourtOnRoute: number;
}

export interface UniqueVehicleDriverData {
  VehicleTotal: number;
  DriverTotal: number;
}

export interface ComplianceData {
  VehicleCompliance: number;
  DriverCompliance: number;
}

export interface VehicleTypeItem {
  VehicleTypeWise: string;
  Total: number;
}

export interface FeedbackData {
  TotalTrips: number;
  TotalUsers: number;
  TotalFeedbacks: number;
}

export interface VehicleDeploymentItem {
  VehicleDeployment: string;
  Total: number;
}

export interface VehicleUtilizationItem {
  ReportType: string;
  Total: number;
}

export interface ParsedDashboardData {
  kpi: KPI;
  tripSummary: TripSummary[];
  userInfo: UserInfo;
  otaOtd: OTAOTD;
  adhocRequest: AdhocRequest;
  vehicleDriver: VehicleDriver;
  safetySecurity: SafetyAndSecurity;
  uniqueVehicleDriver: VehicleDriver;
  compliance: VehicleDriverCompliance;
  vehicleDeployment: VehicleDeployment[];
  feedback: FeedbackReport;
  vehicleTypes: VehicleType[];
  vehicleUtilization: VehicleUtilization[];
}


export interface TripDetails {
  tripId: string;
  routeName?: string;
  driverName?: string;
  vehicleRegNo?: string;
  tripType?: string;
  status?: string;
  tripDate?: string;
}


export interface UserSearchParams {
  empName?: string;
  empId?: string;
  mobileNo?: string;
  emailId?: string;
}
export interface EmployeeDetails {
  empID: number;
  empName: string;
  emailId: string | null;
  mobileno: string | null;
  address: string | null;
  userId: string;
}

export interface VehicleDetails {
  vehicle_Id: string;
  vehicleId: number;
  registrationNo: string;
  vendorName: string | null;
  driverName: string | null;
  locCode: number;
  currentStatus: number;
}

// raw shape from /api/v1/Vehicles/details
export interface VehicleApiResponse {
  result: {
    vehicle_Id: string;
    vehicleId: number;
    vehicle_Registration_No: string;
    transporterId: number;
    vendorName: string | null;
    driverId: number | null;
    driverName: string | null;
    locCode: number;
    current_Status: number;
  } | null;
  isSuccess: boolean;
  message: string;
}
export interface VehicleDetailResp {
  vehicle_Id: string;
  vehicleId: number;
  vehicle_Registration_No: string;

  vehicleTypeCode: number;
  vehicleTypeName: string;

  transporterId: number;
  transporterName: string;

  vehicle_Status: number;

  driverId: number | null;

  locCode: number;
  locationName: string;

  vehicle_Registration_Date: string;
  vehicle_Induction_Date: string;

  registration_Exp_Date: string;
  firstAid_Kid_Date: string;
  fire_Extinguisher_Date: string;

  make: string;
  model: string;
  chassis_No: string;

  permit_Expiry_Date: string;
  insurance_Expiry_Date: string;
  fitness_Expiry_Date: string;
  road_Tax_Validity_Expiry: string;
  puc_Expiry_Date: string;

  owner_Name: string;
  owner_Address: string;
  owner_Type: string;

  isGpsInstalled: boolean;
  gps_Installation_Date: string;

  gpsProviderCode: number;

  fuelTypeCode: number;
  fuelTypeName: string;

  current_Status: number;
  currentStatusName: string;

  makeYear: string;

  registrationExpiryDate_Doc: string;
  fireExtinguisherExp_Doc: string;
  permitExpiryDate_Doc: string;
  firstAidKitDateExpiry_Doc: string;
  insuranceExpiryDate_Doc: string;
  fitnessExpiryDate_Doc: string;
  roadTaxExpiryDate_Doc: string;
  pucExpiryDate_Doc: string;
  allDocuments_Doc: string;

  remarks: string;

  createdBy: string;
  createdOn: string;

  modBy: string | null;
  modOn: string | null;
}
export interface Passenger {
  empId: number;
  passengerName: string;
  mobileNo: string;
  lat: number;
  lng: number;
  pickupAddress: string;
  pSchTime: string;
  paxOrder: number;
  status: string;
  reached: boolean;
}

export interface TripDetailsResponse {
  tripID: number;
  tripStatusCode: number;
  locationName: string;
  officeLat: number;
  officeLng: number;
  tripTypeCode: number;
  tripTypeDesc: string;
  schStartTime: string;
  schEndTime: string;
  pickShift: string;
  dropShift: string;
  totalPax: number;
  source: string;
  destination: string;
  isGuardRequired: boolean;
  escortId: string;
  escortName: string;
  minimumWindow: string;
  passengers: Passenger[];
}
export interface EmployeeProfile {
  user_Id: string;
  empId: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: string;
  address: string;
  city: string;
  stateCode: number;
  stateName: string;
  pin: string;
  mobileNo: string;
  emercontactNo: string;
  phoneNo: string | null;
  emailId: string | null;
  employeeId: string;
  special_Needs: number;
  locCode: number;
  locationName: string;
  depCode: string;
  proCode: string;
  lobCode: number;
  lobName: string;
  supId: number;
  supEmployeeId: string | null;
  spoc: number;
  spocEmployeeId: string | null;
  empTypeId: number;
  emp_Lat: number;
  emp_Lng: number;
  nodal_Pick: string | null;
  nodal_Drop: string | null;
  geocodeId: number;
  isActive: boolean;
  transport: boolean;
  ownTransport: boolean;
  globalUserId: string;
  createdBy: string;
  createdOn: string;
  modBy: string | null;
  modOn: string | null;
}
// -------------------------------
export type DashboardSummary = {
  TotalUsers: number;
  TotalTrip: number;
  NoShow: number;
  AdhocActivities: number;
  ActiveDriver: number;
};
export type UserStatusSummary = {
  RegisteredUsers: number;
  ActiveUsers: number;
  Inactive: number;
};
// ------------------
export interface QuickActionItem {
  label: string;
  icon: React.ReactNode;
  bg: string;
  color: string;
  path: string;
  roles: string[];
}

export interface UserFilterParams {
  dateFrom: string; 
  dateTo: string;
  empId?: number;
}
export interface EmployeeSchedule {
  locCode: number;
  empid: number;
  office: string;
  userName: string;
  scheduleDate: string; // Format: "28-Jun-2026"
  weekDays: string;     // e.g. "SUN"
  pickShift: string;    // Format: "HH:mm"
  dropShift: string;    // Format: "HH:mm"
}
// -----------------
export interface HelpDeskScheduleItem {
  empid: number;
  office: string;
  userName: string;
  scheduleDate: string;
  weekDays: string;
  login: string;
  logout: string;
  loginStatus: string;
  logoutStatus: string;
  loginCancelBy: string;
  loginCancelOn: string;
  logoutCancelBy: string;
  logoutCancelOn: string;
}

export interface HelpDeskTripItem {
  office: string;
  userName: string;
  tripId: number;
  vehicle: string;
  driverName: string;
  tripType: string;
  shiftTime: string;
  tripStatus: string;
  tripDate: string;
  actStartTime: string;
  actEndTime: string;
  cancellationStatus: string;
  cancellationTime: string;
  cancellationReason: string;
}

export interface HelpDeskAdhocRequestItem {
  office: string;
  commutrId: number;
  employeeID: string;
  userName: string;
  address: string;
  tripDate: string;
  tripType: string;
  shift: string;
  tripID: number;
  status: string;
  actionBy: string;
  actionOn: string;
  requestBy: string;
  requestedOn: string;
}

export interface HelpDeskReport {
  scheduledReport: HelpDeskScheduleItem[];
  tripReport: HelpDeskTripItem[];
  adhocRequestReport: HelpDeskAdhocRequestItem[];
}

export interface HelpDeskRequest {
  EmpID: number;
  DateFrom: string;
  DateTo: string;
}

// -----------------
export interface WeeklyOff {
  id: string;
  empId: number;
  weekOff: string;
  createdBy: string;
  createdOn: string;
}