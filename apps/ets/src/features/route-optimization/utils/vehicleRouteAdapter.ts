// /**
//  * Invalidate the adapter cache for a specific routes array.
//  * Call this whenever routes change (e.g. after a drag-and-drop passenger move)
//  * so the map re-renders with fresh data.
//  */
// export function invalidateAdapterCache(routes: VehicleRoute[]): void {
//   _cache.delete(routes);
// }
// src/features/route-maker/utils/vehicleRouteAdapter.ts
//
// Converts VehicleRoute[] → RouteData[] for RouteMap / useRouteMap.
//
// SHAPE CONTRACT (must match routeMap.types.ts / useRouteMap.ts):
//   RouteData {
//     routeId:   string                          ← was `id: number`
//     color:     string
//     path:      Array<{ lat: number; lng: number }>
//     employees: Array<{
//       lat:          number
//       lng:          number
//       stopOrder:    number
//       employeeName: string
//     }>
//   }
//
// POLYLINE FIX:
//   RoutePolyline is a Google Maps encoded polyline string.
//   We decode it inline (no external dep) to get the real road geometry
//   instead of straight lines between waypoints.

import type { VehicleRoute } from "../types/Routemaker.types";
import type { RouteData, EmployeeStop } from "../map/routeMap.types";

// // ── RouteData shape expected by useRouteMap / mapBounds ──────────────────────
// export interface RouteEmployee {
//   lat: number;
//   lng: number;
//   stopOrder: number;
//   employeeName: string;
// }

// export interface RouteData {
//   routeId: string; // string — useRouteMap keys everything by routeId
//   color: string;
//   path: Array<{ lat: number; lng: number }>; // decoded road geometry
//   employees: RouteEmployee[]; // stop markers
// }

// ── Google encoded-polyline decoder (inline, zero deps) ──────────────────────
// https://developers.google.com/maps/documentation/utilities/polylinealgorithm
function decodePolyline(encoded: string): Array<{ lat: number; lng: number }> {
  const result: Array<{ lat: number; lng: number }> = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let b: number;
    let raw = 0;

    // latitude chunk
    do {
      b = encoded.charCodeAt(index++) - 63;
      raw |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += raw & 1 ? ~(raw >> 1) : raw >> 1;

    shift = 0;
    raw = 0;

    // longitude chunk
    do {
      b = encoded.charCodeAt(index++) - 63;
      raw |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += raw & 1 ? ~(raw >> 1) : raw >> 1;

    result.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return result;
}

// ── Adapter cache ─────────────────────────────────────────────────────────────
let _cache: Map<string, RouteData> | null = null;
let _cacheKey = "";

// function buildCacheKey(routes: VehicleRoute[]): string {
//   return routes.map((r) => `${r.VehicleId}:${r.Passengers.length}`).join("|");
// }

// NEW — includes each passenger's ID and sequence so reorder busts the cache
function buildCacheKey(routes: VehicleRoute[]): string {
  return routes
    .map((r) => {
      const pax = [...r.Passengers]
        .sort((a, b) => a.PickupSequence - b.PickupSequence)
        .map((p) => `${p.Id}:${p.PickupSequence}`)
        .join(",");
      return `${r.VehicleId}|${pax}`;
    })
    .join("||");
}

/** Call after a drag-and-drop to force the next adaptVehicleRoutes to re-run */
export function invalidateAdapterCache(routes: VehicleRoute[]): void {
  _cacheKey = buildCacheKey(routes);
  _cache = null;
}

// ── Main export ───────────────────────────────────────────────────────────────
export function adaptVehicleRoutes(
  routes: VehicleRoute[],
  colorMap: Record<number, string>,
): RouteData[] {
  const key = buildCacheKey(routes);
  if (_cache && key === _cacheKey) {
    return Array.from(_cache.values());
  }

  _cache = new Map<string, RouteData>();
  _cacheKey = key;

  for (const route of routes) {
    const routeId = String(route.VehicleId);
    const color = colorMap[route.VehicleId] ?? "#3b82f6";

    // ── Decode real road path from encoded polyline ───────────────────────────
    let path: Array<{ lat: number; lng: number }> = [];

    if (route.RoutePolyline && route.RoutePolyline.length > 0) {
      try {
        path = decodePolyline(route.RoutePolyline);
      } catch (err) {
        console.warn(
          `[vehicleRouteAdapter] Failed to decode polyline for route ${routeId}:`,
          err,
        );
      }
    }

    // Fallback: straight lines through waypoints (no polyline in data)
    if (path.length === 0) {
      path = [...route.Waypoints]
        .sort((a, b) => a.Sequence - b.Sequence)
        .map((w) => ({ lat: w.Lat, lng: w.Lng }));
    }

    // ── Build employee stop markers ───────────────────────────────────────────
    // Use Passengers directly (real coords from API / mock).
    // Sort by PickupSequence so stopOrder matches pickup order.
    // const employees: EmployeeStop[] = [...route.Passengers]
    //   .sort((a, b) => a.PickupSequence - b.PickupSequence)
    //   .map((p) => ({
    //     lat: p.Lat,
    //     lng: p.Lng,
    //     stopOrder: p.PickupSequence,
    //     employeeName: p.Firstname,
    //   }));

    const employees: EmployeeStop[] = [...route.Passengers]
      .sort((a, b) => a.PickupSequence - b.PickupSequence)
      .map((p) => ({
        id: String(p.Id),
        employeeName: p.Firstname,
        employeeId: p.EmployeeID, // ← add
        address: p.Address, // ← add
        estimatedPickupTime: p.EstimatedPickupTime, // ← add
        lat: p.Lat,
        lng: p.Lng,
        stopOrder: p.PickupSequence,
        routeId,
        gender: p.Gender === "M" ? "Male" : "Female",
        isGuarded: route.IsGuardAllocated,
        status: "PICKUP",
        empId: p.empId,
        mobile: p.mobileNo,
      }));

    _cache.set(routeId, {
      routeId,
      cabId: routeId,
      tripType: "LOGIN",
      color,
      path,
      employees,
      totalDistance: route.RouteDistanceKm,
      estimatedTime: route.RouteDurationMinutes,
    });
  }

  return Array.from(_cache.values());
}
