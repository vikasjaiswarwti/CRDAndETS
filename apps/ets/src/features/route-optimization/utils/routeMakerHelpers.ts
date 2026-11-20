// ─── utils/routeMakerHelpers.ts ───────────────────────────────────────────────
// Pure helper functions — no React, no side-effects.
// Every function is independently unit-testable.

import type { VehicleRoute, CabGroup } from "../types/Routemaker.types";
import { routeColor } from "../constants/designTokens";

// ─── Date / time formatters ───────────────────────────────────────────────────

/** "2026-12-05T08:35:00" → "08:35 AM" */
export const fmt12 = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/** 48 → "48 min" */
export const fmtDuration = (minutes: number): string => `${minutes} min`;

/** 6.7 → "6.7 km" */
export const fmtDist = (km: number): string => `${km.toFixed(1)} km`;

// ─── Route-level helpers ──────────────────────────────────────────────────────

/**
 * Returns a short "first stop" label for a route card.
 * e.g.  "Orchid Vista @08:15 AM"
 */
export const firstStopLabel = (route: VehicleRoute): string => {
  const first = route.Passengers.find((p) => p.PickupSequence === 1);
  if (!first) return "—";
  // console.log(first.locality, "locality 37");
  const shortAddr =
    first.locality != null
      ? first.locality
      : first.Address.split(",")[0].trim();
  return `${shortAddr} @${fmt12(first.EstimatedPickupTime)}`;
};

export const lastStopLabel = (route: VehicleRoute): string => {
  if (!route.Passengers || route.Passengers.length === 0) return "—";
  const last = route.Passengers.reduce((max, p) =>
    p.PickupSequence > max.PickupSequence ? p : max,
  );
  const shortAddr =
    last.locality != null ? last.locality : last.Address.split(",")[0].trim();
  return `${shortAddr} @${fmt12(last.EstimatedPickupTime)}`;
};

// ─── KPI computation ─────────────────────────────────────────────────────────

export interface RouteStats {
  emp: string; // "22/22"
  routes: string; // "5/5"
  guards: number; // count with guard
  su: string; // "76.8%"
  dist: number; // total km (rounded)
  extra: number; // total detour km (rounded)
  fleet: string; // "3 5|72%"
}

export const computeStats = (routes: VehicleRoute[]): RouteStats => {
  if (routes.length === 0) {
    return {
      emp: "0/0",
      routes: "0/0",
      guards: 0,
      su: "0%",
      dist: 0,
      extra: 0,
      fleet: "0 0|0%",
    };
  }
  const totalPax = routes.reduce((s, r) => s + r.Passengers.length, 0);
  const guards = routes.filter((r) => r.IsGuardAllocated).length;
  const avgEff =
    routes.reduce((s, r) => s + r.EfficiencyPercentage, 0) / routes.length;
  const dist = Math.round(routes.reduce((s, r) => s + r.RouteDistanceKm, 0));
  const extra = Math.round(routes.reduce((s, r) => s + r.AverageDetourKm, 0));
  const totalSeats = routes.reduce(
    (s, r) => s + r.TotalSeatUsed + r.AvailablePassengerSeats,
    0,
  );
  const usedSeats = routes.reduce((s, r) => s + r.TotalSeatUsed, 0);
  const seatPct =
    totalSeats > 0 ? Math.round((usedSeats / totalSeats) * 100) : 0;

  return {
    emp: `${totalPax}/${totalPax}`,
    routes: `${routes.length}/${routes.length}`,
    guards,
    su: `${avgEff.toFixed(1)}%`,
    dist,
    extra,
    fleet: `${guards} ${routes.length}|${seatPct}%`,
  };
};

// ─── Cab-group builder ────────────────────────────────────────────────────────

/**
 * Converts VehicleRoute[] into the CabGroup[] shape used by the left sidebar.
 * colorMap: VehicleId → hex color (pre-computed in the page).
 */
export const buildCabGroups = (
  routes: VehicleRoute[],
  colorMap: Record<number, string>,
): CabGroup[] =>
  routes.map((r) => ({
    vehicleId: r.VehicleId,
    vehicleRegNo: r.vehicleRegNo,
    occupancy: r.occupancy,
    capacity: r.capacity,
    label: "SELECTED CAB",
    cabNo: String(r.VehicleId),
    color: colorMap[r.VehicleId] ?? "#3B82F6",
    passengers: [...r.Passengers].sort(
      (a, b) => a.PickupSequence - b.PickupSequence,
    ),
    isGuardAllocated: r.IsGuardAllocated,
    driverMobileNo: r.driverMobile,
    tripStatusCode: r.tripStatusCode,
  }));

// ─── Color map factory ────────────────────────────────────────────────────────

/** Build a stable VehicleId → color map from a route list. */
export const buildColorMap = (
  routes: VehicleRoute[],
): Record<number, string> => {
  const map: Record<number, string> = {};
  routes.forEach((r, idx) => {
    map[r.VehicleId] = routeColor(idx);
  });
  return map;
};
