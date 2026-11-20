// left side
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
  noShowReason: string | null;
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
export interface StopPassenger {
  isSignOutVisible: boolean;
  isSignInButtonVisible: boolean;
  isNoShowButtonVisible: boolean;
  empId: number;
  passengerName: string;
  mobileNo: string;
  lat: number;
  lng: number;
  pickupAddress: string;
  pSchTime: string;
  paxOrder: number;
  status: string | null;
  reached: boolean;
  locCode: number;
  officeName: string;
  officeLat: number;
  officeLng: number;
}
export interface Stops {
  stopId: number;
  stopOrder: number;
  nodalPointId: number;
  stopLat: number;
  stopLng: number;
  stopAddress: string;
  schArrivalTime: string;
  actArrivalTime: string | null;
  totalPassengers: number;
  boardedCount: number;
  deboardedCount: number;
  noShowCount: number;
  reached: boolean;
  isReachedButtonVisible: boolean;
  stopStatus: "Next" | "Upcoming" | string;
  passengers: StopPassenger[];
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
  guardName: string | null,
  guardMobileNo: string | null,

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
  stops: Stops[] | [];
}
// right side 
export interface TripTrackingResponse {
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

  plannedRouteDistance: number;
  plannedTotalDuration: string;
  plannedRoutePolyline: string;
  actualRoutePolyline: string;

  transTripStatusCode: number;
  transTripStatusName: string;
  isCompleted: boolean;
  trackingMode: string;

  latestGps: GpsLocation;
  gpsPoints: GpsLocation[];
}

export interface GpsLocation {
  logId?: number;
  dsId: number;
  latitude: number;
  longitude: number;
  tripStatusCode: number | null;
  tripStatusName: string | null;
  gpsTime: string | null;
  source: string | null;
  speed: number | null;
  panic: boolean | null;
  miscellaneous: Miscellaneous
}

export interface dummyGPS {
  dsId: number;
  lat: number;
  lng: number;
  speed: number;
  dateTime: string;
}


// ------------------- signalR Type -----------------
export interface RouteLocationPayload {
  dsId: number;
  latitude: number;
  longitude: number;
  speed: number;
  gpsTime: string;
  tripStatusCode: number | null;
  tripStatusName: string | null;
  source: string;
  panic: boolean;
  logId?: number;
  batteryPercentage: number;
  passengers: TripPassenger[];
  miscellaneous: Miscellaneous
  shuttle?: Shuttle;
}
export interface Shuttle {
  stops: Stops[];
}
export type Miscellaneous = {
  speed: number;
  gpsLoss: boolean;
  networkLoss: boolean;
  bearing?: number;
  onCharging?: boolean;
  // {\"speed\":2,\"gpsLoss\":false,\"networkLoss\":false,\"accuracy\":38.07500076293945,\"altitude\":194.40000915527344,\"bearing\":197.845703125,\"bearingAccuracy\":45.0,\"speedAccuracy\":1.5,\"isMocked\":false}"
};
export interface GPSPointRight {
  logId: number,
  dsId: number;
  latitude: number;
  longitude: number;
  speed: number | null;
  gpsTime: string;
  source: string;
  tripStatusCode?: number | null;
  tripStatusName?: string | null;
  panic: boolean | null;
  miscellaneous: Miscellaneous
}

export interface TrackingStatusResponse {
  trackingMode:
  | "LIVE_SIGNALR"
  | "COMPLETED_POLYLINE"
  | "CANCELLED";

  shouldUseSignalR: boolean;
  shouldUsePolyline: boolean;

  trackingMessage?: string;
}

export interface SignInParams {
  empId: number;
  tripID: number;
  tripType: number;
  empSigninLat: number;
  empSigninLng: number;
  otp: number;
}

export interface SignOutParams {
  empId: number;
  tripID: number;
  tripType: number;
  empSignOutLat: number;
  empSignOutLng: number;
  otp: number;
}
// -------------

export interface DeviceHealthParams {
  dsid: number;
}

export interface DeviceHealthLog {
  logID: number;
  dsid: number;
  lat: number;
  lng: number;
  createdOn: string;
  batteryPercentage: number;
  accuracy: number;
  speed: number;
  gpsLoss: boolean;
  networkLoss: boolean;
  isMocked: boolean;
  onCharging: boolean;
  onCall: boolean;
  isHasInternet: boolean;
  deviceHealth: string;
}

export interface DeviceHealthResponse {
  result: DeviceHealthLog[];
  success: boolean;
  message: string;
}

// ----------------------------------
export interface EmployeeDistance {
  fromEmpId: number;
  toEmpId: number;
  distanceKm: number;
  toEmployeeSnapDistanceKm: number;
}

export interface TripDistanceResponse {
  dsId: number;
  isTripFound: boolean;
  actualRouteDistanceKm: number;
  employeeDistances: EmployeeDistance[];
}
export type RouteStatus = "Completed" | "Ongoing" | "Delayed";
export type BoardingStatus = "Boarded" | "No Show" | "Pending";
export interface RouteStatusBadgeProps {
  status: RouteStatus;
}
export interface AlertBannerProps {
  message: string;
}
export interface ReplayButtonProps {
  onClick?: () => void;
}