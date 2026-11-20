// src/features/route-maker/map/useShuttleMap.ts
//
// Imperative Google Maps hook for shuttle mode.
//
// Visual design:
//   • Route  — solid polyline + repeating directional arrows
//   • Stops  — pin-shaped SVG marker (circle + tail), anchor at tail tip
//   • Popup  — custom OverlayView popup (same pattern as useRouteMap)
//   • Office — distinct building pin
//
// Stop-selection mode (when selectedStopOrder is set on the active trip):
//   • Stops BEFORE selected  → dimmed markers (22% opacity)
//   • Selected stop          → enlarged pin with dashed selection ring
//   • Stops AFTER selected   → normal bright markers
//   • Route BEFORE selected  → gray, thin, 30% opacity polyline
//   • Route FROM selected    → bright, thick (6px), colored + arrows
//   • Map auto-fits          → remaining route + office

import { useCallback, useRef } from "react";
import type {
  ShuttleTripApi,
  ShuttleStopApi,
} from "../../types/Shuttleapitypes";

// ─── Colour palette — must match ShuttleRouteStackPanel PALETTE ───────────────

const PALETTE = [
  "#0284C7",
  "#7C3AED",
  "#059669",
  "#D97706",
  "#DB2777",
  "#0891B2",
  "#DC2626",
  "#65A30D",
  "#9333EA",
];

function tripColor(idx: number): string {
  return PALETTE[idx % PALETTE.length];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Returns the index in `path` closest (Euclidean in degree-space) to (lat, lng).
 */
function findClosestPathIndex(
  path: google.maps.LatLng[],
  lat: number,
  lng: number,
): number {
  let minDist = Infinity;
  let closestIdx = 0;
  for (let i = 0; i < path.length; i++) {
    const dLat = path[i].lat() - lat;
    const dLng = path[i].lng() - lng;
    const d = dLat * dLat + dLng * dLng;
    if (d < minDist) {
      minDist = d;
      closestIdx = i;
    }
  }
  return closestIdx;
}

// ─── Custom Popup (OverlayView) ───────────────────────────────────────────────
// Same pattern as useRouteMap — avoids InfoWindow layout bugs and
// destruction-on-re-render issues.

type PopupInstance = google.maps.OverlayView & {
  updatePosition: (p: google.maps.LatLng) => void;
};

type PopupConstructor = new (
  position: google.maps.LatLng,
  content: string,
  onClose: () => void,
) => PopupInstance;

let _ShuttlePopupClass: PopupConstructor | null = null;

function getPopupClass(): PopupConstructor {
  if (_ShuttlePopupClass) return _ShuttlePopupClass;

  _ShuttlePopupClass = class extends google.maps.OverlayView {
    private position: google.maps.LatLng;
    private container: HTMLDivElement;

    constructor(
      position: google.maps.LatLng,
      content: string,
      onClose: () => void,
    ) {
      super();
      this.position = position;

      this.container = document.createElement("div");
      this.container.style.cssText = `
        position:absolute;
        transform:translate(-50%,calc(-100% - 16px));
        background:#fff;
        border-radius:10px;
        box-shadow:0 8px 28px rgba(0,0,0,0.15),0 2px 8px rgba(0,0,0,0.08);
        border:1px solid #e5e7eb;
        font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
        min-width:200px;
        max-width:290px;
        pointer-events:auto;
        z-index:9999;
        animation:shuttlePopIn 0.15s ease;
      `;

      // Downward arrow
      const arrow = document.createElement("div");
      arrow.style.cssText = `
        position:absolute;
        bottom:-7px;
        left:50%;
        width:12px;
        height:12px;
        background:#fff;
        border-right:1px solid #e5e7eb;
        border-bottom:1px solid #e5e7eb;
        transform:translateX(-50%) rotate(45deg);
      `;

      // Close button — compact circle, does NOT stretch full width
      const closeBtn = document.createElement("button");
      closeBtn.innerHTML = "×";
      closeBtn.style.cssText = `
        position:absolute;
        top:7px;
        right:8px;
        width:18px;
        height:18px;
        border-radius:50%;
        background:#fee2e2;
        color:#ef4444;
        border:none;
        cursor:pointer;
        font-size:14px;
        line-height:1;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:0;
        font-weight:700;
        flex-shrink:0;
      `;
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        onClose();
      });

      // Content body
      const body = document.createElement("div");
      body.style.cssText = "padding:10px 32px 10px 12px;";
      body.innerHTML = content;

      this.container.appendChild(arrow);
      this.container.appendChild(closeBtn);
      this.container.appendChild(body);

      // Inject animation keyframe once
      if (!document.getElementById("shuttle-popup-style")) {
        const style = document.createElement("style");
        style.id = "shuttle-popup-style";
        style.textContent = `
          @keyframes shuttlePopIn {
            from { opacity:0; transform:translate(-50%,calc(-100% - 24px)); }
            to   { opacity:1; transform:translate(-50%,calc(-100% - 16px)); }
          }
        `;
        document.head.appendChild(style);
      }
    }

    onAdd() {
      this.getPanes()!.floatPane.appendChild(this.container);
    }

    draw() {
      const point = this.getProjection().fromLatLngToDivPixel(this.position);
      if (point) {
        this.container.style.left = `${point.x}px`;
        this.container.style.top = `${point.y}px`;
      }
    }

    onRemove() {
      this.container.remove();
    }

    updatePosition(pos: google.maps.LatLng) {
      this.position = pos;
      this.draw();
    }
  } as unknown as PopupConstructor;

  return _ShuttlePopupClass;
}

// ─── Normal stop pin (circle + tail) ─────────────────────────────────────────

function stopPinIcon(
  stopOrder: number,
  color: string,
  opacity: number,
): google.maps.Icon {
  const W = 38;
  const H = 50;
  const CX = W / 2;
  const R = 15;
  const CY = R + 2;
  const fontSize = stopOrder >= 10 ? 10 : 13;
  const tailL = CX - 6;
  const tailR = CX + 6;
  const tailBase = CY + R + 1;
  const tailTip = H - 1;
  const dimAttr = opacity < 1 ? `opacity="${opacity.toFixed(2)}"` : "";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" ${dimAttr}>
  <defs>
    <filter id="s" x="-30%" y="-20%" width="160%" height="160%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(0,0,0,0.35)"/>
    </filter>
  </defs>
  <g filter="url(#s)">
    <circle cx="${CX}" cy="${CY}" r="${R}" fill="${color}" stroke="white" stroke-width="2.5"/>
    <polygon points="${tailL},${tailBase} ${tailR},${tailBase} ${CX},${tailTip}" fill="${color}"/>
  </g>
  <circle cx="${CX}" cy="${CY}" r="${R - 5}" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
  <text x="${CX}" y="${CY + 5}" text-anchor="middle" fill="white"
    font-size="${fontSize}" font-weight="800"
    font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">${stopOrder}</text>
</svg>`;

  return {
    url: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(W, H),
    anchor: new google.maps.Point(CX, tailTip),
  };
}

// ─── SELECTED stop pin (larger + dashed ring) ─────────────────────────────────

function selectedStopPinIcon(
  stopOrder: number,
  color: string,
): google.maps.Icon {
  const W = 50;
  const H = 64;
  const CX = W / 2;
  const R = 18;
  const CY = R + 3;
  const fontSize = stopOrder >= 10 ? 11 : 15;
  const tailL = CX - 8;
  const tailR = CX + 8;
  const tailBase = CY + R + 1;
  const tailTip = H - 1;
  const outerR = R + 7;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="ss" x="-40%" y="-30%" width="180%" height="180%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="rgba(0,0,0,0.45)"/>
    </filter>
  </defs>
  <circle cx="${CX}" cy="${CY}" r="${outerR}" fill="${color}" opacity="0.16"/>
  <circle cx="${CX}" cy="${CY}" r="${outerR}" fill="none" stroke="${color}" stroke-width="2.2" stroke-dasharray="5 3" opacity="0.85"/>
  <g filter="url(#ss)">
    <circle cx="${CX}" cy="${CY}" r="${R}" fill="${color}" stroke="white" stroke-width="3"/>
    <polygon points="${tailL},${tailBase} ${tailR},${tailBase} ${CX},${tailTip}" fill="${color}"/>
  </g>
  <circle cx="${CX}" cy="${CY}" r="${R - 6}" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
  <text x="${CX}" y="${CY + 6}" text-anchor="middle" fill="white"
    font-size="${fontSize}" font-weight="800"
    font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">${stopOrder}</text>
</svg>`;

  return {
    url: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(W, H),
    anchor: new google.maps.Point(CX, tailTip),
  };
}

// ─── Office pin ────────────────────────────────────────────────────────────────

function officePinIcon(): google.maps.Icon {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="40" viewBox="0 0 36 40">
                <rect x="2" y="2" width="32" height="32" rx="6" fill="#1B4332" stroke="#fff" stroke-width="2"/>
                <text x="18" y="23" font-size="18" text-anchor="middle" fill="white">🏢</text>
                <polygon points="12,34 24,34 18,40" fill="#1B4332"/>
              </svg>`;

  return {
    url: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(36, 46),
    anchor: new google.maps.Point(18, 45),
  };
}

// ─── Stop popup content ───────────────────────────────────────────────────────
// Returns the inner HTML placed inside the custom popup's body div.
// No outer min/max-width wrapper needed — the popup container handles sizing.

function buildPopupHtml(
  stop: ShuttleStopApi,
  trip: ShuttleTripApi,
  color: string,
): string {
  const time = fmtTime(stop.schArrivalTime);
  const address = esc(stop.passengers[0]?.address ?? "");
  const paxCount = stop.passengers.length;
  const noShowCount = stop.passengers.filter((p) => p.noShow).length;

  const passengerRows = stop.passengers
    .map((p) => {
      const gBg = p.gender === "F" ? "#FDF2F8" : "#EFF6FF";
      const gBorder = p.gender === "F" ? "#F9A8D4" : "#BFDBFE";
      const gColor = p.gender === "F" ? "#BE185D" : "#1D4ED8";
      const nameStyle = p.noShow
        ? "text-decoration:line-through;color:#9CA3AF;"
        : "color:#111827;";

      return `
<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #F3F4F6;">
  <div style="width:22px;height:22px;border-radius:50%;flex-shrink:0;
    background:${gBg};border:1.5px solid ${gBorder};
    display:flex;align-items:center;justify-content:center;
    font-size:9px;font-weight:700;color:${gColor};">${esc(p.gender)}</div>
  <div style="flex:1;min-width:0;">
    <div style="font-size:11px;font-weight:600;${nameStyle}
      overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(p.passengerName)}</div>
    <div style="font-size:10px;color:#6B7280;">${esc(p.mobileNo)}</div>
  </div>
  ${
    p.noShow
      ? `<span style="flex-shrink:0;font-size:8px;font-weight:700;
          padding:2px 5px;border-radius:3px;
          background:#FEF3C7;color:#B45309;
          border:1px solid #FDE68A;white-space:nowrap;">NO SHOW</span>`
      : ""
  }
</div>`;
    })
    .join("");

  const noShowNote =
    noShowCount > 0
      ? `<div style="font-size:9px;color:#B45309;margin-top:4px;">
           ⚠ ${noShowCount} passenger${noShowCount > 1 ? "s" : ""} marked no-show
         </div>`
      : "";

  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <!-- Header: stop circle + title row -->
  <div style="display:flex;align-items:center;gap:10px;
    margin-bottom:10px;padding-bottom:10px;border-bottom:2px solid #F3F4F6;">
    <div style="width:34px;height:34px;border-radius:50%;flex-shrink:0;
      background:${color};display:flex;align-items:center;justify-content:center;
      color:white;font-size:14px;font-weight:800;
      box-shadow:0 2px 6px rgba(0,0,0,0.2);">${stop.stopOrder}</div>
    <div style="min-width:0;">
      <div style="font-size:13px;font-weight:700;color:#111827;line-height:1.2;">
        Stop ${stop.stopOrder}</div>
      <div style="font-size:10px;color:#6B7280;margin-top:2px;display:flex;
        align-items:center;gap:4px;flex-wrap:wrap;">
        <span style="background:${color}1A;color:${color};font-weight:700;
          padding:1px 6px;border-radius:99px;font-size:9px;">Trip #${trip.dsId}</span>
        <span>🕐 ${time}</span>
        <span>${paxCount} pax</span>
      </div>
    </div>
  </div>
  <!-- Address — just below header, above passenger list -->
  ${
    address
      ? `<div style="margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #F3F4F6;
         font-size:10px;color:#9CA3AF;display:flex;gap:4px;align-items:flex-start;">
         <span style="flex-shrink:0;">📍</span>
         <span style="overflow:hidden;text-overflow:ellipsis;
           display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${address}</span>
       </div>`
      : ""
  }
  <!-- Passenger list -->
  <div>${passengerRows}</div>
  ${noShowNote}
</div>`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseShuttleMapReturn {
  setMap: (map: google.maps.Map | null) => void;
  renderShuttle: (
    trips: ShuttleTripApi[],
    selectedTripId: number | null,
    office?: { lat: number; lng: number; name: string },
    onTripSelect?: (tripId: number) => void,
    selectedStopOrder?: number | null,
    // onStopSelect?: (stopOrder: number) => void,
    tripType?: "login" | "logout",
  ) => void;
  focusTrip: (tripId: number) => void;
  fitAll: () => void;
}

export function useShuttleMap(): UseShuttleMapReturn {
  const mapRef = useRef<google.maps.Map | null>(null);
  const polylinesRef = useRef<Map<number, google.maps.Polyline>>(new Map());
  const dimPolylinesRef = useRef<google.maps.Polyline[]>([]);
  const markersRef = useRef<google.maps.Marker[]>([]);
  /** Custom OverlayView popup — replaces InfoWindow to avoid layout/destroy bugs */
  const customPopupRef = useRef<PopupInstance | null>(null);
  const officeMarkerRef = useRef<google.maps.Marker | null>(null);
  const boundsRef = useRef<google.maps.LatLngBounds | null>(null);

  // ── closePopup ──────────────────────────────────────────────────────────────
  const closePopup = useCallback(() => {
    if (customPopupRef.current) {
      customPopupRef.current.setMap(null);
      customPopupRef.current = null;
    }
  }, []);

  // ── setMap ──────────────────────────────────────────────────────────────────
  const setMap = useCallback(
    (map: google.maps.Map | null) => {
      if (!map) closePopup();
      mapRef.current = map;
    },
    [closePopup],
  );

  // ── _clearOverlays ──────────────────────────────────────────────────────────
  const _clearOverlays = useCallback(() => {
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current.clear();
    dimPolylinesRef.current.forEach((p) => p.setMap(null));
    dimPolylinesRef.current = [];
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    closePopup();
    officeMarkerRef.current?.setMap(null);
    officeMarkerRef.current = null;
  }, [closePopup]);

  // ── renderShuttle ───────────────────────────────────────────────────────────
  const renderShuttle = useCallback(
    (
      trips: ShuttleTripApi[],
      selectedTripId: number | null,
      office?: { lat: number; lng: number; name: string },
      onTripSelect?: (tripId: number) => void,
      selectedStopOrder?: number | null,

      //   onStopSelect?: (stopOrder: number) => void,
      tripType?: "login" | "logout",
    ) => {
      const map = mapRef.current;
      if (!map) return;

      _clearOverlays();

      const allBounds = new google.maps.LatLngBounds();
      boundsRef.current = allBounds;

      // ── Office pin ──────────────────────────────────────────────────────────
      if (office) {
        allBounds.extend({ lat: office.lat, lng: office.lng });
        officeMarkerRef.current = new google.maps.Marker({
          map,
          position: { lat: office.lat, lng: office.lng },
          icon: officePinIcon(),
          title: office.name,
          zIndex: 200,
          optimized: false,
        });

        officeMarkerRef.current.addListener("click", () => {
          closePopup();
          const PopupClass = getPopupClass();
          const popup = new PopupClass(
            officeMarkerRef.current!.getPosition()!,
            `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
    <div style="width:28px;height:28px;border-radius:6px;background:#1B4332;
      display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;">🏢</div>
    <div>
      <div style="font-size:13px;font-weight:700;color:#111827;">Office</div>
      <div style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.04em;">Destination</div>
    </div>
  </div>
  <div style="display:flex;align-items:flex-start;gap:6px;">
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" style="flex-shrink:0;margin-top:1px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
    <span style="font-size:10px;color:#374151;line-height:1.4;">${esc(office.name)}</span>
  </div>
</div>`,
            closePopup,
          );
          popup.setMap(map);
          customPopupRef.current = popup;
        });
      }

      // Close popup on map background click
      map.addListener("click", () => closePopup());

      // ── Per-trip rendering ──────────────────────────────────────────────────
      trips.forEach((trip, idx) => {
        const color = tripColor(idx);
        const isActiveTrip =
          selectedTripId === null || trip.dsId === selectedTripId;

        const isStopFocus =
          isActiveTrip && selectedStopOrder != null && selectedStopOrder > 0;

        const lineOpacity = isActiveTrip ? 0.92 : 0.18;
        const strokeWeight = isActiveTrip ? 5 : 2.5;
        const zBase = isActiveTrip ? 10 : 1;

        // ── Polyline ──────────────────────────────────────────────────────────
        if (trip.routePolyline && google.maps.geometry?.encoding) {
          try {
            const fullPath = google.maps.geometry.encoding.decodePath(
              trip.routePolyline,
            );
            fullPath.forEach((p) => allBounds.extend(p));

            const arrowSymbol: google.maps.Symbol = {
              path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
              scale: isActiveTrip ? 2.8 : 2,
              strokeColor: color,
              strokeOpacity: isActiveTrip ? 0.85 : 0.2,
              strokeWeight: 1.8,
            };

            // if (isStopFocus) {
            //   const selStop = trip.stops.find(
            //     (s) => s.stopOrder === selectedStopOrder,
            //   );

            //   if (selStop?.passengers[0]) {
            //     const splitIdx = findClosestPathIndex(
            //       fullPath,
            //       selStop.passengers[0].lat,
            //       selStop.passengers[0].lng,
            //     );

            //     if (splitIdx > 0) {
            //       const beforeLine = new google.maps.Polyline({
            //         path: fullPath.slice(0, splitIdx + 1),
            //         strokeColor: "#9CA3AF",
            //         strokeOpacity: 0.32,
            //         strokeWeight: 2.5,
            //         map,
            //         zIndex: 8,
            //         clickable: false,
            //       });
            //       dimPolylinesRef.current.push(beforeLine);
            //     }

            //     const remainArrow: google.maps.Symbol = {
            //       path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
            //       scale: 3,
            //       strokeColor: color,
            //       strokeOpacity: 0.9,
            //       strokeWeight: 2,
            //     };

            //     const remainLine = new google.maps.Polyline({
            //       path: fullPath.slice(splitIdx),
            //       strokeColor: color,
            //       strokeOpacity: 0.96,
            //       strokeWeight: 6,
            //       map,
            //       zIndex: 16,
            //       clickable: true,
            //       icons: [{ icon: remainArrow, offset: "0%", repeat: "80px" }],
            //     });
            //     remainLine.addListener("click", () => {
            //       closePopup();
            //       onTripSelect?.(trip.dsId);
            //     });
            //     polylinesRef.current.set(trip.dsId, remainLine);

            //     // const remBounds = new google.maps.LatLngBounds();
            //     // const contextStart = Math.max(0, splitIdx - 3);
            //     // fullPath
            //     //   .slice(contextStart)
            //     //   .forEach((p) => remBounds.extend(p));
            //     // if (office)
            //     //   remBounds.extend({ lat: office.lat, lng: office.lng });
            //     // if (!remBounds.isEmpty()) {
            //     //   map.fitBounds(remBounds, {
            //     //     top: 80,
            //     //     right: 60,
            //     //     bottom: 80,
            //     //     left: 60,
            //     //   });
            //     // }

            //     const remBounds = new google.maps.LatLngBounds();
            //     const contextStart = Math.max(0, splitIdx - 3);
            //     fullPath
            //       .slice(contextStart)
            //       .forEach((p) => remBounds.extend(p));
            //     // Login: office is the DESTINATION (end of polyline) — include it in the remaining view.
            //     // Logout: office is the ORIGIN (start of polyline) — adding it makes the bounds span
            //     // the entire route and the map zooms way out, hiding the selected stop context.
            //     if (office && tripType !== "logout") {
            //       remBounds.extend({ lat: office.lat, lng: office.lng });
            //     }
            //     if (!remBounds.isEmpty()) {
            //       map.fitBounds(remBounds, {
            //         top: 80,
            //         right: 60,
            //         bottom: 80,
            //         left: 60,
            //       });
            //     }
            //   } else {
            //     _drawFullPolyline();
            //   }
            // } else {
            //   _drawFullPolyline();
            // }

            if (isStopFocus) {
              const selStop = trip.stops.find(
                (s) => s.stopOrder === selectedStopOrder,
              );

              if (selStop?.passengers[0]) {
                const splitIdx = findClosestPathIndex(
                  fullPath,
                  selStop.passengers[0].lat,
                  selStop.passengers[0].lng,
                );

                const remainArrow: google.maps.Symbol = {
                  path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
                  scale: 3,
                  strokeColor: color,
                  strokeOpacity: 0.9,
                  strokeWeight: 2,
                };

                if (tripType === "logout") {
                  // ── LOGOUT ─────────────────────────────────────────────────────────────
                  // Polyline direction: Office → StopN → ... → Stop1
                  // Bright = traveled path from Office to selected stop
                  // Gray  = remaining drops from selected stop to end

                  // Bright: office → selected stop
                  const traveledLine = new google.maps.Polyline({
                    path: fullPath.slice(0, splitIdx + 1),
                    strokeColor: color,
                    strokeOpacity: 0.96,
                    strokeWeight: 6,
                    map,
                    zIndex: 16,
                    clickable: true,
                    icons: [
                      { icon: remainArrow, offset: "0%", repeat: "80px" },
                    ],
                  });
                  traveledLine.addListener("click", () => {
                    closePopup();
                    onTripSelect?.(trip.dsId);
                  });
                  polylinesRef.current.set(trip.dsId, traveledLine);

                  // Gray: remaining drops from selected stop to end
                  if (splitIdx < fullPath.length - 1) {
                    const dimLine = new google.maps.Polyline({
                      path: fullPath.slice(splitIdx),
                      strokeColor: "#9CA3AF",
                      strokeOpacity: 0.32,
                      strokeWeight: 2.5,
                      map,
                      zIndex: 8,
                      clickable: false,
                    });
                    dimPolylinesRef.current.push(dimLine);
                  }

                  // Fit to traveled bright path (office → selected stop)
                  const traveledBounds = new google.maps.LatLngBounds();
                  fullPath
                    .slice(0, splitIdx + 1)
                    .forEach((p) => traveledBounds.extend(p));
                  if (office)
                    traveledBounds.extend({ lat: office.lat, lng: office.lng });
                  if (!traveledBounds.isEmpty()) {
                    map.fitBounds(traveledBounds, {
                      top: 80,
                      right: 60,
                      bottom: 80,
                      left: 60,
                    });
                  }
                } else {
                  // ── LOGIN ──────────────────────────────────────────────────────────────
                  // Polyline direction: Stop1 → Stop2 → ... → Office
                  // Gray  = already-covered stops before selected stop
                  // Bright = remaining route from selected stop to office

                  // Gray: start → selected stop
                  if (splitIdx > 0) {
                    const beforeLine = new google.maps.Polyline({
                      path: fullPath.slice(0, splitIdx + 1),
                      strokeColor: "#9CA3AF",
                      strokeOpacity: 0.32,
                      strokeWeight: 2.5,
                      map,
                      zIndex: 8,
                      clickable: false,
                    });
                    dimPolylinesRef.current.push(beforeLine);
                  }

                  // Bright: selected stop → office
                  const remainLine = new google.maps.Polyline({
                    path: fullPath.slice(splitIdx),
                    strokeColor: color,
                    strokeOpacity: 0.96,
                    strokeWeight: 6,
                    map,
                    zIndex: 16,
                    clickable: true,
                    icons: [
                      { icon: remainArrow, offset: "0%", repeat: "80px" },
                    ],
                  });
                  remainLine.addListener("click", () => {
                    closePopup();
                    onTripSelect?.(trip.dsId);
                  });
                  polylinesRef.current.set(trip.dsId, remainLine);

                  // Fit to remaining route + office
                  const remBounds = new google.maps.LatLngBounds();
                  const contextStart = Math.max(0, splitIdx - 3);
                  fullPath
                    .slice(contextStart)
                    .forEach((p) => remBounds.extend(p));
                  if (office)
                    remBounds.extend({ lat: office.lat, lng: office.lng });
                  if (!remBounds.isEmpty()) {
                    map.fitBounds(remBounds, {
                      top: 80,
                      right: 60,
                      bottom: 80,
                      left: 60,
                    });
                  }
                }
              } else {
                _drawFullPolyline();
              }
            } else {
              _drawFullPolyline();
            }

            function _drawFullPolyline() {
              const polyline = new google.maps.Polyline({
                path: fullPath,
                strokeColor: color,
                strokeOpacity: lineOpacity,
                strokeWeight,
                map,
                zIndex: zBase,
                clickable: true,
                icons: isActiveTrip
                  ? [{ icon: arrowSymbol, offset: "0%", repeat: "90px" }]
                  : undefined,
              });
              polyline.addListener("click", () => {
                closePopup();
                onTripSelect?.(trip.dsId);
              });
              polylinesRef.current.set(trip.dsId, polyline);
            }
          } catch (e) {
            console.warn(`Polyline decode failed for trip ${trip.dsId}`, e);
          }
        }

        // ── Stop pin markers ──────────────────────────────────────────────────
        trip.stops.forEach((stop) => {
          const firstPax = stop.passengers[0];
          if (!firstPax) return;

          const position = { lat: firstPax.lat, lng: firstPax.lng };
          allBounds.extend(position);

          let markerIcon: google.maps.Icon;
          let markerZIndex = zBase + stop.stopOrder + 10;

          // if (isStopFocus && selectedStopOrder != null) {
          //   if (stop.stopOrder === selectedStopOrder) {
          //     markerIcon = selectedStopPinIcon(stop.stopOrder, color);
          //     markerZIndex = 200;
          //   } else if (stop.stopOrder < selectedStopOrder) {
          //     markerIcon = stopPinIcon(stop.stopOrder, color, 0.22);
          //   } else {
          //     markerIcon = stopPinIcon(stop.stopOrder, color, 1);
          //   }
          // } else if (!isActiveTrip) {
          //   markerIcon = stopPinIcon(stop.stopOrder, color, 0.25);
          // } else {
          //   markerIcon = stopPinIcon(stop.stopOrder, color, 1);
          // }

          if (isStopFocus && selectedStopOrder != null) {
            if (stop.stopOrder === selectedStopOrder) {
              markerIcon = selectedStopPinIcon(stop.stopOrder, color);
              markerZIndex = 200;
            } else if (tripType === "logout") {
              // Higher stopOrder = already visited (visited before selected in logout route)
              markerIcon = stopPinIcon(
                stop.stopOrder,
                color,
                stop.stopOrder > selectedStopOrder ? 0.22 : 1,
              );
            } else {
              // Lower stopOrder = already picked up (login route ascends toward office)
              markerIcon = stopPinIcon(
                stop.stopOrder,
                color,
                stop.stopOrder < selectedStopOrder ? 0.22 : 1,
              );
            }
          } else if (!isActiveTrip) {
            markerIcon = stopPinIcon(stop.stopOrder, color, 0.25);
          } else {
            markerIcon = stopPinIcon(stop.stopOrder, color, 1);
          }

          const marker = new google.maps.Marker({
            map,
            position,
            icon: markerIcon,
            title: `Stop ${stop.stopOrder} · ${stop.passengers.length} pax`,
            zIndex: markerZIndex,
            optimized: false,
          });

          // Marker click — open popup without calling onStopSelect
          // (onStopSelect triggers re-render → _clearOverlays → popup destroyed)
          marker.addListener("click", () => {
            closePopup();
            const PopupClass = getPopupClass();
            const popup = new PopupClass(
              marker.getPosition()!,
              buildPopupHtml(stop, trip, color),
              closePopup,
            );
            popup.setMap(map);
            customPopupRef.current = popup;
          });

          markersRef.current.push(marker);

          // Auto-open popup when this stop is selected from the sidebar
          // Must be INSIDE stops.forEach so stop/marker/trip/color are in scope
          //   if (
          //     isActiveTrip &&
          //     selectedStopOrder != null &&
          //     stop.stopOrder === selectedStopOrder
          //   ) {
          //     const PopupClass = getPopupClass();
          //     const popup = new PopupClass(
          //       marker.getPosition()!,
          //       buildPopupHtml(stop, trip, color),
          //       closePopup,
          //     );
          //     popup.setMap(map);
          //     customPopupRef.current = popup;
          //   }
        });
      });

      // Fit all bounds when no stop is selected
      if (!selectedStopOrder && !allBounds.isEmpty()) {
        map.fitBounds(allBounds, { top: 70, right: 50, bottom: 70, left: 50 });
      }
    },
    [_clearOverlays, closePopup],
  );

  // ── focusTrip ───────────────────────────────────────────────────────────────
  const focusTrip = useCallback((tripId: number) => {
    const p = polylinesRef.current.get(tripId);
    if (!p || !mapRef.current) return;
    const b = new google.maps.LatLngBounds();
    p.getPath().forEach((pt) => b.extend(pt));
    if (!b.isEmpty()) mapRef.current.fitBounds(b, 70);
  }, []);

  // ── fitAll ──────────────────────────────────────────────────────────────────
  const fitAll = useCallback(() => {
    if (!mapRef.current || !boundsRef.current || boundsRef.current.isEmpty())
      return;
    mapRef.current.fitBounds(boundsRef.current, {
      top: 70,
      right: 50,
      bottom: 70,
      left: 50,
    });
  }, []);

  return { setMap, renderShuttle, focusTrip, fitAll };
}
