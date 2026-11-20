// src/features/route-maker/utils/shuttleAdapter.ts
//
// Three adapters — one per consumer.
//
//  adaptShuttleToVehicleRoutes  → CenterMapPanel  (polylines + stop markers)
//  adaptToSidebarStops          → LeftSidebarShuttle (stop list)
//  adaptShuttleTripInfo         → LeftSidebarShuttle (header info / TripSelectionBar)

import type {
  ShuttleAnalyticsResponse,
  ShuttleTripApi,
} from "../types/Shuttleapitypes";

// ─────────────────────────────────────────────────────────────────────────────
// 1. For CenterMapPanel — VehicleRoute-shaped objects (loose any[])
//    Map only reads: VehicleId, routePolyline, Passengers[].{Lat,Lng,PickupSequence}
// ─────────────────────────────────────────────────────────────────────────────

export function adaptShuttleToVehicleRoutes(
  data: ShuttleAnalyticsResponse,
): any[] {
  return data.trips.map((trip) => ({
    VehicleId: trip.dsId,
    routePolyline: trip.routePolyline,
    vehicleRegNo: trip.vehicleRegNo,
    driverName: trip.driverName,
    driverMobile: trip.driverMobile,
    transporterId: null,
    VendorPrefixTag: trip.vendorPrefixTag,
    hasVehicleAssigned: trip.hasVehicleAssigned,
    hasDriverAssigned: trip.hasDriverAssigned,
    hasEscortAssigned: trip.hasEscortAssigned,
    isFlagged: trip.isFlagged,
    isApproved: trip.isApproved,
    isGuard: trip.isGuard,
    totalPax: trip.totalPax,
    routeDistanceKm: trip.routeDistanceKm,
    hasFemale: trip.hasFemale,
    allFemale: trip.allFemale,
    hasSpecialNeeds: trip.hasSpecialNeeds,
    // One marker per stop, positioned at the nodal point (first passenger's lat/lng)
    Passengers: trip.stops.map((stop) => {
      const firstPax = stop.passengers[0];
      return {
        Id: stop.stopId,
        Firstname: `Stop ${stop.stopOrder}`,
        Lastname: `· ${stop.passengers.length} pax`,
        EmployeeID: `stop-${stop.stopId}`,
        Address: firstPax?.address ?? `Stop ${stop.stopOrder}`,
        Lat: firstPax?.lat ?? 0,
        Lng: firstPax?.lng ?? 0,
        PickupSequence: stop.stopOrder,
        Gender: "M",
        MobileNo: stop.passengers.map((p) => p.mobileNo).join(", "),
        noShow: false,
        specialNeeds: false,
        eta: stop.schArrivalTime,
      };
    }),
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. For LeftSidebarShuttle — matches the actual ShuttleStop interface:
//
//    interface ShuttleStop {
//      id: string
//      stopNumber: number
//      stopName: string
//      address: string
//      passengerCount: number
//      distanceKms: number
//      eta: string
//      passengers: Passenger[]   // { id, name, empId, gender, isChecked }
//    }
// ─────────────────────────────────────────────────────────────────────────────

export function adaptToSidebarStops(trip: ShuttleTripApi): any[] {
  return trip.stops.map((stop) => ({
    // ── required by LeftSidebarShuttle / ShuttleStopCard ──────────────────
    id: String(stop.stopId), // used by handlePassengerCheckToggle
    stopNumber: stop.stopOrder,
    stopName: stop.passengers[0]?.address
      ? stop.passengers[0].address.split(",")[0].trim() // short human name
      : `Stop ${stop.stopOrder}`,
    address: stop.passengers[0]?.address ?? `Stop ${stop.stopOrder}`,
    passengerCount: stop.passengers.length,
    distanceKms: 0, // not returned by API — placeholder
    eta: fmtTime(stop.schArrivalTime),

    // ── passengers — matches Passenger interface ──────────────────────────
    passengers: stop.passengers.map((p) => ({
      id: String(p.empId), // used by handlePassengerCheckToggle
      name: p.passengerName,
      empId: String(p.empId),
      gender: p.gender as "M" | "F" | "Other",
      isChecked: false,
    })),
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. For LeftSidebarShuttle — tripInfo / TripSelectionBar header
//    Matches ShuttleTripHeaderInfo from apiRouteTypes — adjust if your type differs.
// ─────────────────────────────────────────────────────────────────────────────

export function adaptShuttleTripInfo(trip: ShuttleTripApi): any {
  return {
    // common fields expected by TripSelectionBar / ShuttleTripHeaderInfo
    tripId: trip.dsId,
    vehicleNo: trip.vehicleRegNo ?? "Not assigned",
    vehicleRegNo: trip.vehicleRegNo,
    driverName: trip.driverName ?? "Not assigned",
    driverMobile: trip.driverMobile ?? "",
    totalPax: trip.totalPax,
    totalStops: trip.stops.length,
    distanceKm: trip.routeDistanceKm,
    durationMin: Math.round(parseFloat(trip.totalDuration || "0")),
    vendorName: trip.vendorName ?? "Not assigned",
    escortName: trip.escortName,
    escortMobile: trip.escortMobile,
    hasVehicleAssigned: trip.hasVehicleAssigned,
    hasDriverAssigned: trip.hasDriverAssigned,
    hasEscortAssigned: trip.hasEscortAssigned,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "—";
  }
}

// export function toRouteAdapter(trip: ShuttleTripApi): any {
//   console.log("toRouteAdapter from shuttle route adapter", trip);

//   return {
//     VehicleId: trip.dsId,
//     isVenddorAssign: !!trip.vendorName,
//     vendorName: trip.vendorName ?? null,
//     vendorPrefixTag:
//       (trip as any).vendorPrefixTag ??
//       (trip.vendorName ? trip.vendorName.substring(0, 4) : null),
//     hasDriverAssigned: trip.hasDriverAssigned,
//     hasVehicleAssigned: trip.hasVehicleAssigned,
//     vehicleRegNo: trip.vehicleRegNo ?? null,
//     driverName: trip.driverName ?? null,
//     driverMobile: trip.driverMobile ?? null,
//     Passengers: [],
//   };
// }

export function toRouteAdapter(trip: ShuttleTripApi): any {
  // Flatten all stop passengers → VehicleRoute.Passenger shape
  // Each shuttle stop has multiple passengers; stopOrder acts as sequence
  const passengers = trip.stops.flatMap((stop) =>
    stop.passengers.map((p) => ({
      // Core fields the modal and passenger list components read
      Id: p.empId,
      empId: p.empId,
      Firstname: p.passengerName,
      Gender: p.gender,
      Address: p.address,
      EmployeeID: String(p.empId),
      PickupSequence: stop.stopOrder,

      // Adapter/display fields
      displayName: p.displayName ?? null,
      mobileNo: p.mobileNo ?? null,
      locality: p.locality ?? null,

      // Metrics
      routedDistanceKm: p.routedDistanceKm,
      extraDistanceKm: p.extraDistanceKm,
      EstimatedPickupTime: p.eta,
      noShow: p.noShow,
    })),
  );

  return {
    VehicleId: trip.dsId,
    isVenddorAssign: !!trip.vendorName,
    vendorName: trip.vendorName ?? null,
    vendorPrefixTag:
      (trip as any).vendorPrefixTag ??
      (trip.vendorName ? trip.vendorName.substring(0, 4) : null),
    hasDriverAssigned: trip.hasDriverAssigned,
    hasVehicleAssigned: trip.hasVehicleAssigned,
    vehicleRegNo: trip.vehicleRegNo ?? null,
    driverName: trip.driverName ?? null,
    driverMobile: trip.driverMobile ?? null,

    // Extra fields modals may read for header/badge display
    TotalSeatUsed: trip.totalPax,
    IsFemaleTrip: trip.hasFemale || trip.allFemale,
    IsSpecialNeedTrip: trip.hasSpecialNeeds,
    IsFlagged: trip.isFlagged,
    IsApproved: trip.isApproved,
    IsGuardAllocated: trip.isGuard,

    // Populated — modals will now show actual passenger list
    Passengers: passengers,
  };
}
