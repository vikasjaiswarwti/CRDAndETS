// // FILE 1 — types/vehicle.types.ts

// export interface Vehicle {
//   vehicle_Id: string;
//   vehicleId: number;
//   vehicle_Registration_No: string;
//   vehicleTypeCode: number;
//   vehicleTypeName: string;
//   transporterId: number;
//   transporterName: string;
//   vehicle_Status: number;
//   driverId: number;
//   locCode: number;
//   locationName: string;
//   vehicle_Registration_Date: string;
//   vehicle_Induction_Date: string;
//   make: string;
//   model: string;
//   chassis_No: string;
//   fuelTypeCode: number;
//   fuelTypeName: string;
//   current_Status: number;
//   currentStatusName: string;
//   makeYear: number;
//   createdBy: string;
//   createdOn: string;
// }
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

export interface CreateVehicleDto {
  vehicle_Registration_No: string;
  vehicleTypeCode: number;
  transporterId: number | null;
  vehicle_Status: number;
  driverId: number;
  locCode: number;
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
  current_Status: number;
  makeYear: string;
  remarks: string;
  registrationExpiryDate_Doc?: string | null;
  fireExtinguisherExp_Doc?: string | null;
  permitExpiryDate_Doc?: string | null;
  firstAidKitDateExpiry_Doc?: string | null;
  insuranceExpiryDate_Doc?: string | null;
  fitnessExpiryDate_Doc?: string | null;
  roadTaxExpiryDate_Doc?: string | null;
  pucExpiryDate_Doc?: string | null;
  allDocuments_Doc?: string | null;
}

export interface UpdateVehicleDto extends CreateVehicleDto {
  vehicle_Id: string;
  vehicleId: string | number;
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

// API returns a plain array, we normalize to this shape
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}