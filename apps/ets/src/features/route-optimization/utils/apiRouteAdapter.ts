// src/features/route-maker/utils/apiRouteAdapter.ts
//
// Translates the raw route-analytics API response into VehicleRoute[].
//
// KEY FIX: routePolyline from the API (encoded string on each trip) is mapped
// directly to VehicleRoute.RoutePolyline so vehicleRouteAdapter can decode it.
//
// Field mapping summary:
//   dsId                         → VehicleId
//   passengers[].empId           → Passenger.Id (and EmployeeID)
//   passengers[].lat/lng         → Passenger.Lat/Lng
//   routePolyline                → RoutePolyline  ← CRITICAL for road drawing
//   totalDuration (string, mins) → RouteDurationMinutes
//   Waypoints                    → synthesised from passengers array

import type {
  VehicleRoute,
  Passenger,
  Waypoint,
} from "../types/Routemaker.types";

// ── Raw API shapes ─────────────────────────────────────────────────────────────

interface ApiPassenger {
  empId: number;
  address: string;
  passengerName: string | null;
  lat: number;
  lng: number;
  directDistanceKm: number;
  routedDistanceKm: number;
  extraDistanceKm: number;
  eta: string; // ISO datetime string — may be empty/invalid
  specialNeeds: boolean;
  gender: "M" | "F";
  locality: string;
  displayName: string;
  mobileNo: number;
  noShow: boolean;
  noShowType:string;
}

interface ApiTrip {
  dsId: number;
  isGuard: boolean;
  totalPax: number;
  vendorName: string | null;
  totalDuration: string | null; // ← nullable: backend sends null when unset
  routeDistanceKm: number;
  tripExtraKm: number;
  routePolyline: string | null; // ← nullable: null when no polyline computed
  passengers: ApiPassenger[];
  hasFemale: boolean;
  allFemale: boolean;
  avgRadialKm: number;
  isFlagged: boolean;
  isApproved: boolean;
  hasSpecialNeeds: boolean;
  hasVehicleAssigned: boolean;
  hasDriverAssigned: boolean;
  tripStatusCode: number;
  flapNo: number | null; // ← nullable
  hasEscortAssigned: boolean;
  driverName: string | null; // ← nullable
  vehicleRegNo: string | null; // ← nullable
  driverMobile: string | null; // ← nullable
  vendorPrefixTag: string | null;
  escortName: string | null;
  escortMobile: string | null;
  occupancy: number;
  capacity: number;
  copied: boolean;
  copiedFrom: string;
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
  officeLat: number;
  officeLng: number;
  officeName: string;
}

// ── Office location ────────────────────────────────────────────────────────────
const OFFICE_LAT = 18.5108;
const OFFICE_LNG = 73.9282;
const OFFICE_LABEL = "Office";

// ── Safe helpers ───────────────────────────────────────────────────────────────

/**
 * Safely parse duration value (string | null) into minutes.
 * Returns 0 for null, empty, or unparseable values.
 */
function safeDurationMinutes(value: string | null | undefined): number {
  if (value == null || value.trim() === "") return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Safely convert a date string to an ISO string.
 * Returns "" for null, empty, or invalid date strings.
 */
function safeIso(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString();
  } catch {
    return "";
  }
}

/**
 * Subtract minutes from a date string. Returns "" if date is invalid
 * or durationMinutes is 0 / NaN.
 */
function subtractMinutes(isoDateStr: string, durationMinutes: number): string {
  if (!isoDateStr || durationMinutes < 0) return "";
  try {
    const d = new Date(isoDateStr);
    if (isNaN(d.getTime())) return "";
    d.setMinutes(d.getMinutes() - durationMinutes);
    return d.toISOString();
  } catch {
    return "";
  }
}

// ── Adapter ───────────────────────────────────────────────────────────────────
export function adaptApiResponse(
  api: ApiRouteAnalyticsResponse,
): VehicleRoute[] {
  if (!api?.trips || !Array.isArray(api.trips)) return [];
  return api.trips.map((trip) => adaptTrip(trip));
}
export const formatTime = (dateTime: string): string => {
  return new Date(dateTime).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

function adaptTrip(trip: ApiTrip): VehicleRoute {
  // ── Duration — null-safe ─────────────────────────────────────────────────
  const durationMinutes = safeDurationMinutes(trip.totalDuration);

  // ── Passengers ──────────────────────────────────────────────────────────
  const passengers: Passenger[] = trip.passengers.map((p, i) =>
    adaptPassenger(p, i, 0),
  );
  // console.log(trip.passengers, "passengers 381");
  // ── Waypoints — one per passenger (pickup) + office terminal ─────────────
  const waypoints: Waypoint[] = [
    ...trip.passengers.map((p, i) => ({
      PassengerId: p.empId,
      Label: p.address.split(",")[0] ?? `Stop ${i + 1}`,
      Lat: p.lat,
      Lng: p.lng,
      Sequence: i + 1,
      EstimatedArrivalTime: safeIso(p.eta),
    })),
    {
      PassengerId: null,
      Label: OFFICE_LABEL,
      Lat: OFFICE_LAT,
      Lng: OFFICE_LNG,
      Sequence: trip.passengers.length + 1,
      EstimatedArrivalTime: safeIso(
        trip.passengers[trip.passengers.length - 1]?.eta ?? "",
      ),
    },
  ];

  // ── ETA / departure — null-safe ─────────────────────────────────────────
  const rawLastEta = trip.passengers[trip.passengers.length - 1]?.eta ?? "";
  const estimatedOfficeArrival = safeIso(rawLastEta);
  const cabDepartureTime = subtractMinutes(
    estimatedOfficeArrival,
    durationMinutes,
  );

  // ── Efficiency ──────────────────────────────────────────────────────────
  const avgDetour =
    trip.passengers.length > 0
      ? trip.passengers.reduce((s, p) => s + (p.extraDistanceKm ?? 0), 0) /
        trip.passengers.length
      : 0;

  const efficiency =
    trip.routeDistanceKm > 0
      ? Math.round(
          ((trip.routeDistanceKm - trip.tripExtraKm) / trip.routeDistanceKm) *
            100,
        )
      : 100;

  // ── Late passengers ─────────────────────────────────────────────────────
  const latePassengers = passengers.filter((p) => p.IsLate);

  return {
    VehicleId: trip.dsId,
    isVenddorAssign: trip.vendorName !== null,
    vendorName: trip.vendorName ?? "",
    vendorPrefixTag: trip.vendorPrefixTag,

    Passengers: passengers,
    PickupOrder: trip.passengers.map((p) => p.empId),
    IsGuardAllocated: trip.isGuard ?? false,
    GuardSeatCount: trip.isGuard ? 1 : 0,
    TotalSeatUsed: trip.totalPax ?? passengers.length,
    AvailablePassengerSeats: Math.max(
      0,
      6 - (trip.totalPax ?? passengers.length),
    ),

    // ↓ CRITICAL — null-guarded: null when no polyline computed yet
    RoutePolyline: trip.routePolyline ?? "",

    RouteDistanceKm: trip.routeDistanceKm ?? 0,
    RouteDurationMinutes: durationMinutes,
    Waypoints: waypoints,
    EfficiencyPercentage: efficiency,
    AverageDetourKm: avgDetour,
    TotalDirectDistanceKm: trip.passengers.reduce(
      (s, p) => s + (p.directDistanceKm ?? 0),
      0,
    ),
    TotalActualDistanceKm: trip.routeDistanceKm ?? 0,
    CabDepartureTime: cabDepartureTime,
    EstimatedOfficeArrival: estimatedOfficeArrival,
    AnyCabMemberIsLate: latePassengers.length > 0,
    LatePassengerCount: latePassengers.length,
    ExtraDistanceKm: trip.tripExtraKm ?? 0,
    Eta: estimatedOfficeArrival,
    IsFlagged: trip.isFlagged ?? false,
    IsApproved: trip.isApproved ?? false,
    IsFemaleTrip: trip.hasFemale ?? false,
    IsSpecialNeedTrip: trip.hasSpecialNeeds ?? false,
    hasVehicleAssigned: trip.hasVehicleAssigned ?? false,
    hasDriverAssigned: trip.hasDriverAssigned ?? false,
    tripStatusCode: trip.tripStatusCode ?? 0,
    flapNo: trip.flapNo ?? 0, // null → 0
    hasEscortAssigned: trip.hasEscortAssigned ?? false,
    vehicleRegNo: trip.vehicleRegNo ?? "", // null → ""
    driverName: trip.driverName ?? "", // null → ""
    driverMobile: trip.driverMobile ?? "", // null → ""
    escortName: trip.escortName ?? "",
    escortMobile: trip.escortMobile ?? "",
    // --------- new field added for occupancy and capacity 8 july Amit
    occupancy: trip.occupancy ?? 0,
    capacity: trip.capacity ?? 0,
    copied: trip.copied ?? false,
    copiedFrom: trip.copiedFrom ?? "",
  };
}

function adaptPassenger(
  p: ApiPassenger,
  index: number,
  durationMinutes: number, // already null-safe, passed from adaptTrip
): Passenger {
  // Efficiency per passenger
  const pEfficiency =
    p.routedDistanceKm > 0
      ? Math.round(((p.directDistanceKm ?? 0) / p.routedDistanceKm) * 100)
      : 100;

  // "Late" heuristic: extra detour > 2 km adds meaningful delay
  const isLate = (p.extraDistanceKm ?? 0) > 2;
  const minutesLate = isLate
    ? Math.round(((p.extraDistanceKm ?? 0) / 30) * 60)
    : 0;

  // ── Pickup time — null-safe ───────────────────────────────────────────────
  // etaDate may be Invalid Date if p.eta is empty/null — guard before arithmetic
  const etaIso = safeIso(p.eta);
  // console.log(p.eta, "etaIso 499")
  //   console.log(durationMinutes, "durationMinutes 500")
  const pickupTimeIso = subtractMinutes(etaIso, durationMinutes);
  // const pickupETA=formatTime(p?.eta);
  // console.log(pickupETA, "pickupETA");

  return {
    Id: p.empId,
    empId: p.empId,
    EmployeeID: `EMP-${p.empId}`,
    Firstname: p.passengerName ?? `Employee ${p.empId}`,
    Address: p.address ?? "",
    Gender: p.gender ?? "M",
    Lat: p.lat,
    Lng: p.lng,
    PickupSequence: index + 1,
    EstimatedPickupTime: pickupTimeIso,
    RideTimeMinutes: durationMinutes, // already 0 when null, not NaN
    EstimatedArrivalAtOffice: etaIso,
    IsLate: isLate,
    MinutesFromDeadline: minutesLate,
    EfficiencyPercentage: pEfficiency,
    routedDistanceKm: p.routedDistanceKm ?? 0,
    extraDistanceKm: p.extraDistanceKm ?? 0,
    locality: p.locality,
    displayName: p.displayName,
    mobileNo: p.mobileNo,
    noShow: p.noShow,
    noShowType:p.noShowType,
  };
}
