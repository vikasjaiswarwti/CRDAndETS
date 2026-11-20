export interface VendorTripSummaryResponse {
  totalEmployees: number;
  totalTrips: number;
  guardTrips: number;
  specialNeedsCount: number;
  totalDistanceKm: number;
  totalExtraKm: number;
  totalVendorsAllocated: number;
  trips: Trip[];
}

export interface Trip {
  dsId: number;
  isGuard: boolean;
  totalPax: number;
  vendorName: string;
  totalDuration: string;
  routeDistanceKm: number;
  tripExtraKm: number;
  routePolyline: string;
  passengers: Passenger[];
  hasFemale: boolean;
  allFemale: boolean;
  avgRadialKm: number;
  passengerName: string | null;
  mobileNo: string | null;
  specialCaseDesc: string | null;
  isFlagged: boolean;
  isApproved: boolean;
  flapNo: string | null;
  "hasVehicleAssigned": boolean;
  "hasDriverAssigned": boolean;
  "hasEscortAssigned": boolean;
  "tripStatusCode": number;
  "vehicleRegNo": string;
  "driverName": string;
  "driverMobile": string;
}

export interface Passenger {
  empId: number;
  address: string;
  lat: number;
  lng: number;
  directDistanceKm: number;
  routedDistanceKm: number;
  extraDistanceKm: number;
  eta: string; // ISO Date string
  specialNeeds: boolean;
  gender: string;
  passengerName: string | null;
  mobileNo: string | null;
  specialCaseDesc: string | null;
}
export interface VendorTripListParams {
  fromDate: string;
  toDate: string;
  shiftId: number;
  tripType: number;
  locCode: number;
  page: number;
  pageSize: number;
}
export interface ShiftOption { ShiftId: number; ShiftTime: string; }