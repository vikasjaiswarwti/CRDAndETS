import { useRef, useState, useCallback } from "react";
import {
  buildVehicleSVG,
  buildPassengerSVG,
  buildOfficeSVG,
  buildSigninSVG,
  buildSignoutSVG,
  buildPlannedInfoContent,
  buildSigninInfoContent,
  buildSignoutInfoContent,
  buildNoShowPassengerSVG,
  buildNoShowInfoContent,
} from "../icon";
import type {
  GPSPointRight,
  Miscellaneous,
  Stops,
  TripPassenger,
  TripTrackingResponse,
} from "../types/tracking.types";
import { getTrafficStatus, TRAFFIC_CONFIG } from "../constants/trackConstant"
import { formatTime } from "../utils/commonFunction";

// ── Polyline Decoder (Supports encoded strings from backend) ─────────────────
export function decodePolyline(
  encoded: string,
): Array<{ lat: number; lng: number }> {
  if (!encoded) return [];

  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;
  const coordinates: Array<{ lat: number; lng: number }> = [];

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push({
      lat: lat / 1e5,
      lng: lng / 1e5,
    });
  }

  return coordinates;
}

// ── Timestamp helper (shared by target-time parsing and gpsTime interpolation)
// Returns epoch milliseconds, or null when the value is missing/unparseable.
// Centralized so signin/signout target times and GPS point times are always
// compared using the exact same parsing rules.
function parseTimestampMs(value: string | null | undefined): number | null {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? null : ms;
}
// ── Helper: classify congestion from duration vs duration_in_traffic ─
// type TrafficStatus = "light" | "moderate" | "heavy" | "unknown";
// ── OSRM config ─────────────────────────────────────────────────────
const OSRM_BASE_URL = import.meta.env.VITE_OSRM_BASE_URL ?? "https://maposrm.commutr.in";

// ── Fetch route from self-hosted OSRM ──────────────────────────────
export const fetchOsrmRoute = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  signal: AbortSignal,
) => {
  // OSRM expects lng,lat order — opposite of Google
  const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const url = `${OSRM_BASE_URL}/route/v1/driving/${coords}?overview=full&geometries=polyline&steps=false`;

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`OSRM HTTP error: ${res.status}`);

  const data = await res.json();
  if (data.code !== "Ok" || !data.routes?.[0]) {
    throw new Error(`OSRM: ${data.code ?? "no route found"}`);
  }
  return data.routes[0]; // { geometry, distance, duration, legs }
};
// ── Route Tracking Map Hook ─────────────────────────────────────────────────
interface UseRouteTrackingMapOptions {
  defaultLat?: number;
  defaultLng?: number;
  isReplayPlaying?: boolean;
  officePosition: { lat: number; lng: number; officeName: string };
}

interface UseRouteTrackingMapReturn {
  mapRef: React.RefObject<HTMLDivElement | null>;
  isLoaded: boolean;
  initMap: any;
  // fitToRoutes: () => void;
  drawEmployeepoints: (
    waypoints: TripPassenger[],
    showSignin?: boolean,
    showSignout?: boolean,
    isLive?: boolean,
    showNoShow?: boolean,
    selectedEmployee?: number,
    isCompleted?: boolean,
  ) => void;
  toggleSigninMarkers: (show: boolean) => void;
  toggleSignoutMarkers: (show: boolean) => void; // ← add
  toggleNoShowMarkers: (show: boolean) => void;
  drawPolylines: (
    trip: TripTrackingResponse,
    showActual?: boolean,
    showPlanned?: boolean,
  ) => void;
  clearMapElements: () => void;
  clearWaypoints: () => void;
  // -------
  setVehicleCoords: (
    coords: GPSPointRight[],
    onProgress?: (pct: number) => void,
    onSpeedUpdate?: (speed: number) => void,
    isReplayPlaying?: boolean,
    onGpsLoss?: (isLost: boolean) => void,
  ) => void;
  startAnimation: (
    speed: number,
    onGpsLoss?: (isLost: boolean) => void,
  ) => void;
  pauseAnimation: () => void;
  setAnimationSpeed: (speed: number) => void;
  seekTo?: (pct: number) => void;
  // ------------- live tracking Update
  updateLiveMarker: (
    lat: number,
    lng: number,
    passengers: TripPassenger[],
    stops: Stops[],
    isShuttleTrip: boolean,
    officePosition: { lat: number; lng: number; officeName: string },
    heading?: number,
    tripType?: number,
  ) => void;
  drawOfficeMarker: () => void;
  clearNextPickupPolyline: () => void; // ← new
  drawStopPoints: (stops: Stops[]) => void;
}
// load the map
const loadGoogleMaps = () => {
  // Reuse your existing loader from useGoogleMap
  return new Promise<void>((resolve, reject) => {
    if (window.google?.maps) return resolve();

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    window.initGoogleMaps = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export function useRouteTrackingMap({
  isReplayPlaying = false,
  officePosition,
}: UseRouteTrackingMapOptions): UseRouteTrackingMapReturn {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const actualPolylineRef = useRef<google.maps.Polyline | null>(null);
  const plannedPolylineRef = useRef<google.maps.Polyline | null>(null);
  const vehicleMarkerRef = useRef<google.maps.Marker | null>(null);
  const pickupMarkersRef = useRef<google.maps.Marker[]>([]);
  const officeMarkerRef = useRef<google.maps.Marker | null>(null);
  // employee marker
  const waypointMarkersRef = useRef<google.maps.Marker[]>([]);
  const waypointInfoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const stopMarkersRef = useRef<google.maps.Marker[]>([]);
  // ------- passenger signin and sign out
  const signinMarkersRef = useRef<Map<number, google.maps.Marker>>(new Map());
  const signoutMarkersRef = useRef<Map<number, google.maps.Marker>>(new Map());
  const noShowMarkersRef = useRef<google.maps.Marker[]>([]);
  // ── Trip-time sync state for signin/signout reveal ─────────────────────
  // empId -> epoch ms at which that passenger's marker should become visible.
  const signinTargetTimeRef = useRef<Map<number, number>>(new Map());
  const signoutTargetTimeRef = useRef<Map<number, number>>(new Map());
  // When true, bypass time-sync and force show/hide all markers of that type
  // (driven by the manual toggle props / ActionsPanel).
  const forceShowSigninRef = useRef(false);
  const forceShowSignoutRef = useRef(false);
  // ------------------------------------------------
  // ── Vehicle animation state refs ────────────────────────────────────────────
  const animFrameRef = useRef<number | null>(null);
  const coordsRef = useRef<GPSPointRight[]>([]);
  const segmentIndexRef = useRef(0);
  const segmentTRef = useRef(0);
  const isPlayingRef = useRef(false);
  const speedRef = useRef(1);
  const onProgressRef = useRef<((pct: number) => void) | null>(null);
  const onVehicleSpeedUpdateRef = useRef<((speed: number) => void) | null>(
    null,
  );
  // ── Add with other refs ───────────────────────────────────────────
  const traveledPolylinesRef = useRef<google.maps.Polyline[]>([]);
  const lastDrawnSegmentRef = useRef<number>(-1); // tracks last painted segment
  // 06 june 2026
  const nextPickupPolylineRef = useRef<google.maps.Polyline | null>(null);
  // ── Directions API ──────────────────────────────────────────────
  // const directionsServiceRef = useRef<google.maps.DirectionsService | null>(
  //   null,
  // );
  const pendingDirectionsRequestRef = useRef<AbortController | null>(null);
  const lastRouteFetchRef = useRef<number>(0);
  const ROUTE_FETCH_MIN_INTERVAL_MS = 4000; // don't re-fetch more than once per 4s
  // ── Add with other refs ───────────────────────────────────────────
  // const selectedEventsRef = useRef<string[]>([]);
  // -------------------------
  // ── Add constants ─────────────────────────────────────────────────────────────
  // const OVERSPEED_KMH = 80;
  // const STOPPED_KMH = 2;
  // const TOTAL_DURATION_MS = 120_000;
  const onGpsLossRef = useRef<((isLost: boolean) => void) | null>(null);

  // ── Simulated trip-clock time at a given (segmentIndex, segmentT) ──────────
  // Interpolates between the gpsTime of the two GPS points bounding the
  // current animation segment. Returns null when either timestamp is
  // missing/unparseable so callers can safely fall back to "unknown time"
  // (which resolves to "not yet visible" for time-gated markers).
  const getSimulatedTimeAt = useCallback(
    (segmentIndex: number, segmentT: number): number | null => {
      const coords = coordsRef.current;
      const from = coords[segmentIndex];
      const to = coords[segmentIndex + 1];
      if (!from || !to) return null;

      const fromMs = parseTimestampMs(from.gpsTime);
      const toMs = parseTimestampMs(to.gpsTime);
      if (fromMs == null || toMs == null) return null;

      // Guard against zero/negative gaps (duplicate or out-of-order gpsTime).
      if (toMs <= fromMs) return fromMs;

      return fromMs + (toMs - fromMs) * segmentT;
    },
    [],
  );

  // ── Apply signin/signout marker visibility for a given simulated time ──────
  // Single source of truth for visibility: called from animation ticks,
  // seekTo, marker (re)creation, and the manual toggle handlers, so all entry
  // points stay consistent.
  const applySigninSignoutVisibility = useCallback(
    (simulatedTimeMs: number | null) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      signinMarkersRef.current.forEach((marker, empId) => {
        const targetTime = signinTargetTimeRef.current.get(empId);
        const shouldShow =
          forceShowSigninRef.current ||
          (targetTime != null &&
            simulatedTimeMs != null &&
            simulatedTimeMs >= targetTime);
        marker.setMap(shouldShow ? map : null);
      });

      signoutMarkersRef.current.forEach((marker, empId) => {
        const targetTime = signoutTargetTimeRef.current.get(empId);
        const shouldShow =
          forceShowSignoutRef.current ||
          (targetTime != null &&
            simulatedTimeMs != null &&
            simulatedTimeMs >= targetTime);
        marker.setMap(shouldShow ? map : null);
      });
    },
    [],
  );

  // ------------------------------------------------
  // Step 1 - Map Initialize
  const initMap = useCallback(async () => {
    if (!mapRef.current) return;

    await loadGoogleMaps();
    injectInfoWindowStyleFix()

    const map = new google.maps.Map(mapRef.current, {
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      disableDefaultUI: true,
      zoomControl: false,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM,
      },
      fullscreenControlOptions: {
        position: google.maps.ControlPosition.BOTTOM_LEFT,
      },
    });

    mapInstanceRef.current = map;

    // Auto-resize fix
    setTimeout(() => {
      google.maps.event.trigger(map, "resize");
    }, 300);

    setIsLoaded(true);
    return map;
  }, []);

  // Step 2 - Draw A polyline
  const drawPolylines = useCallback(
    (
      trip: TripTrackingResponse,
      showActual: boolean = true,
      showPlanned: boolean = true,
    ) => {
      if (!mapInstanceRef.current) return;
      const map = mapInstanceRef.current;

      // Clear existing polylines only (not all markers)
      actualPolylineRef.current?.setMap(null);
      plannedPolylineRef.current?.setMap(null);

      const bounds = new google.maps.LatLngBounds();
      let hasPoints = false;

      // ── Actual Route (solid blue) ──────────────────────────
      if (showActual && trip.actualRoutePolyline) {
        const actualCoords = decodePolyline(trip.actualRoutePolyline);
        // console.log(actualCoords, "actualCoords")
        if (actualCoords.length > 1) {
          actualPolylineRef.current = new google.maps.Polyline({
            path: actualCoords,
            strokeColor: "#2563eb",
            strokeWeight: 2,
            strokeOpacity: 0.95,
            map,
          });
          actualCoords.forEach((c) => bounds.extend(c));
          hasPoints = true;
        }
      }
      // ── Planned Route (dashed pink) ────────────────────────
      if (showPlanned && trip.plannedRoutePolyline) {
        const plannedCoords = decodePolyline(trip.plannedRoutePolyline);
        // console.log(plannedCoords, "planned")
        if (plannedCoords.length > 1) {
          plannedPolylineRef.current = new google.maps.Polyline({
            path: plannedCoords,
            strokeColor: "#ec4899",
            strokeWeight: 2,
            map,
          });

          plannedCoords.forEach((c) => bounds.extend(c));
          hasPoints = true;
        }
      }

      // ── Fit map to polyline bounds ─────────────────────────
      if (hasPoints) {
        map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
      }
    },
    [], // no deps needed — reads mapInstanceRef directly
  );
  const drawEmployeepoints = useCallback(
    (
      waypoints: TripPassenger[],
      showSignin: boolean = false,
      showSignout: boolean = false,
      isLive?: boolean,
      showNoShow: boolean = false,
      selectedEmployee: number | null = null,
      isCompleted?: boolean,
      // transTripStatusCode?: number
    ) => {
      if (!mapInstanceRef.current) return;
      const map = mapInstanceRef.current;

      // Clear previous markers
      waypointMarkersRef.current.forEach((m) => m.setMap(null));
      waypointMarkersRef.current = [];
      signinMarkersRef.current.forEach((m) => m.setMap(null));
      signinMarkersRef.current.clear();
      signoutMarkersRef.current.forEach((m) => m.setMap(null));
      signoutMarkersRef.current.clear();
      noShowMarkersRef.current.forEach((m) => m.setMap(null));
      noShowMarkersRef.current = [];
      signinTargetTimeRef.current.clear();
      signoutTargetTimeRef.current.clear();

      // showSignin / showSignout now double as the manual "force show all"
      // override — when true, time-sync is bypassed entirely.
      forceShowSigninRef.current = showSignin;
      forceShowSignoutRef.current = showSignout;

      // Shared InfoWindow
      if (!waypointInfoWindowRef.current) {
        waypointInfoWindowRef.current = new google.maps.InfoWindow();
      }
      const infoWindow = waypointInfoWindowRef.current;

      const HIGHLIGHT_SCALE = 1.3;
      const HIGHLIGHT_Z_BOOST = 100000;

      let selectedBounds: google.maps.LatLngBounds | null = null;

      waypoints.forEach((wp) => {
        const isSelected =
          selectedEmployee != null && wp.empId === selectedEmployee;

        if (!selectedBounds) selectedBounds = new google.maps.LatLngBounds();

        // ── 1. Planned marker ──────────────────────────────────────────────
        const markerIcon =
          // isLive && wp.empSigninTime
          //   ? buildSigninSVG(wp.paxOrder, isSelected)
          //   : isLive && wp.noShow
          //     ? buildNoShowPassengerSVG(wp.paxOrder, isSelected)
          //     :
          buildPassengerSVG(wp.paxOrder);

        const plannedBaseSize = 36;
        const plannedSize = plannedBaseSize;

        const plannedMarker = new google.maps.Marker({
          position: { lat: wp.plannedLat, lng: wp.plannedLng },
          map,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markerIcon)}`,
            scaledSize: new google.maps.Size(plannedSize, plannedSize),
            anchor: new google.maps.Point(plannedSize / 2, plannedSize),
          },
          title: `${wp.firstname} (${wp.address})`,
          zIndex: wp.paxOrder,
        });

        plannedMarker.addListener("click", () => {
          infoWindow.setContent(buildPlannedInfoContent(wp));
          infoWindow.open(map, plannedMarker);
          google.maps.event.addListenerOnce(infoWindow, "domready", () => {
            const closeBtn = document.querySelector("[data-info-close]");
            closeBtn?.addEventListener("click", () => infoWindow.close());
          });
        });
        if (
          wp.empSigninLat != null &&
          wp.empSigninLng != null &&
          (isLive || isCompleted)
        ) {
          const signinBaseWidth = 36;
          const signinBaseHeight = 42;
          const signinWidth = isSelected ? signinBaseWidth * HIGHLIGHT_SCALE : signinBaseWidth;
          const signinHeight = isSelected ? signinBaseHeight * HIGHLIGHT_SCALE : signinBaseHeight;

          const signinMarker = new google.maps.Marker({
            position: { lat: wp.empSigninLat, lng: wp.empSigninLng },
            map: showSignin ? map : null, // visibility resolved by applySigninSignoutVisibility()
            icon: {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(buildSigninSVG(wp.paxOrder, isSelected))}`,
              scaledSize: new google.maps.Size(signinWidth, signinHeight),
              anchor: new google.maps.Point(signinWidth / 2, signinHeight),
            },
            title: `${wp.firstname} — Sign In`,
            zIndex: isSelected ? wp.paxOrder + 1100 + HIGHLIGHT_Z_BOOST : wp.paxOrder + 1100,
          });

          signinMarker.addListener("click", () => {
            infoWindow.setContent(buildSigninInfoContent(wp));
            infoWindow.open(map, signinMarker);
            google.maps.event.addListenerOnce(infoWindow, "domready", () => {
              const closeBtn = document.querySelector("[data-info-close]");
              closeBtn?.addEventListener("click", () => infoWindow.close());
            });
          });

          signinMarkersRef.current.set(wp.empId, signinMarker);

          const signinTargetMs = parseTimestampMs(wp.empSigninTime);
          if (signinTargetMs != null) {
            signinTargetTimeRef.current.set(wp.empId, signinTargetMs);
          }

          if (isSelected) {
            selectedBounds!.extend(signinMarker.getPosition()!);
          }
        }

        // ── No-show marker ───────────────────────────────────────────────────
        if (wp.noShow) {
          const noShowBaseWidth = 36;
          const noShowBaseHeight = 42;
          const noShowWidth = isSelected ? noShowBaseWidth * HIGHLIGHT_SCALE : noShowBaseWidth;
          const noShowHeight = isSelected ? noShowBaseHeight * HIGHLIGHT_SCALE : noShowBaseHeight;

          const noShowMarker = new google.maps.Marker({
            position: { lat: wp.plannedLat, lng: wp.plannedLng },
            map: showNoShow ? map : null,
            icon: {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(buildNoShowPassengerSVG(wp.paxOrder, isSelected))}`,
              scaledSize: new google.maps.Size(noShowWidth, noShowHeight),
              anchor: new google.maps.Point(noShowWidth / 2, noShowHeight),
            },
            title: `${wp.firstname} — No Show`,
            zIndex: isSelected ? wp.paxOrder + 1001 + HIGHLIGHT_Z_BOOST : wp.paxOrder + 1001,
          });

          noShowMarker.addListener("click", () => {
            infoWindow.setContent(buildNoShowInfoContent(wp));
            infoWindow.open(map, noShowMarker);
            google.maps.event.addListenerOnce(infoWindow, "domready", () => {
              const closeBtn = document.querySelector("[data-info-close]");
              closeBtn?.addEventListener("click", () => infoWindow.close());
            });
          });

          noShowMarkersRef.current.push(noShowMarker);

          if (isSelected) {
            selectedBounds!.extend(noShowMarker.getPosition()!);
          }
        }

        // ── 3. Sign-out marker ───────────────────────────────────────────────
        if (
          wp.empSignOutLat != null &&
          wp.empSignOutLng != null &&
          (isLive || isCompleted)
        ) {
          const signoutBaseWidth = 36;
          const signoutBaseHeight = 42;
          const signoutWidth = isSelected ? signoutBaseWidth * HIGHLIGHT_SCALE : signoutBaseWidth;
          const signoutHeight = isSelected ? signoutBaseHeight * HIGHLIGHT_SCALE : signoutBaseHeight;

          const signoutMarker = new google.maps.Marker({
            position: { lat: wp.empSignOutLat, lng: wp.empSignOutLng },
            map: null, // visibility resolved by applySigninSignoutVisibility()
            icon: {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(buildSignoutSVG(wp.paxOrder, isSelected))}`,
              scaledSize: new google.maps.Size(signoutWidth, signoutHeight),
              anchor: new google.maps.Point(signoutWidth / 2, signoutHeight),
            },
            title: `${wp.firstname} — Sign Out`,
            zIndex: isSelected ? wp.paxOrder + 2000 + HIGHLIGHT_Z_BOOST : wp.paxOrder + 2000,
          });

          signoutMarker.addListener("click", () => {
            infoWindow.setContent(buildSignoutInfoContent(wp));
            infoWindow.open(map, signoutMarker);
            google.maps.event.addListenerOnce(infoWindow, "domready", () => {
              const closeBtn = document.querySelector("[data-info-close]");
              closeBtn?.addEventListener("click", () => infoWindow.close());
            });
          });

          signoutMarkersRef.current.set(wp.empId, signoutMarker);

          const signoutTargetMs = parseTimestampMs(wp.empSignOutTime);
          if (signoutTargetMs != null) {
            signoutTargetTimeRef.current.set(wp.empId, signoutTargetMs);
          }

          if (isSelected) {
            selectedBounds!.extend(signoutMarker.getPosition()!);
          }
        }
      });

      // Resolve initial visibility against wherever the animation currently
      // sits (0 / unstarted on first draw, or the current scrub position if
      // markers are being redrawn mid-replay).
      const simulatedTimeMs = getSimulatedTimeAt(
        segmentIndexRef.current,
        segmentTRef.current,
      );
      applySigninSignoutVisibility(simulatedTimeMs);
    },
    [getSimulatedTimeAt, applySigninSignoutVisibility],
  );
  const drawStopPoints = useCallback((stops: Stops[]) => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    stopMarkersRef.current.forEach((marker) => marker.setMap(null));
    stopMarkersRef.current = [];

    if (!waypointInfoWindowRef.current) {
      waypointInfoWindowRef.current = new google.maps.InfoWindow();
      map.addListener("click", () => {
        waypointInfoWindowRef.current?.close();
      });
      waypointInfoWindowRef.current.addListener("closeclick", () => {
        // optional: reset any "selected stop" UI state here
      });
    }
    const infoWindow = waypointInfoWindowRef.current;
    const escapeHtml = (value: string | number | null | undefined) =>
      String(value ?? "-")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");

    // Reached stops render as a solid dark-green dot, unreached stops as a
    // lighter green so the trip's progress is readable straight off the map.
    const REACHED_COLOR = "#166534";
    const NEXT_COLOR = "#2563EB";
    const UNREACHED_COLOR = "#94A3B8";

    const getPassengerBadge = (status: string | null, reached: boolean) => {
      const s = (status || "").toLowerCase();
      if (reached || s.includes("board")) return { bg: "#dcfce7", text: "#166534" };
      if (s.includes("no show") || s.includes("no-show")) return { bg: "#fee2e2", text: "#b91c1c" };
      return { bg: "#f1f5f9", text: "#64748b" };
    };

    stops.forEach((stop) => {
      if (!Number.isFinite(stop.stopLat) || !Number.isFinite(stop.stopLng)) return;

      const markerColor = stop.reached ? REACHED_COLOR : stop.stopStatus == "Current" ? NEXT_COLOR : UNREACHED_COLOR;

      const marker = new google.maps.Marker({
        map,
        position: { lat: stop.stopLat, lng: stop.stopLng },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: markerColor,
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 12,
        },
        label: {
          color: "#ffffff",
          fontSize: "12px",
          fontWeight: "700",
          text: String(stop.stopOrder),
        },
        title: stop.stopAddress || `Stop ${stop.stopOrder}`,
        zIndex: 500 + stop.stopOrder,
      });

      marker.addListener("click", () => {
        const employeeRows = stop.passengers?.length
          ? stop.passengers
            .map((passenger) => {
              const badge = getPassengerBadge(passenger.status, passenger.reached);
              return `
              <div style="border-top:1px solid #e5e7eb;padding:8px 0;display:flex;justify-content:space-between;gap:8px">
                <div>
                  <div style="font-weight:600;color:#0f172a">${escapeHtml(passenger.passengerName)}</div>
                  <div style="color:#64748b;font-size:12px">Planned: ${formatTime(passenger.pSchTime)}</div>
                </div>
                <div style="flex-shrink:0">
                  <span style="background:${badge.bg};color:${badge.text};font-size:11px;font-weight:600;padding:2px 8px;border-radius:6px;white-space:nowrap">${escapeHtml(passenger.status)}</span>
                </div>
              </div>`;
            })
            .join("")
          : '<div style="color:#64748b;padding-top:8px;font-size:12px">No employees assigned to this stop.</div>';

        const statusBadge = stop.reached
          ? `<span style="background:#dcfce7;color:#166534;font-size:11px;font-weight:600;padding:2px 8px;border-radius:6px">Reached</span>`
          : stop.stopStatus === "Current"
            ? `<span style="background:#dbeafe;color:#1d4ed8;font-size:11px;font-weight:600;padding:2px 8px;border-radius:6px">Next stop</span>`
            : `<span style="background:#f1f5f9;color:#64748b;font-size:11px;font-weight:600;padding:2px 8px;border-radius:6px">Upcoming</span>`;

        const timeLine = stop.reached
          ? `Sch ${escapeHtml(stop.schArrivalTime)} &middot; Arrived ${escapeHtml(stop.actArrivalTime)}`
          : `Sch ${escapeHtml(stop.schArrivalTime)}`;

        const countsLine = stop.reached || stop.stopStatus === "Next"
          ? `<div style="font-size:12px;color:#334155;margin-top:4px">
             <span style="color:#166534;font-weight:600">${escapeHtml(stop.boardedCount)} boarded</span>
             &middot; ${escapeHtml(stop.deboardedCount)} deboarded
             ${stop.noShowCount ? `&middot; <span style="color:#b91c1c;font-weight:600">${escapeHtml(stop.noShowCount)} no-show</span>` : ""}
           </div>`
          : "";

        infoWindow.setContent(`
        <div style="font-family:Arial,sans-serif;max-width:280px;padding:4px">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px">
            <div style="font-size:14px;font-weight:700;color:#0f172a">Stop ${escapeHtml(stop.stopOrder)}</div>
            <div style="display:flex;align-items:center;gap:6px">
              ${statusBadge}
              <button id="stop-iw-close-btn" type="button" aria-label="Close" style="border:none;background:transparent;cursor:pointer;font-size:16px;line-height:1;color:#64748b;padding:0 2px">&times;</button>
            </div>
          </div>
          <div style="color:#334155;font-size:12px;margin-bottom:4px">${escapeHtml(stop.stopAddress)}</div>
          <div style="color:#64748b;font-size:12px">${timeLine}</div>
          ${countsLine}
          <div style="font-size:12px;font-weight:600;margin:10px 0 2px;color:#0f172a">Employees (${stop.passengers?.length ?? stop.totalPassengers ?? 0})</div>
          ${employeeRows}
        </div>`);
        infoWindow.open(map, marker);

        // Native X can be unreliable if app CSS/listeners interfere with
        // .gm-ui-hover-effect, so wire a custom close button as a fallback.
        google.maps.event.addListenerOnce(infoWindow, "domready", () => {
          document.getElementById("stop-iw-close-btn")?.addEventListener("click", (e) => {
            e.stopPropagation();
            infoWindow.close();
          });
        });
      });
      stopMarkersRef.current.push(marker);
    });
  }, []);
  const drawOfficeMarker = useCallback(() => {
    if (!mapInstanceRef.current || !officePosition) return;
    const map = mapInstanceRef.current;

    // Clear previous office marker
    officeMarkerRef.current?.setMap(null);

    officeMarkerRef.current = new google.maps.Marker({
      position: { lat: officePosition.lat, lng: officePosition.lng },
      map,
      icon: {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
          buildOfficeSVG(),
        )}`,
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(20, 40),
      },
      title: "Office",
      zIndex: 10,
    });

    // InfoWindow on click
    if (!waypointInfoWindowRef.current) {
      waypointInfoWindowRef.current = new google.maps.InfoWindow();
    }
    const infoWindow = waypointInfoWindowRef.current;

    officeMarkerRef.current.addListener("click", () => {
      infoWindow.setContent(`
            <div style="padding:8px;font-family:sans-serif;min-width:140px">
                <div style="font-weight:600;font-size:14px;margin-bottom:4px">
                    🏢 ${officePosition.officeName}
                </div>
            </div>
        `);
      infoWindow.open(map, officeMarkerRef.current);
    });
  }, [officePosition]);
  // ── Manual override toggles — force show/hide, bypassing time-sync ───────
  const toggleSigninMarkers = useCallback((show: boolean) => {
    const map = mapInstanceRef.current ?? null;
    signinMarkersRef.current.forEach((m) => m.setMap(show ? map : null));
  }, []);

  const toggleSignoutMarkers = useCallback((show: boolean) => {
    const map = mapInstanceRef.current ?? null;
    signoutMarkersRef.current.forEach((m) => m.setMap(show ? map : null));
  }, []);
  const toggleNoShowMarkers = useCallback((show: boolean) => {
    const map = mapInstanceRef.current ?? null;
    noShowMarkersRef.current.forEach((m) => m.setMap(show ? map : null));
  }, []);
  // Clear Map
  const clearMapElements = useCallback(() => {
    actualPolylineRef.current?.setMap(null);
    plannedPolylineRef.current?.setMap(null);
    vehicleMarkerRef.current?.setMap(null);
    pickupMarkersRef.current.forEach((m) => m.setMap(null));
    officeMarkerRef.current?.setMap(null);

    pickupMarkersRef.current = [];
    // employee
    waypointMarkersRef.current.forEach((m) => m.setMap(null)); // ← add
    waypointInfoWindowRef.current?.close(); // ← add
    waypointMarkersRef.current = [];
    // signin / signout / no-show
    signinMarkersRef.current.forEach((m) => m.setMap(null));
    signinMarkersRef.current.clear();
    signoutMarkersRef.current.forEach((m) => m.setMap(null));
    signoutMarkersRef.current.clear();
    noShowMarkersRef.current.forEach((m) => m.setMap(null));
    noShowMarkersRef.current = [];
    signinTargetTimeRef.current.clear();
    signoutTargetTimeRef.current.clear();
  }, []);
  // ── Add clearWaypoints (call inside clearMapElements too) ──
  const clearWaypoints = useCallback(() => {
    waypointMarkersRef.current.forEach((m) => m.setMap(null));
    waypointMarkersRef.current = [];
    waypointInfoWindowRef.current?.close();
  }, []);
  // ------------------------------ live tracking marker
  const getNextUnboardedPassenger = (
    passengers: TripPassenger[],
  ): TripPassenger | undefined => {
    return [...passengers]
      .sort((a, b) => a.paxOrder - b.paxOrder)
      .find((p) => p.empSigninTime === null && !p.noShow);
  };
  const getNextUndroppedPassenger = (
    passengers: TripPassenger[],
  ): TripPassenger | undefined => {
    return [...passengers]
      .sort((a, b) => a.paxOrder - b.paxOrder)
      .find((p) => p.empSignOutTime === null && !p.noShow);
  };

  const updateLiveMarker = useCallback(
    (
      lat: number,
      lng: number,
      passengers: TripPassenger[],
      stops: Stops[],
      isShuttleTrip: boolean,
      officePosition: { lat: number; lng: number; officeName: string },
      bearing: number = 0,
      tripType: number = 1,
    ) => {
      if (!mapInstanceRef.current) return;

      const map = mapInstanceRef.current;

      const icon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
          buildVehicleSVG(bearing),
        )}`,
        scaledSize: new google.maps.Size(24, 34),
        anchor: new google.maps.Point(12, 17),
      };

      // Create / Update Vehicle Marker
      if (!vehicleMarkerRef.current) {
        vehicleMarkerRef.current = new google.maps.Marker({
          position: { lat, lng },
          map,
          icon,
          zIndex: 100,
        });
      } else {
        vehicleMarkerRef.current.setMap(map);
        vehicleMarkerRef.current.setPosition({ lat, lng });
        vehicleMarkerRef.current.setIcon(icon);
      }

      let pickupLat: number | null = null;
      let pickupLng: number | null = null;

      if (isShuttleTrip) {
        const nextStop = [...stops]
          .sort((a, b) => a.stopOrder - b.stopOrder)
          .find((stop) => stop.reached == false);

        if (nextStop) {
          pickupLat = nextStop.stopLat;
          pickupLng = nextStop.stopLng;
        }
      } else {
        // =====================================================
        // Find Next Passenger To Pick Up
        // =====================================================
        const nextPassenger = getNextUnboardedPassenger(passengers);

        if (tripType === 1) {
          if (nextPassenger) {
            pickupLat = nextPassenger.plannedLat;
            pickupLng = nextPassenger.plannedLng;
          } else if (officePosition) {
            pickupLat = officePosition.lat;
            pickupLng = officePosition.lng;
          }
        } else if (tripType === 2) {
          if (nextPassenger) {
            if (officePosition) {
              pickupLat = officePosition.lat;
              pickupLng = officePosition.lng;
            }
          } else {
            // Everyone boarded — now route passenger-wise for drop-off.
            const nextDropPassenger = getNextUndroppedPassenger(passengers);

            if (nextDropPassenger) {
              pickupLat = nextDropPassenger.plannedLat;
              pickupLng = nextDropPassenger.plannedLng;
            }
            // If no one is left to drop, pickupLat/pickupLng stay null.
          }
        }

      }

      if (pickupLat === null || pickupLng === null) {
        if (nextPickupPolylineRef.current) {
          nextPickupPolylineRef.current.setMap(null);
          nextPickupPolylineRef.current = null;
        }

        map.panTo({ lat, lng });
        return;
      }

      // ── Throttle: skip re-routing if we fetched very recently ──────
      const now = Date.now();
      const shouldFetchRoute =
        now - lastRouteFetchRef.current >= ROUTE_FETCH_MIN_INTERVAL_MS;

      if (shouldFetchRoute) {
        lastRouteFetchRef.current = now;

        if (pendingDirectionsRequestRef.current) {
          pendingDirectionsRequestRef.current.abort();
        }

        const controller = new AbortController();
        pendingDirectionsRequestRef.current = controller;
        fetchOsrmRoute(
          { lat, lng },
          { lat: pickupLat, lng: pickupLng },
          controller.signal,
        )
          .then((route) => {
            if (controller.signal.aborted) return;
            const color = "#3b82f6";

            const polylinePoints = decodePolyline(route.geometry);

            if (!nextPickupPolylineRef.current) {
              nextPickupPolylineRef.current = new google.maps.Polyline({
                path: polylinePoints,
                strokeColor: color,
                strokeWeight: 3,
                strokeOpacity: 0.8,
                geodesic: true,
                map,
                zIndex: 5,
              });
            } else {
              nextPickupPolylineRef.current.setMap(map);
              nextPickupPolylineRef.current.setPath(polylinePoints);
              nextPickupPolylineRef.current.setOptions({ strokeColor: color });
            }
          })
          .catch((err) => {
            if (controller.signal.aborted) return;
            console.warn("OSRM routing error:", err);
            const fallbackPath = [
              { lat, lng },
              { lat: pickupLat, lng: pickupLng },
            ];

            if (!nextPickupPolylineRef.current) {
              nextPickupPolylineRef.current = new google.maps.Polyline({
                path: fallbackPath,
                strokeColor: "#3b82f6",
                strokeWeight: 2,
                strokeOpacity: 0.5,
                icons: [
                  {
                    icon: {
                      path: "M 0,0 1,0",
                      strokeOpacity: 1,
                      strokeColor: "#3b82f6",
                      scale: 3,
                    },
                    offset: "0",
                    repeat: "10px",
                  },
                ],
                geodesic: true,
                map,
                zIndex: 5,
              });
            } else {
              nextPickupPolylineRef.current.setMap(map);
              nextPickupPolylineRef.current.setPath(fallbackPath);
            }
          });
      }
      map.panTo({ lat, lng });
    },
    [],
  );
  const clearNextPickupPolyline = useCallback(() => {
    if (nextPickupPolylineRef.current) {
      nextPickupPolylineRef.current.setMap(null);
      nextPickupPolylineRef.current = null;
    }
  }, []);
  // ------------------------------- end live tracking marker
  const setVehicleCoords = useCallback(
    (
      coords: GPSPointRight[],
      onProgress?: (pct: number) => void,
      onSpeedUpdate?: (speed: number) => void,
      isReplayPlaying?: boolean,
      onGpsLoss?: (isLost: boolean) => void,
    ) => {
      coordsRef.current = coords;
      segmentIndexRef.current = 0;
      segmentTRef.current = 0;
      onProgressRef.current = onProgress ?? null;
      onVehicleSpeedUpdateRef.current = onSpeedUpdate ?? null;

      // ── Reset traveled overlay ────────────────────────────────────
      traveledPolylinesRef.current.forEach((p) => p.setMap(null));
      traveledPolylinesRef.current = [];
      lastDrawnSegmentRef.current = -1;
      // ─────────────────────────────────────────────────────────────
      onGpsLossRef.current = onGpsLoss ?? null;
      if (!mapInstanceRef.current || coords.length === 0) return;
      const map = isReplayPlaying ? mapInstanceRef.current : null;
      vehicleMarkerRef.current?.setMap(null);
      vehicleMarkerRef.current = new google.maps.Marker({
        position: { lat: coords[0].latitude, lng: coords[0].longitude },
        map,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(buildVehicleSVG(0))}`,
          scaledSize: new google.maps.Size(24, 34),
          anchor: new google.maps.Point(18, 18),
        },
        zIndex: 100,
      });

      // Reset signin/signout reveal state to match the restarted position
      // (segment 0 / t 0) so a re-loaded trip doesn't retain stale markers
      // from a previous coord set.
      const startSimulatedTimeMs = getSimulatedTimeAt(0, 0);
      applySigninSignoutVisibility(startSimulatedTimeMs);
    },
    [isReplayPlaying, getSimulatedTimeAt, applySigninSignoutVisibility],
  );
  // Updated startAnimation function - polylines color based on speed directly, not event selection
  const startAnimation = useCallback(
    (speed: number = 1, onGpsLoss?: (isLost: boolean) => void) => {
      if (onGpsLoss) onGpsLossRef.current = onGpsLoss;
      let lastGpsLoss: boolean | null = null; // ← track previous state

      speedRef.current = speed;
      isPlayingRef.current = true;

      const coords = coordsRef.current;
      if (!mapInstanceRef.current || coords.length < 2) return;
      const marker = vehicleMarkerRef.current;
      if (!marker) return;

      const TOTAL_DURATION_MS = 120_000;
      const totalSegments = coords.length - 1;
      let lastTime: number | null = null;
      let lastProgressUpdate = 0;

      const tick = (now: number) => {
        if (!isPlayingRef.current) return;

        const dt = lastTime == null ? 16 : now - lastTime;
        lastTime = now;

        const advanceSegments =
          (dt * speedRef.current * totalSegments) / TOTAL_DURATION_MS;
        let remaining = advanceSegments;

        while (remaining > 0) {
          const si = segmentIndexRef.current;
          if (si >= totalSegments) {
            isPlayingRef.current = false;
            onProgressRef.current?.(100);
            return;
          }
          const leftInSegment = 1 - segmentTRef.current;
          if (remaining < leftInSegment) {
            segmentTRef.current += remaining;
            remaining = 0;
          } else {
            remaining -= leftInSegment;
            segmentIndexRef.current++;
            segmentTRef.current = 0;
          }
        }

        const si = segmentIndexRef.current;
        if (si >= totalSegments) {
          isPlayingRef.current = false;
          onProgressRef.current?.(100);
          return;
        }

        const t = segmentTRef.current;
        const from = coords[si];
        const to = coords[si + 1];

        const lat = from.latitude + (to.latitude - from.latitude) * t;
        const lng = from.longitude + (to.longitude - from.longitude) * t;

        const dLat = to.latitude - from.latitude;
        const dLng = to.longitude - from.longitude;
        const computedHeading = (Math.atan2(dLng, dLat) * 180) / Math.PI;
        const fromMiscellaneous: Miscellaneous =
          typeof from.miscellaneous === "string"
            ? JSON.parse(from.miscellaneous)
            : (from.miscellaneous ?? {
              speed: 0,
              gpsLoss: false,
              networkLoss: false,
            });

        const heading = fromMiscellaneous.bearing ?? computedHeading;
        marker.setPosition({ lat, lng });
        marker.setIcon({
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(buildVehicleSVG(heading))}`,
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(18, 18),
        });

        // ── Paint every NEW fully-completed segment ───────────────────
        const map = mapInstanceRef.current!;
        for (let i = lastDrawnSegmentRef.current + 1; i < si; i++) {
          // console.log(coords[i]);
          const rawMisc = coords[i]?.miscellaneous;
          const miscellaneous: Miscellaneous =
            typeof rawMisc === "string"
              ? JSON.parse(rawMisc)
              : (rawMisc ?? {
                speed: 0,
                gpsLoss: false,
                networkLoss: false,
              });
          const isLost = miscellaneous.gpsLoss === true;
          if (isLost !== lastGpsLoss) {
            // ← only fire on change
            lastGpsLoss = isLost;
            onGpsLossRef.current?.(isLost);
          }

          const status = getTrafficStatus(miscellaneous.speed);
          const config = TRAFFIC_CONFIG[status];

          const poly = new google.maps.Polyline({
            path: [
              { lat: coords[i].latitude, lng: coords[i].longitude },
              { lat: coords[i + 1].latitude, lng: coords[i + 1].longitude },
            ],
            strokeColor: config.color,
            strokeWeight: config.strokeWeight,
            strokeOpacity: 1,
            zIndex: config.color === "#22c55e" ? 6 : 12,
            map,
          });
          const infoWindow = new google.maps.InfoWindow();

          poly.addListener("mouseover", (e: google.maps.MapMouseEvent) => {
            infoWindow.setContent(`
                        <div style="padding:4px">
      Speed: ${Math.round(miscellaneous.speed)} km/h<br/>
      Status: ${config.label}
    </div>
                    `);

            infoWindow.setPosition(e.latLng);
            infoWindow.open(map);
          });

          poly.addListener("mouseout", () => {
            infoWindow.close();
          });
          traveledPolylinesRef.current.push(poly);
        }
        if (si > lastDrawnSegmentRef.current) {
          lastDrawnSegmentRef.current = si - 1;
        }
        // ─────────────────────────────────────────────────────────────

        const pct = ((si + t) / totalSegments) * 100;

        if (now - lastProgressUpdate > 100) {
          lastProgressUpdate = now;
          onProgressRef.current?.(pct);
          // const speedKmh = computeSpeedKmh(from, to, TOTAL_DURATION_MS, totalSegments);
          const miscellaneous: Miscellaneous =
            typeof from.miscellaneous === "string"
              ? JSON.parse(from.miscellaneous)
              : (from.miscellaneous ?? {
                speed: 0,
                gpsLoss: false,
                networkLoss: false,
              });
          // console.log(speedKmh, "speedKmh")
          onVehicleSpeedUpdateRef.current?.(
            Math.round(miscellaneous.speed ?? 0),
          );

          // ── Sign-in / sign-out reveal, synced to the trip's real clock ──
          // Reuses the same 100ms throttle window as progress updates —
          // frequent enough to feel live, cheap enough to run every tick.
          const simulatedTimeMs = getSimulatedTimeAt(si, t);
          applySigninSignoutVisibility(simulatedTimeMs);
        }

        animFrameRef.current = requestAnimationFrame(tick);
      };

      animFrameRef.current = requestAnimationFrame(tick);
    },
    [getSimulatedTimeAt, applySigninSignoutVisibility],
  );
  const pauseAnimation = useCallback(() => {
    isPlayingRef.current = false;
    if (animFrameRef.current != null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  /**
   * Changes speed mid-playback (call with new speed value).
   */
  const setAnimationSpeed = useCallback((speed: number) => {
    speedRef.current = speed;
  }, []);
  // --------------------------------
  const seekTo = useCallback(
    (pct: number) => {
      const coords = coordsRef.current;
      if (!coords || coords.length < 2) return;

      const totalSegments = coords.length - 1;
      const globalT = (Math.min(100, Math.max(0, pct)) / 100) * totalSegments;

      const si = Math.min(Math.floor(globalT), totalSegments - 1);
      const t = globalT - si;

      segmentIndexRef.current = si;
      segmentTRef.current = t;

      const from = coords[si];
      const to = coords[si + 1];
      const lat = from.latitude + (to.latitude - from.latitude) * t;
      const lng = from.longitude + (to.longitude - from.longitude) * t;

      const dLat = to.latitude - from.latitude;
      const dLng = to.longitude - from.longitude;
      const heading = (Math.atan2(dLng, dLat) * 180) / Math.PI;

      const marker = vehicleMarkerRef.current;
      if (!marker || !mapInstanceRef.current) return;

      marker.setMap(mapInstanceRef.current); // ensure visible
      marker.setPosition({ lat, lng });
      marker.setIcon({
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(buildVehicleSVG(heading))}`,
        scaledSize: new google.maps.Size(24, 24),
        anchor: new google.maps.Point(18, 18),
      });

      onProgressRef.current?.(pct);

      // Recompute signin/signout visibility for the scrubbed-to position.
      // This is what makes markers hide again when the user drags backward
      // past a passenger's signin/signout time.
      const simulatedTimeMs = getSimulatedTimeAt(si, t);
      applySigninSignoutVisibility(simulatedTimeMs);
    },
    [getSimulatedTimeAt, applySigninSignoutVisibility],
  );

  return {
    mapRef,
    isLoaded,
    initMap,
    drawPolylines,
    drawEmployeepoints, // ← new
    drawOfficeMarker, // show office
    toggleSigninMarkers, // ← add
    toggleSignoutMarkers, // ← add
    toggleNoShowMarkers,
    clearWaypoints, // ← new
    clearMapElements,
    // ── animation ──
    setVehicleCoords,
    startAnimation,
    pauseAnimation,
    setAnimationSpeed,
    seekTo,
    // ----------- live tracking
    updateLiveMarker,
    clearNextPickupPolyline,
    drawStopPoints,
  };
}
// Call once, e.g. right after the map loads in initMap()
function injectInfoWindowStyleFix() {
  if (document.getElementById("gm-infowindow-style-fix")) return;

  const style = document.createElement("style");
  style.id = "gm-infowindow-style-fix";
  style.innerHTML = `
    .gm-style-iw-d {
      overflow: hidden !important;
    }
    .gm-style-iw-ch{
      display:none;
    }
    .gm-style-iw-c {
      padding: 8px !important;
    }
    .gm-style-iw-t::after {
      display: none;
    }
    /* Hide Google's native close button — we render our own inside the content */
    .gm-ui-hover-effect {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}