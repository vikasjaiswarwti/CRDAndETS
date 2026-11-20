// src/features/route-maker/types/shuttleApiTypes.ts
//
// Exact shapes returned by:
//   GET /api/v1/TripManagement/shuttle-route-analytics
//
// Do NOT mix with VehicleRoute / Routemaker.types — keep these isolated
// so shuttle and cabs can evolve independently.

export interface ShuttlePassengerApi {
  empId: number;
  passengerName: string;
  address: string;
  lat: number;
  lng: number;
  directDistanceKm: number;
  routedDistanceKm: number;
  extraDistanceKm: number;
  eta: string;
  specialNeeds: boolean;
  noShow: boolean;
  gender: string;
  mobileNo: string;
  specialCaseDesc: string | null;
  locality: string | null;
  locCode: number;
  displayName: string;
}

export interface ShuttleStopApi {
  stopId: number;
  stopOrder: number;
  nodalPointId: number;
  stopAddress: string;
  schArrivalTime: string; // ISO-8601 e.g. "2026-07-05T07:23:49.5552"
  actArrivalTime: string | null;
  passengers: ShuttlePassengerApi[];
}

export interface ShuttleTripApi {
  dsId: number;
  isGuard: boolean;
  totalPax: number;
  vendorName: string | null;
  vendorPrefixTag: string | null;
  totalDuration: string; // numeric string, minutes e.g. "61.17"
  routeDistanceKm: number;
  tripExtraKm: number;
  routePolyline: string;
  hasFemale: boolean;
  allFemale: boolean;
  avgRadialKm: number;
  hasSpecialNeeds: boolean;
  isFlagged: boolean;
  isApproved: boolean;
  flapNo: string | null;
  tripStatusCode: number;
  hasVehicleAssigned: boolean;
  hasDriverAssigned: boolean;
  hasEscortAssigned: boolean;
  vehicleRegNo: string | null;
  driverName: string | null;
  driverMobile: string | null;
  escortName: string | null;
  escortMobile: string | null;
  stops: ShuttleStopApi[];
}

export interface ShuttleAnalyticsResponse {
  totalEmployees: number;
  totalTrips: number;
  guardTrips: number;
  specialNeedsCount: number;
  totalDistanceKm: number;
  totalExtraKm: number;
  totalVendorsAllocated: number;
  totalPax: number;
  officeLat: number;
  officeLng: number;
  officeName: string;
  trips: ShuttleTripApi[];
}

export interface AvailableEmployeesResponse {
  dsId: number;
  totalAvailable: number;
  employees: AvailableEmployee[];
}

export interface AvailableEmployee {
  empId: number;
  employeeName: string;
  mobileNumber: string; // note: mobileNumber not mobileNo
  gender: "M" | "F" | "Other";
  nodalPointId: number;
  nodalPointName: string;
  nodalPointLat: number;
  nodalPointLng: number;
  nodalPointAddress: string;
  boardingOrder: number;
}
