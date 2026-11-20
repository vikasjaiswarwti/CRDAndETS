import { useEffect, useRef, useState } from "react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import type {
  TripPassenger,
  TripTrackingPacket,
  // LatestPosition,
  // Passenger,
} from "../types/progressTrip.types";
import { getTripColor } from "../utils/commonFunction";
import { buildVehicleSVG } from "../../route-tracking/icon";
// import { useGetPassengerDetailsQuery } from "../services/progressTripApi";
import { useLazyGetPassengerDetailsQuery } from "../services/progressTripApi";
import { formatAdjustedTime } from "../../route-tracking/utils/commonFunction";

const API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ?? "";
const DEFAULT_CENTER = { lat: 28.5, lng: 77.2 };

interface LiveTrackPacket {
  dsId: number;
  latitude: number;
  longitude: number;
  speed: number | null;
  gpsTime: string;
  panic: boolean;
  source: string;
  batteryPercentage: number;
  miscellaneous: string;
}

interface TripMapPanelProps {
  // trips: TripTrackingPacket[];
  selectedTrips: TripTrackingPacket[];
  liveData?: LiveTrackPacket | null; // latest SignalR packet
}

interface ActivePax {
  tripId: number;
  empId: number;
}
// Helper to build the marker DOM element
const buildMarkerElement = (
  bearing: number,
  speed: number,
  color: string,
): HTMLDivElement => {
  const wrapper = document.createElement("div");
  wrapper.style.cssText =
    "position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;";

  // Speed badge — class name required for DOM query in effect 3
  const badge = document.createElement("div");
  badge.className = "vehicle-speed-badge"; // ✅ required
  badge.style.cssText = `
    position: absolute;
    top: -18px;
    left: 50%;
    transform: translateX(-50%);
    background: ${color};
    color: #fff;
    font-size: 10px;
    font-weight: 600;
    font-family: Inter, sans-serif;
    padding: 2px 6px;
    border-radius: 8px;
    white-space: nowrap;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    pointer-events: none;
    min-width: 48px;
    text-align: center;
  `;
  badge.textContent = `${Math.round(speed)} km/h`;

  // Vehicle SVG — class name required for DOM query in effect 3
  const vehicleEl = document.createElement("div");
  vehicleEl.className = "vehicle-svg-wrap"; // ✅ required
  vehicleEl.innerHTML = buildVehicleSVG(bearing);

  wrapper.appendChild(badge);
  wrapper.appendChild(vehicleEl);
  return wrapper;
};

const MapPolylines = ({
  selectedTrips,
  liveData,
  infoWindowRef,
}: {
  selectedTrips: TripTrackingPacket[];
  liveData?: LiveTrackPacket | null;
  infoWindowRef: React.MutableRefObject<google.maps.InfoWindow | null>;
}) => {
  const map = useMap();
  const [fetchPassengers] = useLazyGetPassengerDetailsQuery();
  const getInfoWindow = (): google.maps.InfoWindow => {
    if (!infoWindowRef.current) {
      infoWindowRef.current = new window.google.maps.InfoWindow({
        disableAutoPan: false,
      });
    }
    return infoWindowRef.current;
  };
  const markerRefs = useRef<
    globalThis.Map<number, google.maps.marker.AdvancedMarkerElement>
  >(new globalThis.Map());

  const selectedIdsRef = useRef<Set<number>>(new Set());
  // ✅ Persist last known speed + bearing per dsId
  const lastKnownRef = useRef<
    globalThis.Map<number, { speed: number; bearing: number }>
  >(new globalThis.Map());

  // locCode → office marker (one per unique office)
  const officeMarkerRefs = useRef<
    globalThis.Map<number, google.maps.marker.AdvancedMarkerElement>
  >(new globalThis.Map());

  // ── 1. Polylines + fitBounds ──────────────────────────────────────────────
  useEffect(() => {
    if (!map || !window.google) return;

    const polylines: google.maps.Polyline[] = [];
    const bounds = new window.google.maps.LatLngBounds();
    let hasPoints = false;

    selectedTrips.forEach((trip) => {
      if (!trip.actualRoutePolyline) return;
      try {
        const decodedPath = window.google.maps.geometry.encoding.decodePath(
          trip.actualRoutePolyline,
        );
        const polyline = new window.google.maps.Polyline({
          path: decodedPath,
          geodesic: true,
          strokeColor: getTripColor(trip.dsId),
          strokeOpacity: 0.8,
          strokeWeight: 4,
          map,
        });
        polylines.push(polyline);
        decodedPath.forEach((latLng) => {
          bounds.extend(latLng);
          hasPoints = true;
        });
      } catch (err) {
        console.error(`Failed to parse polyline for trip ${trip.dsId}:`, err);
      }
    });

    if (hasPoints) map.fitBounds(bounds, 80);

    return () => {
      polylines.forEach((line) => line.setMap(null));
    };
  }, [selectedTrips, map]);

  // ── 2. Vehicle + passenger + office markers ─────────────────────────────
  useEffect(() => {
    if (!map || !window.google?.maps?.marker?.AdvancedMarkerElement) return;

    selectedIdsRef.current = new Set(selectedTrips.map((t) => t.dsId));

    // ── Remove deselected vehicle markers ──
    markerRefs.current.forEach((marker, dsId) => {
      if (!selectedIdsRef.current.has(dsId)) {
        marker.map = null;
        markerRefs.current.delete(dsId);
        lastKnownRef.current.delete(dsId);
      }
    });

    // ── Remove office markers for trips no longer selected ──
    const selectedLocCodes = new Set(selectedTrips.map((t) => t.locCode));
    officeMarkerRefs.current.forEach((marker, locCode) => {
      if (!selectedLocCodes.has(locCode)) {
        marker.map = null;
        officeMarkerRefs.current.delete(locCode);
      }
    });

    selectedTrips.forEach((trip) => {
      const color = getTripColor(trip.dsId);

      // ── Vehicle marker ──
      if (!markerRefs.current.has(trip.dsId)) {
        let resolvedLat: number | null = null;
        let resolvedLng: number | null = null;
        if (
          trip.latestPosition?.latitude != null &&
          trip.latestPosition?.longitude != null
        ) {
          resolvedLat = trip.latestPosition.latitude;
          resolvedLng = trip.latestPosition.longitude;
        } else if (trip.actualRoutePolyline) {
          try {
            const decoded = window.google.maps.geometry.encoding.decodePath(
              trip.actualRoutePolyline,
            );
            if (decoded.length > 0) {
              resolvedLat = decoded[0].lat();
              resolvedLng = decoded[0].lng();
            }
          } catch {
            // ignore
          }
        }

        if (resolvedLat !== null && resolvedLng !== null) {
          const last = lastKnownRef.current.get(trip.dsId);
          const content = buildMarkerElement(
            last?.bearing ?? 0,
            last?.speed ?? 0,
            color,
          );
          content.dataset.color = color;
          const marker = new window.google.maps.marker.AdvancedMarkerElement({
            position: { lat: resolvedLat, lng: resolvedLng },
            map,
            content,
            title: `Trip ${trip.dsId} — ${trip.vehicleNo ?? ""}`,
            zIndex: 100,
          });
          // ✅ ADD THIS: Click to open InfoWindow
          marker.addListener("click", async () => {
            const iw = getInfoWindow();
            const { data: passengers = [] } = await fetchPassengers(trip.dsId);
            iw.setContent(buildVehicleInfoContent(trip, color, passengers));
            iw.open({ map, anchor: marker });

            // Attach close handler after DOM is ready inside the InfoWindow
            google.maps.event.addListenerOnce(iw, "domready", () => {
              const closeBtn = document.getElementById("iw-close-btn");
              closeBtn?.addEventListener("click", () => iw.close());
            });
          });
          markerRefs.current.set(trip.dsId, marker);
        }
      }

      // ── Office marker (one per unique locCode) ──
      if (
        !officeMarkerRefs.current.has(trip.locCode) &&
        trip.officeLat &&
        trip.officeLng
      ) {
        const officeMarker =
          new window.google.maps.marker.AdvancedMarkerElement({
            position: { lat: trip.officeLat, lng: trip.officeLng },
            map,
            content: buildOfficeElement(
              trip.officeDisplayName ?? trip.officeLocName ?? "Office",
            ),
            title: trip.officeDisplayName ?? "Office",
            zIndex: 20,
          });
        officeMarkerRefs.current.set(trip.locCode, officeMarker);
      }
    });
  }, [selectedTrips, map]);

  // ── 3. Update ONLY the one marker that received a packet ──────────────────
  useEffect(() => {
    if (
      !liveData ||
      !map ||
      !window.google?.maps?.marker?.AdvancedMarkerElement
    )
      return;

    const { dsId, latitude, longitude, miscellaneous } = liveData;

    if (!selectedIdsRef.current.has(dsId)) return;

    let bearing = 0;
    let speed = 0;
    try {
      const misc = JSON.parse(miscellaneous ?? "{}");
      bearing = misc.bearing ?? 0;
      speed = misc.speed ?? 0;
    } catch {
      // ignore
    }

    // ✅ Always persist the latest speed + bearing for this trip
    lastKnownRef.current.set(dsId, { speed, bearing });

    const existing = markerRefs.current.get(dsId);
    if (!existing) return;

    // Update position
    existing.position = { lat: latitude, lng: longitude };

    // Update badge + icon in-place
    const content = existing.content as HTMLDivElement;
    const badge = content?.querySelector(
      ".vehicle-speed-badge",
    ) as HTMLDivElement;
    const vehicleEl = content?.querySelector(
      ".vehicle-svg-wrap",
    ) as HTMLDivElement;
    const storedColor = content?.dataset.color ?? getTripColor(dsId);

    if (badge) {
      badge.textContent = `${Math.round(speed)} km/h`;
      badge.style.background = storedColor;
    }
    if (vehicleEl) vehicleEl.innerHTML = buildVehicleSVG(bearing);

    // ✅ All OTHER markers are untouched — they keep showing their last speed
  }, [liveData, map]);
  return null;
};

// --- traffic layer ------------------------------------------------------------
// ✅ Custom traffic layer — @vis.gl/react-google-maps has no built-in TrafficLayer,
// so we wrap the native google.maps.TrafficLayer ourselves.
const TrafficLayer = ({ show }: { show: boolean }) => {
  const map = useMap();
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);

  useEffect(() => {
    if (!map || !window.google) return;
    // console.log("Traffic layer attaching to map:", map);

    if (!trafficLayerRef.current) {
      trafficLayerRef.current = new window.google.maps.TrafficLayer();
    }
    trafficLayerRef.current.setMap(show ? map : null);

    return () => {
      trafficLayerRef.current?.setMap(null);
    };
  }, [map, show]);

  return null;
};
// ─── TripMapPanel ─────────────────────────────────────────────────────────────

export default function TripMapPanel({
  // trips,
  selectedTrips,
  liveData,
}: TripMapPanelProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [_activePax, setActivePax] = useState<ActivePax | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [showTraffic, setShowTraffic] = useState(false);
  // ←←← ADD THIS USEEFFECT ←←←
  useEffect(() => {
    injectInfoWindowStyleFix();
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <APIProvider apiKey={API_KEY} libraries={["geometry", "marker"]}>
        <Map
          style={{ width: "100%", height: "100%" }}
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={11}
          mapId="ongoing-trips-map"
          streetViewControl={false}
          mapTypeControl={false}
          fullscreenControl={true}
          disableDefaultUI
          zoomControl={false}
          clickableIcons={false}
          onIdle={(e) => {
            mapRef.current = e.map;
          }}
          onClick={() => {
            setActivePax(null);
            infoWindowRef.current?.close();
          }}
        >
          <TrafficLayer show={showTraffic} />
          <MapPolylines
            selectedTrips={selectedTrips}
            liveData={liveData}
            infoWindowRef={infoWindowRef}
          />
        </Map>
      </APIProvider>

      {selectedTrips.length === 0 && (
        <div style={styles.emptyOverlay}>
          Select trips from the sidebar to view them on the map
        </div>
      )}

      {!API_KEY && (
        <div style={styles.apiKeyWarning}>
          ⚠️ Set VITE_GOOGLE_MAPS_API_KEY in .env for live tiles
        </div>
      )}
      {/* ✅ Toggles congestion coloring on the trip routes themselves */}
      <div style={styles.trafficToggleWrap}>
        <span style={styles.trafficToggleLabel}>🚦 Route Traffic</span>
        <button
          type="button"
          role="switch"
          aria-checked={showTraffic}
          onClick={() => setShowTraffic((prev) => !prev)}
          style={{
            ...styles.toggleTrack,
            background: showTraffic ? "#1d4ed8" : "#d1d5db",
          }}
        >
          <span
            style={{
              ...styles.toggleKnob,
              transform: showTraffic ? "translateX(18px)" : "translateX(2px)",
            }}
          />
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  emptyOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "rgba(255,255,255,0.9)",
    border: "0.5px solid #e5e5e3",
    borderRadius: 8,
    padding: "12px 20px",
    fontSize: 13,
    color: "#6b7280",
    pointerEvents: "none",
    textAlign: "center",
    zIndex: 10,
  },
  apiKeyWarning: {
    position: "absolute",
    bottom: 48,
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(0,0,0,0.72)",
    color: "#fbbf24",
    fontSize: 12,
    fontWeight: 600,
    padding: "6px 14px",
    borderRadius: 6,
    pointerEvents: "none",
    whiteSpace: "nowrap",
    zIndex: 10,
  },
  trafficToggleWrap: {
    position: "absolute",
    top: 6,
    left: 6,
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(255,255,255,0.9)",
    border: "0.5px solid #e5e5e3",
    borderRadius: 20,
    padding: "6px 10px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
    zIndex: 10,
  },
  trafficToggleLabel: {
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "Inter, sans-serif",
    color: "#374151",
    whiteSpace: "nowrap",
  },
  toggleTrack: {
    position: "relative",
    width: 32,
    height: 16,
    borderRadius: 999,
    border: "none",
    padding: 0,
    cursor: "pointer",
    transition: "background 0.2s ease",
    flexShrink: 0,
  },
  toggleKnob: {
    position: "absolute",
    top: 2,
    left: 0,
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: "#fff",
    boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
    transition: "transform 0.2s ease",
  },
};

const buildOfficeElement = (officeName: string): HTMLDivElement => {
  const wrapper = document.createElement("div");
  wrapper.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
  `;

  const icon = document.createElement("div");
  icon.style.cssText = `
    font-size: 28px;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));
    line-height: 1;
  `;
  icon.textContent = "🏢";

  const label = document.createElement("div");
  label.style.cssText = `
    margin-top: 2px;
    background: rgba(0,0,0,0.65);
    color: #fff;
    font-size: 9px;
    font-family: Inter, sans-serif;
    padding: 1px 5px;
    border-radius: 4px;
    white-space: nowrap;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    pointer-events: none;
  `;
  label.textContent = officeName;

  wrapper.appendChild(icon);
  wrapper.appendChild(label);
  return wrapper;
};

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
const buildVehicleInfoContent = (
  trip: TripTrackingPacket,
  _color: string,
  passengers: TripPassenger[] = [],
): string => {
  const totalPax = trip.totalPax || 0;
  const formatTime = (iso: string | null | undefined): string => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const timeRow = (label: string, value: string, highlight = false) => `
    <div style="display:flex; justify-content:space-between; align-items:center; gap:4px; margin-top:2px;">
      <span style="font-size:9px; color:#9ca3af; flex-shrink:0;">${label}</span>
      <span style="font-size:9px; font-weight:${highlight ? "600" : "400"}; color:${highlight ? "#111827" : "#6b7280"};">${value}</span>
    </div>`;
  const passengerRows = (() => {
    if (!passengers || passengers.length === 0) {
      return `<div style="color:#9ca3af; text-align:center; padding:14px 0;">No passengers</div>`;
    }

    return passengers
      .map((pax) => {
        // const initial = pax.firstname?.charAt(0)?.toUpperCase() ?? "?";
        const fullName =
          [pax.firstname, pax.lastName].filter(Boolean).join(" ") || "Unknown";
        const isBoarded = !!pax.empSigninTime && !pax.noShow;

        // const dotColor = pax.noShow ? "#E24B4A" : isBoarded ? "#1D9E75" : color;
        const statusColor = pax.noShow
          ? "#E24B4A"
          : isBoarded
            ? "#1D9E75"
            : "#F59E0B";
        const statusText = pax.paxTrackingStatus ?? "—";
        const statusPrefix = isBoarded ? "✓ " : "";

        const scheduledTime = formatTime(pax.plannedScheduleTime);
        const signinTime = formatTime(pax.empSigninTime);
        const signoutTime = formatTime(pax.empSignOutTime);
        const cabReachedTime = formatTime(pax.cabReachedTime);
        const actualETA = formatAdjustedTime(
          pax.plannedScheduleTime,
          pax.etaDeviationMinutes,
        );

        return `
          <div style="padding:6px 0; border-bottom:1px solid #f1f5f9;">
            <!-- Name row -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <div style="font-weight:600; font-size:10px; max-width:130px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#111827;">
                  ${fullName}
                </div>
              </div>
              <div>${timeRow("ETA", actualETA, true)}</div>
              <div style="text-align:right; flex-shrink:0;">
                <span style="color:${statusColor}; font-size:9px; font-weight:500;">${statusPrefix}${statusText}</span>
              </div>
            </div>
            <!-- Time details -->
            <div style=" display:grid; grid-template-columns:1fr 1fr; gap:0 8px;">
              ${timeRow("Scheduled", scheduledTime, true)}
              ${timeRow("Cab Reached", cabReachedTime, true)}
              ${timeRow("Sign In", signinTime, true)}
              ${timeRow("Sign Out", signoutTime, true)}
            </div>
          </div>`;
      })
      .join("");
  })();
  return `
    <div style="font-family:Inter,sans-serif; min-width:280px; max-width:320px; padding:0; margin:0;">
      <div style="padding:8px;">

        <!-- Header with close button -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
          <div style="flex:1; min-width:0;">
            ${
              trip.driverName
                ? `
               <div style="font-size:9px; color:#6b7280; margin-top:2px;">
                Vehicle No. - <span style="font-size:10px; font-weight:600; color:#111827;"> ${trip.vehicleNo ?? "—"}</span>
              </div>
               <div style="font-size:9px; color:#6b7280; margin-top:2px;">
                Driver Name - <span style="font-size:10px; font-weight:600; color:#111827;">${trip.driverName}</span>
              </div>
              <div style="font-size:9px; color:#6b7280; margin-top:2px;">
                Office - <span style="font-size:10px; font-weight:600; color:#111827;">${trip.officeDisplayName ?? "—"}</span>
              </div>`
                : ""
            }
          </div>

         <button
            id="iw-close-btn"
            style="
              flex-shrink:0;
              margin-left:8px;
              width:20px; height:20px;
              border:none; background:none;
              cursor:pointer;
              display:flex; align-items:center; justify-content:center;
              border-radius:4px;
              color:#9ca3af;
              font-size:16px;
              line-height:1;
              padding:0;
            "
            onmouseover="this.style.background='#f3f4f6'; this.style.color='#374151';"
            onmouseout="this.style.background='none'; this.style.color='#9ca3af';"
            title="Close"
          >&#x2715;</button>
        </div>

        <div style="margin-top:8px;">
          <div style="font-size:10px; color:#6b7280; margin-bottom:5px;">
            PASSENGERS (${totalPax})
          </div>
          <div style="max-height:260px; overflow-y:auto; font-size:13px;">
            ${passengerRows}
          </div>
        </div>

      </div>
    </div>
  `;
};
