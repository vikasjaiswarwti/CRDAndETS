export interface DashboardApiResponse {
  jsonUsers: string;
  jsonOTAOTD: string;
  jsonAdhocRequest: string;
  jsonOccupancy: string;
  jsonSafetySecurity: string;
  jsonUniqueVehicleDriver: string;
  vehicleDriverCompliance: string;
  jsonVehicleType: string;
  jsonFeedbackReport: string;
  jsonVehicleDeployment: string;
  jsonVehicleUtilization: string;
}

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
  users: UsersData;
  otaOtd: OTAOTDData;
  adhocRequest: AdhocRequestData;
  occupancy: OccupancyData;
  safetySecurity: SafetySecurityData;
  uniqueVehicleDriver: UniqueVehicleDriverData;
  compliance: ComplianceData;
  vehicleTypes: VehicleTypeItem[];
  feedback: FeedbackData;
  vehicleDeployment: VehicleDeploymentItem[];
  vehicleUtilization: VehicleUtilizationItem[];
}