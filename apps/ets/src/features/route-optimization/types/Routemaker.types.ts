// ─── routeMaker.types.ts ──────────────────────────────────────────────────────
// All TypeScript interfaces for the Route Maker feature.
// Source of truth for mockRouteData.ts, useDragAndDrop.ts, RouteMakerPage.tsx

export type ApiSortBy = "radial" | "extraKm" | "employeeCount" | "distance";
export type ApiSortDir = "asc" | "desc";
export type FemaleFilter = "single" | "all";

export interface RouteFilters {
  guardTrip: boolean;
  singleEmployee: boolean;
  vendorAssigned: null | boolean;
  vehicleAssigned: null | boolean;
  femaleFilter: FemaleFilter | null;
  specialNeeds: boolean;
  sortBy: ApiSortBy | null;
  sortDir: ApiSortDir;
  flagTrip?: boolean;
}

export const DEFAULT_FILTERS: RouteFilters = {
  guardTrip: false,
  singleEmployee: false,
  vendorAssigned: null,
  vehicleAssigned: null,
  femaleFilter: null,
  specialNeeds: false,
  sortBy: null,
  sortDir: "asc",
  flagTrip: false,
};

export interface Passenger {
  Id: number;
  EmployeeID: string;
  Firstname: string;
  Address: string;
  Gender: "M" | "F";
  Lat: number;
  Lng: number;
  PickupSequence: number;
  EstimatedPickupTime: string; // ISO datetime
  RideTimeMinutes: number;
  EstimatedArrivalAtOffice: string; // ISO datetime
  IsLate: boolean;
  MinutesFromDeadline: number;
  EfficiencyPercentage: number;
  routedDistanceKm: number;
  extraDistanceKm: number;
  locality: string;
  displayName: string;
  empId: number;
  mobileNo: number;
  noShow:boolean;
  noShowType?:string;
}

export interface Waypoint {
  PassengerId: number | null;
  Label: string;
  Lat: number;
  Lng: number;
  Sequence: number;
  EstimatedArrivalTime: string; // ISO datetime
}

export interface VehicleRoute {
  VehicleId: number;
  isVenddorAssign: boolean;
  vendorName: string;
  Passengers: Passenger[];
  PickupOrder: number[];
  IsGuardAllocated: boolean;
  GuardSeatCount: number;
  TotalSeatUsed: number;
  AvailablePassengerSeats: number;
  RoutePolyline: string;
  RouteDistanceKm: number;
  RouteDurationMinutes: number;
  Waypoints: Waypoint[];
  EfficiencyPercentage: number;
  AverageDetourKm: number;
  TotalDirectDistanceKm: number;
  TotalActualDistanceKm: number;
  CabDepartureTime: string; // ISO datetime
  EstimatedOfficeArrival: string; // ISO datetime
  AnyCabMemberIsLate: boolean;
  LatePassengerCount: number;
  ExtraDistanceKm: number;
  Eta: string;
  IsFlagged: boolean;
  IsApproved: boolean;
  IsFemaleTrip: boolean;
  IsSpecialNeedTrip: boolean;
  hasVehicleAssigned: boolean;
  hasDriverAssigned: boolean;
  tripStatusCode: number;
  flapNo: number;
  hasEscortAssigned: boolean;
  vehicleRegNo: string;
  driverName: string;
  driverMobile: string;
  vendorPrefixTag: string | null;
  escortName: string | null;
  escortMobile: string | null;
  // ----------- new field added for occupancy and capacity 8 july
  occupancy: number;
  capacity: number;
  copied:boolean;
  copiedFrom:string;
}

// ─── Derived UI types ─────────────────────────────────────────────────────────

export interface RouteStats {
  emp: string;
  routes: string;
  guards: number;
  snEmp: number;
  su: string;
  dist: number;
  extra: number;
  fleet: string;
}

export interface CabGroup {
  vehicleId: number;
  vehicleRegNo: string;
  occupancy: number;
  capacity: number;
  label: string;
  cabNo: string;
  color: string;
  passengers: Passenger[];
  isGuardAllocated: boolean;
  driverMobileNo: string;
  tripStatusCode: number;
}

// // src / features / route - maker / types / routeMaker.types.ts;
