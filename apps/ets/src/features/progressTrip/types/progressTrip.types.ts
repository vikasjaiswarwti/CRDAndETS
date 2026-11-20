export interface TripPassenger {
  empId: number;
  employeeID: string;
  firstname: string;
  lastName: string;
  gender: string;
  mobileno: string;
  emailID: string;
  empLocCode: number;
  empOffice: string;
  tripType: number;
  paxOrder: number;
  address: string;
  plannedLat: number;
  plannedLng: number;
  noShow: boolean;
  noShowReasonId: number | null;
  scheduled: boolean;
  paxAdded: boolean;
  paxType: string;
  empDistance: number;
  empDirectDistance: number;
  plannedScheduleTime: string;
  empSigninTime: string | null;
  empSigninLat: number | null;
  empSigninLng: number | null;
  empSignOutTime: string | null;
  empSignOutLat: number | null;
  empSignOutLng: number | null;
  cabReachedTime: string | null;
  reachedHomeTime: string | null;
  etaDeviationMinutes: number;
  otp: number;
  paxTrackingStatus: string;
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
  plannedRoutePolyline: string;

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
  vehicleType: string | number | null;
  vehicleTypeDesc: string;
  fuelType: string | number | null;
  fuelTypeDesc: string | null;

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
// ---------------------------------------------------------
export interface OngoingTripPassenger {
  empId: number;
  firstname: string;
  lastName: string;
  gender: "Male" | "Female",
  paxOrder: number;
  noShow: boolean;
  plannedScheduleTime?: string | null;
  signinTime?: string | null;
  signOutTime?: string | null;
  cabReachedTime?: string | null;
  reachedHomeTime?: string | null;
  paxTrackingStatus: string;
  noShowRsnId: number | null;
  noshowReason: string | null;
  noShowTime: string;
}

export interface OngoingTrip {
  dsId: number;
  locCode: number;
  dsDate: string;
  tripType: number;
  tripTypeName: string;
  shiftTime: string;
  shiftId: number;
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualStartTime: string | null;
  actualEndTime: string | null;
  statusCode: number;
  statusName: string;
  totalPax: number;
  paxCount: number;
  boardedCount: number;
  deBoardedCount: number;
  noShowCount: number;
  vehicleId: number | null;
  vehicleNo: string | null;

  transporterId: number | null;
  vendorName: string | null;

  driverId: number | null;
  driverName: string | null;
  driverNumber: string | number;
  isVehicleUnassigned: boolean;
  isVendorUnassigned: boolean;
  isActive: boolean;
  isGuard?: boolean;
  guardName?: string | null;
  guardMobileNo?: string | null;
  passengers?: OngoingTripPassenger[];
}

export interface OngoingTripsResult {
  trips: OngoingTrip[];
  totalCount: number;
}

export interface OngoingTripsResponse {
  result: OngoingTripsResult;
  isSuccess: boolean;
  message: string;
}
// -------------------
export interface Event {
  eventType: string;
  dsId: number;
  statusCode: number | null;
  statusName: string | null;
  actualStartTime: string | null;
  actualEndTime: string | null;
  empId: number;
  paxCount: number;
  boardedCount: number;
  deBoardedCount: number;
  noShowCount: number;
}
export interface TripTypeOption {
  label: string;
  value: number;
}
export interface SelectOptions extends TripTypeOption { }
// ----------------------- 13 july
export interface MultitripResponse {
  trips: TripTrackingPacket[];
}
export interface LatestPosition {
  latitude: number;
  longitude: number;
  speed: number | null;
  gpsTime: string;
  panic: boolean | null;
  batteryPercentage: number;
  miscellaneous: string;
}
export interface Passenger {
  empId: number;
  name: string;
  paxOrder: number;
  plannedLat: number;
  plannedLng: number;
  address: string;
  noShow: boolean;
  paxTrackingStatus: string;
  empSigninTime: string | null;
  empSigninLat: number | null;
  empSigninLng: number | null;
  empSignOutTime: string | null;
  empSignOutLat: number | null;
  empSignOutLng: number | null;
}

export interface TripTrackingPacket {
  dsId: number;
  locCode: number;

  dsDate: string;

  tripType: number;
  tripTypeName: string;

  shiftTime: string;
  shiftId: number;

  scheduledStartTime: string;
  scheduledEndTime: string;

  actualStartTime: string | null;
  actualEndTime: string | null;

  statusCode: number;
  statusName: string;

  totalPax: number;
  paxCount: number;
  boardedCount: number;
  noShowCount: number;

  vehicleId: number;
  vehicleNo: string;

  transporterId: number;
  vendorName: string;

  driverId: number;
  driverName: string;
  driverNumber: string | number;

  isVehicleUnassigned: boolean;
  isVendorUnassigned: boolean;

  actualRoutePolyline: string;
  pointCount: number;

  latestPosition: LatestPosition | null;
  officeLocName: string;
  officeLat: number;
  officeLng: number;
  officeAddress: string;
  officeDisplayName: string;
  passengers: Passenger[];
}

export interface LatestPosition {
  latitude: number;
  longitude: number;

  speed: number | null;
  gpsTime: string;

  panic: boolean | null;
  batteryPercentage: number;
  miscellaneous: string;
}

export interface TrackingMiscellaneous {
  speed: number;
  gpsLoss: boolean;
  networkLoss: boolean;

  accuracy: number;
  altitude: number;

  bearing: number;
  bearingAccuracy: number;
  speedAccuracy: number;

  isMocked: boolean;
  onCharging: boolean;
  onCall: boolean;
  isHasInternet: boolean;
}

// ----------------- 13 july 12:22
export interface DriverLocationResponse {
  dsId: number;
  latitude: number;
  longitude: number;
  speed: number | null;
  gpsTime: string; // ISO Date
  panic: boolean;
  source: string;
  batteryPercentage: number;
  miscellaneous: string; // JSON string from API
}
export interface DriverLocationMiscellaneous {
  speed: number;
  gpsLoss: boolean;
  networkLoss: boolean;
  accuracy: number;
  altitude: number;
  bearing: number;
  bearingAccuracy: number;
  speedAccuracy: number;
  isMocked: boolean;
  onCharging: boolean;
  onCall: boolean;
  isHasInternet: boolean;
}
// ----------------- Trip Life Cycle ------------------------
export interface TripSummary {
  title: string;
  Stage: number;
  summary: Summary;
  Panel: TripLifeCycle[];
}


export interface Summary {
  value: number;
  label: string;
  total: number;
}
export interface KPIs {
  womenTravellingAlone: number;
  adhocTrips: number;
  pendingDropVerification: number;
}

export interface TripLifeCycleDetail {
  EmpId: number;
  UserName: string;
  MobileNo: string;
  TripID: number;
  Vehicle_Registration_No?: string;
  TripType: string;
  ShiftTime: string;
  TripDate: string;
  TripStatusCode: string;
  Escort: string;
}

export interface TripLifeCycleDetailsResponse extends KPIs {
  escortTrips: number;
  delayedVehicleCompletedTrips: number;
  womenTravellingAloneDetails: TripLifeCycleDetail[];
  adhocTripDetails: TripLifeCycleDetail[];
  escortTripDetails: TripLifeCycleDetail[];
  delayedVehicleCompletedTripDetails: TripLifeCycleDetail[];
}

export interface TripLifeCycle {
  Id: string;
  EmployeeCount: number;
  TripCount: number;
  RouteCreatedTrips: number;
  DisplayName: string;
  Male: number;
  Female: number;
  total: number;
  title: string;
  SortOrder: number;
}
export interface TripLifeCycleResponse {
  stages: TripSummary[];
  kpis: KPIs;
}
export interface RawTripLifeCycleResponse {
  routing: string;
  generation: string;
  pre_Trip: string;
  in_Progress: string;
  completed: string;
  womenTravellingAlone: number;
  adhocTrips: number;
  pendingDropVerification: number;
}
export interface TripLifeCycleRequest {
  locCode: number;
  fromDate: string;
  toDate: string;
  tripType: number;
  loginShifts: string;
  logoutShifts: string;
  transporterId: number;
}