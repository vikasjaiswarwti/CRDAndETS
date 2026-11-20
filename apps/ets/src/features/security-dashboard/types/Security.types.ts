export interface TimelineEvent {
  time: string;
  title: string;
  subtitle: string;
  type: "sos" | "overspeed" | "route" | "gps" | "female";
}

export interface NearbyLocation {
  name: string;
  distanceKm: number;
  etaMinutes: number;
  type: "hospital" | "police";
}
export interface Passenger {
  id: string;
  name: string;
  employeeId: string;
  gender: "male" | "female";
  alert: boolean;
  phone?: string;
}

export interface SecurityIncident {
  id: number;
  vehicleNo: string;
  driverName: string;
  driverRating: number;
  location: string;
  shiftType: string;
  riskScore: number;
  severity: "critical" | "high" | "medium";
  tripStatus: "in_progress" | "completed";
  signalType:
    | "SOS"
    | "OVERSPEED"
    | "ROUTE_DEVIATION"
    | "DEVICE_ISSUE"
    | "FEMALE_ALONE"
    | "GPS_OFFLINE";
  incidentAge: string;
  passengerCount: number;
  passengers?: Passenger[];
  activeRisks: string[];
  driverPhone: string;
  vendorName: string;
  cabId: string;
  gpsStatus: "ONLINE" | "OFFLINE";
  latitude: number;
  longitude: number;
  routePolyline: string;
  events: TimelineEvent[];
  nearbyHospitals: NearbyLocation[];
  nearbyPoliceStations: NearbyLocation[];
  owner?: string;
}

export type SeverityFilter = "critical" | "high" | "medium" | "all" | "SOS";
export type MapMode = "default" | "mapOnly";

// 00000000000000000000 real
// ── Filter Options ────────────────────────────────────────────────────────────
export interface PriorityOption {
  priorityCode: number;
  priorityName: string;
  sortOrder: number;
}

export interface ModuleOption {
  moduleCode: number;
  moduleName: string;
}

export interface AlertFiltersResponse {
  priorities: PriorityOption[];
  modules: ModuleOption[];
}

// -------------- Summary Alerts
export interface AlertSummaryResponse {
  totalAlerts: number;
  unresolvedAlerts: number;
  resolvedAlerts: number;
  acknowledgedAlerts: number;
  byPriority: AlertPrioritySummary[];
  byModule: AlertModuleSummary[];
}

export interface AlertPrioritySummary {
  priorityCode: number;
  priorityName: string;
  total: number;
  unresolved: number;
  resolved: number;
}

export interface AlertModuleSummary {
  moduleCode: number;
  moduleName: string;
  total: number;
  unresolved: number;
  resolved: number;
}

// ------------- Alert Response on the basis of filter
// live packet
// const al = {
//   "alertId": "eddafced-3e48-4dd9-aabd-b19a99edaa39",
//   "alertTypeName": "SOS_PANIC",
//   "priorityCode": 1,
//   "priorityName": "HIGH",
//   "message": "SOS panic triggered by Employee 6 on trip 221.",
//   "alertTime": "2026-06-26T18:33:57.3917528+05:30",
//   "isResolved": false,
//   "dsId": 221,
//   "empId": 6,
//   "driverId": null,
//   "vehicleId": null
// }

export interface Alert {
  alertId: string;
  alertTypeCode: number;
  alertTypeName: string;
  moduleCode: number;
  moduleName: string;
  priorityCode: number;
  priorityName: string;
  message: string;
  alertTime: string; // ISO 8601 datetime
  isResolved: boolean;
  isAcknowledged: boolean;
  dsId: number;
  empId: number;
  driverId: number | null;
  vehicleId: number | null;
  referenceId: string | null;
  lat: number;
  lng: number;
  mobileNumber: string;
  remarks: string | null;

  acknowledgedBy: string | null;
  acknowledgedByName: string | null;
  acknowledgedOn: string | null;
  acknowledgedNote: string | null;
  resolvedBy: string | null;
  resolvedByName: string | null;
  resolvedOn: string | null;
  resolvedNote: string | null;
}
export interface PaginatedAlertsResponse {
  items: Alert[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
// ------------
export interface TripPassenger {
  empId: number;
  employeeID: string;
  firstname: string;
  lastName: string;
  gender: string;
  mobileno: string;
  empLocCode: number;
  tripType: number;
  paxOrder: number;
  address: string;
  noShow: boolean;
  noShowReasonId: number | null;
  orsDeviation: boolean;
  scheduled: boolean;
  paxAdded: boolean;
  paxType: string;
  empDistance: number;
  empDirectDistance: number;
  empCost: number | null;
  plannedScheduleTime: string;
  plannedLat: number;
  plannedLng: number;
  empSigninTime: string | null;
  empSigninLat: number | null;
  empSigninLng: number | null;
  empSignOutTime: string | null;
  empSignOutLat: number | null;
  empSignOutLng: number | null;
  cabReachedTime: string | null;
  cabReachedLat: number | null;
  cabReachedLng: number | null;
  reachedHomeTime: string | null;
  reachedHomeLat: number | null;
  reachedHomeLng: number | null;
  etaDeviationMinutes: number;
  paxTrackingStatus: string;
  otp: number;
}
export interface TripResponse {
  dsId: number;
  isTripFound: boolean;
  locCode: number;
  dsDate: string;

  tripTypeCode: number;
  tripType: number;
  tripTypeName: string;

  totalPax: number;

  scheduledStartTime: string;
  scheduledEndTime: string;

  actualStartTime: string | null;
  actualEndTime: string | null;

  startKm: number | null;
  endKm: number | null;

  plannedRouteDistance: number;
  plannedTotalDuration: string;

  hasPlannedRoutePolyline: boolean;

  transTripStatusCode: number;
  transTripStatusName: string;

  latestGpsStatusCode: number | null;
  latestGpsStatusName: string | null;

  effectiveTripStatusCode: number;
  effectiveTripStatusName: string;

  latestLat: number | null;
  latestLng: number | null;
  latestSpeed: number | null;
  latestGpsTime: string | null;
  latestGpsSource: string | null;

  panic: boolean | null;

  driverId: number | null;
  driverGuid: string | null;
  driverName: string | null;
  driverMobileNo: string | null;
  driverAlternateMobileNo: string | null;
  driverProfileImage: string | null;

  transporterId: number;
  vendorName: string;
  vendorMobileNo: string | null;
  vendorEmailId: string | null;

  vehicleId: number | null;
  vehicleNo: string | null;
  vehicleType: string | null;
  fuelType: string | null;

  isActive: boolean;
  isCompleted: boolean;
  isGuard: boolean,

  shouldUseSignalR: boolean;
  shouldUsePolyline: boolean;

  isPassengerPickedUp: boolean;

  trackingMessage: string;
  trackingMode: string;

  passengers: TripPassenger[];

  cabCapacity: number;
  boardedCount: number;
  yetToBoardCount: number;
  noShowCount: number;
  plannedCount: number;
  adhocCount: number;
  spareSeatCount: number;
  // Added missing fields
  officeLocName: string | null;
  officeLat: number | null;
  officeLng: number | null;
  officeAddress: string | null;
  officeDisplayName: string | null;

  shiftId: number | null;
  shiftTime: string | null;
}
