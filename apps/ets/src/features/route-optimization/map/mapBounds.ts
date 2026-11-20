// src/features/route-maker/map/mapBounds.ts
//
// Fits the Google Map viewport to one or all routes.
//
// BUG FIX #6: fitBounds called before map projection ready → 100 ms debounce.
//
// Uses RouteData.employees[] for marker bounds (not the old `stops` field).

import type { RouteData } from "./routeMap.types";

let _fitTimer: ReturnType<typeof setTimeout> | null = null;

function debouncedFit(
  map: google.maps.Map,
  bounds: google.maps.LatLngBounds,
  delay = 100,
): void {
  if (_fitTimer) clearTimeout(_fitTimer);
  _fitTimer = setTimeout(() => {
    map.fitBounds(bounds, 60);
    _fitTimer = null;
  }, delay);
}

/** Fit viewport to contain ALL routes. */
export function fitMapToRoutes(
  map: google.maps.Map,
  routes: RouteData[],
): void {
  if (!map || routes.length === 0) return;

  const bounds = new google.maps.LatLngBounds();
  let hasPoints = false;

  routes.forEach((route) => {
    // Extend by polyline path points
    route.path.forEach(({ lat, lng }) => {
      bounds.extend({ lat, lng });
      hasPoints = true;
    });
    // Also extend by employee markers (in case path is empty)
    route.employees.forEach((emp) => {
      bounds.extend({ lat: emp.lat, lng: emp.lng });
      hasPoints = true;
    });
  });

  if (!hasPoints) return;
  debouncedFit(map, bounds);
}

/** Fit viewport to a SINGLE focused route. */
export function fitMapToRoute(map: google.maps.Map, route: RouteData): void {
  if (!map) return;

  const bounds = new google.maps.LatLngBounds();

  route.path.forEach(({ lat, lng }) => bounds.extend({ lat, lng }));
  route.employees.forEach((emp) =>
    bounds.extend({ lat: emp.lat, lng: emp.lng }),
  );

  debouncedFit(map, bounds, 80);
}

// src/features/route-maker/map/mapBounds.ts
//
