// ─── map/routeMap.types.ts ────────────────────────────────────────────────────
// All public types for the Google Maps route-rendering layer.
// Consumed by: RouteMap.tsx, useRouteMap.ts, vehicleRouteAdapter.ts

export interface LatLng {
  lat: number;
  lng: number;
}

/** One employee pickup / drop-off stop on a route */
export interface EmployeeStop {
  id: string;
  employeeName: string;
  employeeId?: string; // ← add
  address?: string; // ← add
  estimatedPickupTime?: string; // ← add
  lat: number;
  lng: number;
  stopOrder: number;
  routeId: string;
  gender: "Male" | "Female";
  isGuarded: boolean;
  status: "PICKUP" | "DROP";
}

/** Full route data consumed by RouteMap / useRouteMap */
export interface RouteData {
  routeId: string;
  cabId: string;
  /** Hex color string — sourced from colorMap in RouteMakerPage */
  color: string;
  tripType: "LOGIN" | "LOGOUT";
  /** Ordered lat/lng points for the polyline */
  path: LatLng[];
  employees: EmployeeStop[];
  totalDistance: number; // km
  estimatedTime: number; // minutes
}

/** Props accepted by <RouteMap> */
export interface RouteMapProps {
  routes: RouteData[];
  defaultCenter?: LatLng;
  defaultZoom?: number;
  /** Called when user clicks a route polyline or marker */
  onRouteSelect?: (routeId: string) => void;
  /** Called once the map is fully initialised and routes are rendered */
  onMapReady?: () => void;
  style?: React.CSSProperties;
  /** Forwarded to the underlying <Map> as individual props (NOT options={{}}) */
  mapOptions?: google.maps.MapOptions;
  office?: { lat: number; lng: number; name: string };
}

/** Imperative handle exposed via forwardRef */
export interface RouteMapHandle {
  /** Zoom/pan to fit all rendered routes */
  fitAllRoutes: () => void;
  /** Zoom/pan to a single route and highlight it */
  focusRoute: (routeId: string) => void;
  /** Remove focus highlight, return to full view */
  clearFocus: () => void;

  focusMultipleRoutes: (routeIds: string[]) => void;
}
