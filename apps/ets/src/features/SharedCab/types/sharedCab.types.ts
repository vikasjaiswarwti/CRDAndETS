// Response of GET /api/v1/Tracking/shared-cab
import type { GpsLocation } from "../../route-tracking/types/tracking.types";

export interface SharedCabPassenger {
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
  plannedLat: number;
  plannedLng: number;
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
  empOffice: string;
  boardingOtp: number;
  deBoardingOtp: number;
  noShowReason: string;
}

export interface SharedCabResponse {
  dsId: number;
  isTripFound: boolean;
  locCode: number;
  dsDate: string;

  tripTypeCode: number;
  tripType: number; // 1 = Pickup, 2 = Drop
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

  latestGps: GpsLocation | null;
  gpsPoints: GpsLocation[];
  // Shape not confirmed by backend yet
  stops: unknown[];

  passengers: SharedCabPassenger[];
  employeeName: string;
  empId: number;
  shouldUseSignalR: boolean;
  driverName: string;
  driverMobile: string;
  vehicleRegNo: string;
  vehicleTypeDesc: string;
  isGuard: boolean;
  guardName: string | null;
  guardMobile: string | null;
  officeLocName: string;
  officeLat: number;
  officeLng: number;
  officeAddress: string;
  officeDisplayName: string;
}

export interface SharedCabParams {
  dsId: string;
  accessToken: string;
}
