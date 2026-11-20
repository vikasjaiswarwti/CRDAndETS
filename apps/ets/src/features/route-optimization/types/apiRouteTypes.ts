// src/features/route-maker/types/apiRouteTypes.ts
// Matches the real GET /api/v1/TripManagement/route-analytics response shape

export interface ApiPassenger {
  empId: number;
  address: string;
  lat: number;
  lng: number;
  directDistanceKm: number;
  routedDistanceKm: number;
  extraDistanceKm: number;
  eta: string; // ISO datetime string e.g. "2026-05-22T06:30:00"
  specialNeeds: boolean;
}

export interface ApiTrip {
  dsId: number;
  isGuard: boolean;
  totalPax: number;
  vendorName: string | null;
  totalDuration: string; // string e.g. "28.1"
  routeDistanceKm: number;
  tripExtraKm: number;
  routePolyline: string;
  passengers: ApiPassenger[];
}

export interface ApiRouteAnalyticsResponse {
  totalEmployees: number;
  totalTrips: number;
  guardTrips: number;
  specialNeedsCount: number;
  totalDistanceKm: number;
  totalExtraKm: number;
  totalVendorsAllocated: number;
  trips: ApiTrip[];
}

export interface MergeTripsArgs {
  dsId1: number;
  dsId2: number;
}

export interface CreateAdhocRouteArgs {
  locCode: number;
  shiftId: number;
  tripType: number;
  tripDate: string;
  employeeIds: number[];
  tripRemarks?: string;
}

export interface UpdateAdhocRouteArgs extends CreateAdhocRouteArgs {
  dsId: number;
  tripRemarks: string;
}

export interface AdhocRouteResponse {
  dsId: number;
  locCode: number;
  shiftId: number;
  tripType: number;
  tripDate: string;
  tripRemarks: string | null;
  tripStatusCode: number;
  isGuard: boolean;
  totalPax: number;
  totalDuration: number;
  routeDistance: number;
  routePolyline: string;
  employeeIds: number[];
  passengers: {
    empId: number;
    paxOrder: number;
    passengerName: string;
    mobileNo: string;
    gender: string;
    address: string;
    lat: number;
    lng: number;
    pschTime: string;
    empDistance: number;
    empDirectDistance: number;
    scheduled: boolean;
    noShow: boolean;
  }[];
}

/** POST /TripManagement/reorder-trip */
export interface ReorderTripArgs {
  dsId: number;
  employeeIdsInOrder: number[];
}

export interface MoveEmployeeArgs {
  sourceDsId: number;
  targetDsId: number;
  employeeId: number; // numeric passenger Id (not the string EmployeeID code)
}

export interface UpdateTripFlagArgs {
  dsId: number;
  updateType: 1 | 2; // 1 = flag, 2 = approve
  status: boolean;
}

export interface VendorAllocationArgs {
  locCode: number;
  routeDate: string;
  shiftId: number;
}

export interface VendorAllocationItem {
  transporterId: number;
  vendor_Name: string;
  vendorRouteCount: number;
  totalRouteCount: number;
  allocationPercentage: number;
}

export interface VehicleOption {
  vehicleId: number;
  vehicleNumber: string;
  vehicleType: string;
  capacity: number;
  vehicleModel: string;
  vehicleNo: string;
}

export interface DriverOption {
  driverId: number;
  driverName: string;
  mobileNo: string;
  licenseNo: string;
}
// -------------------------
export type VehicleMode = "cabs" | "shuttle";
export type Gender = "M" | "F" | "Other";
export interface Passenger {
  id: string;
  name: string;
  empId: string;
  gender?: Gender;
  isChecked: boolean;
}
export interface ShuttleStop {
  id: string;
  stopNumber: number;
  stopName: string;
  address: string;
  passengerCount: number;
  distanceKms: number;
  eta: string;
  passengers: Passenger[];
}
export interface ShuttleStop {
  id: string;
  stopNumber: number;
  stopName: string;
  address: string;
  passengerCount: number;
  distanceKms: number;
  eta: string;
  passengers: Passenger[];
}
export interface ShuttleTripHeaderInfo {
  tripId: string;
  isSelected: boolean;
}