// ─── map/useRouteMap.ts ───────────────────────────────────────────────────────

import { useRef, useCallback } from "react";
import type { RouteData } from "./routeMap.types";
import { MAP_ENGINE_CONFIG } from "./Mapengineconfig";
import {
  createNumberedMarkerIcon,
  createHighlightedMarkerIcon,
} from "./markerIcons";
import { fitMapToRoutes, fitMapToRoute } from "./mapBounds";

const {
  POLYLINE_WEIGHT,
  POLYLINE_WEIGHT_FOCUSED,
  POLYLINE_OPACITY,
  POLYLINE_OPACITY_DIMMED,
  POLYLINE_OPACITY_FOCUSED,
} = MAP_ENGINE_CONFIG;

// ─── Lazy popup class factory ─────────────────────────────────────────────────
// google.maps is NOT available at module load time — only after APIProvider
// mounts. We defer the class definition until first use inside renderRoutes.

type PopupInstance = google.maps.OverlayView & {
  updatePosition: (p: google.maps.LatLng) => void;
};

type PopupConstructor = new (
  position: google.maps.LatLng,
  content: string,
  onClose: () => void,
) => PopupInstance;

let _PopupClass: PopupConstructor | null = null;

function getPopupClass(): PopupConstructor {
  if (_PopupClass) return _PopupClass;

  _PopupClass = class extends google.maps.OverlayView {
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
        transform:translate(-50%,calc(-100% - 14px));
        background:#fff;
        border-radius:10px;
        box-shadow:0 8px 24px rgba(0,0,0,0.13),0 2px 6px rgba(0,0,0,0.08);
        border:1px solid #e5e7eb;
        font-family:system-ui,sans-serif;
        min-width:160px;
        max-width:210px;
        pointer-events:auto;
        z-index:9999;
        animation:popIn 0.15s ease;
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

      // Red close button
      const closeBtn = document.createElement("button");
      closeBtn.innerHTML = "×";
      closeBtn.style.cssText = `
        position:absolute;
        top:5px;
        right:6px;
        width:16px;
        height:16px;
        border-radius:50%;
        background:#fee2e2;
        color:#ef4444;
        border:none;
        cursor:pointer;
        font-size:13px;
        line-height:1;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:0;
        font-weight:700;
      `;
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        onClose();
      });

      // Content body
      const body = document.createElement("div");
      body.style.cssText = "padding:10px 24px 10px 12px;";
      body.innerHTML = content;

      this.container.appendChild(arrow);
      this.container.appendChild(closeBtn);
      this.container.appendChild(body);

      // Inject animation keyframe once into document
      if (!document.getElementById("custom-map-popup-style")) {
        const style = document.createElement("style");
        style.id = "custom-map-popup-style";
        style.textContent = `
          @keyframes popIn {
            from { opacity:0; transform:translate(-50%,calc(-100% - 20px)); }
            to   { opacity:1; transform:translate(-50%,calc(-100% - 14px)); }
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

  return _PopupClass;
}

// ─── Public interface ─────────────────────────────────────────────────────────

export interface UseRouteMapReturn {
  setMap: (map: google.maps.Map | null) => void;
  renderRoutes: (
    routes: RouteData[],
    onRouteSelect?: (routeId: string) => void,
    office?: { lat: number; lng: number; name: string },
  ) => void;
  focusRoute: (routeId: string) => void;
  focusMultipleRoutes: (routeIds: string[]) => void;
  clearFocus: () => void;
  fitAllRoutes: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useRouteMap(): UseRouteMapReturn {
  const mapRef = useRef<google.maps.Map | null>(null);
  const customPopupRef = useRef<PopupInstance | null>(null);
  const routesSnapshotRef = useRef<RouteData[]>([]);
  const officeMarkerRef = useRef<google.maps.Marker | null>(null);
  const polylinesRef = useRef<Map<string, google.maps.Polyline>>(new Map());
  const markersRef = useRef<Map<string, google.maps.Marker[]>>(new Map());

  // ── closePopup ─────────────────────────────────────────────────────────────
  const closePopup = useCallback(() => {
    if (customPopupRef.current) {
      customPopupRef.current.setMap(null);
      customPopupRef.current = null;
    }
  }, []);

  // ── setMap ─────────────────────────────────────────────────────────────────
  const setMap = useCallback(
    (map: google.maps.Map | null) => {
      if (!map) {
        polylinesRef.current.forEach((p) => p.setMap(null));
        polylinesRef.current.clear();
        markersRef.current.forEach((ms) => ms.forEach((m) => m.setMap(null)));
        markersRef.current.clear();
        closePopup();
        mapRef.current = null;
        return;
      }
      mapRef.current = map;
    },
    [closePopup],
  );

  // ── _clearOverlays ─────────────────────────────────────────────────────────
  const _clearOverlays = useCallback(() => {
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current.clear();
    markersRef.current.forEach((ms) => ms.forEach((m) => m.setMap(null)));
    markersRef.current.clear();
    closePopup();
    officeMarkerRef.current?.setMap(null);
    officeMarkerRef.current = null;
  }, [closePopup]);

  // ── renderRoutes ───────────────────────────────────────────────────────────
  const renderRoutes = useCallback(
    (
      routes: RouteData[],
      onRouteSelect?: (routeId: string) => void,
      office?: { lat: number; lng: number; name: string },
    ) => {
      const map = mapRef.current;
      if (!map) return;

      _clearOverlays();
      routesSnapshotRef.current = routes;

      for (const route of routes) {
        // Polyline
        const polyline = new google.maps.Polyline({
          path: route.path,
          map,
          strokeColor: route.color,
          strokeWeight: POLYLINE_WEIGHT,
          strokeOpacity: POLYLINE_OPACITY,
          geodesic: true,
          zIndex: 2,
        });

        if (onRouteSelect) {
          polyline.addListener("click", () => onRouteSelect(route.routeId));
        }
        polylinesRef.current.set(route.routeId, polyline);

        // Stop markers — hidden by default, shown on focusRoute
        const routeMarkers: google.maps.Marker[] = [];

        for (const emp of route.employees) {
          // console.log("emp from route hook", emp);

          const marker = new google.maps.Marker({
            position: { lat: emp.lat, lng: emp.lng },
            map: null,
            icon: createNumberedMarkerIcon(emp.stopOrder, route.color),
            title: `${emp.stopOrder}. ${emp.employeeName}`,
            zIndex: 3,
          });

          marker.addListener("click", () => {
            // onRouteSelect?.(route.routeId);
            closePopup();

            const pickupTime = emp.estimatedPickupTime
              ? new Date(emp.estimatedPickupTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null;

            // const hasExtra = emp.employeeId || emp.address || pickupTime;
            // const content = `
            //   <div style="display:flex;align-items:center;gap:6px;margin-bottom:${hasExtra ? "8" : "0"}px">
            //     <div style="width:20px;height:20px;border-radius:50%;background:${route.color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0">${emp.stopOrder}</div>
            //     <span style="font-size:12px;font-weight:700;color:#111;line-height:1.3">${emp.employeeName || "—"}</span>
            //   </div>
            //   ${emp.employeeId ? `<div style="font-size:10px;color:#6B7280;margin-bottom:3px">ID: ${emp.employeeId}</div>` : ""}
            //   ${emp.address ? `<div style="font-size:10px;color:#374151;margin-bottom:3px;line-height:1.4">${emp.address.split(",").slice(0, 2).join(",")}</div>` : ""}
            //   ${pickupTime ? `<div style="font-size:10px;color:#374151;font-weight:600">🕐 ${pickupTime}</div>` : ""}
            // `;

            const hasExtra = emp.employeeId || emp.address || pickupTime;
            const content = `
  <div style="display:flex;align-items:center;gap:8px;padding-bottom:${hasExtra ? "8px" : "0"};margin-bottom:${hasExtra ? "8px" : "0"};border-bottom:${hasExtra ? "1px solid #f3f4f6" : "none"}">
    <div style="width:24px;height:24px;border-radius:50%;background:${route.color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;box-shadow:0 2px 4px ${route.color}55">${emp.stopOrder}</div>
    <div>
      <div style="font-size:12px;font-weight:700;color:#111;line-height:1.3">${emp.employeeName || "—"}</div>
      <div style="font-size:9px;color:#9ca3af;font-weight:500;margin-top:1px;text-transform:uppercase;letter-spacing:0.04em">Stop ${emp.stopOrder}</div>
    </div>
  </div>
  ${
    emp.employeeId
      ? `
  <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
    <span style="font-size:10px;color:#6b7280">${emp.employeeId}</span>
  </div>`
      : ""
  }
 
  ${
    emp.gender
      ? `
<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
  <span style="font-size:11px">${emp.gender === "Female" ? "👩" : "👤"}</span>
  <span style="font-size:10px;color:#6b7280">${emp.gender === "Female" ? "Female" : "Male"}</span>
</div>`
      : ""
  }

  ${
    emp.address
      ? `
  <div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:5px">
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" style="flex-shrink:0;margin-top:1px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
    <span style="font-size:10px;color:#374151;line-height:1.4">${emp.address.split(",").slice(0, 2).join(",").trim()}</span>
  </div>`
      : ""
  }
  ${
    pickupTime
      ? `
  <div style="display:flex;align-items:center;gap:6px;margin-top:${emp.address ? "0" : "0"}">
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    <span style="font-size:10px;color:#374151;font-weight:600">${pickupTime}</span>
  </div>`
      : ""
  }
`;

            const PopupClass = getPopupClass();
            const popup = new PopupClass(
              marker.getPosition()!,
              content,
              closePopup,
            );
            popup.setMap(map);
            customPopupRef.current = popup;
          });

          routeMarkers.push(marker);
        }

        markersRef.current.set(route.routeId, routeMarkers);
      }

      // Close popup on map background click
      map.addListener("click", () => closePopup());

      // Office marker
      if (office) {
        officeMarkerRef.current = new google.maps.Marker({
          position: { lat: office.lat, lng: office.lng },
          map,
          title: office.name,
          zIndex: 20,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
              `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="40" viewBox="0 0 36 40">
                <rect x="2" y="2" width="32" height="32" rx="6" fill="#1B4332" stroke="#fff" stroke-width="2"/>
                <text x="18" y="23" font-size="18" text-anchor="middle" fill="white">🏢</text>
                <polygon points="12,34 24,34 18,40" fill="#1B4332"/>
              </svg>`,
            )}`,
            scaledSize: new google.maps.Size(36, 40),
            anchor: new google.maps.Point(18, 40),
          },
        });

        officeMarkerRef.current.addListener("click", () => {
          closePopup();
          const PopupClass = getPopupClass();
          const popup = new PopupClass(
            officeMarkerRef.current!.getPosition()!,
            `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
   <div style="width:28px;height:28px;border-radius:6px;background:#1B4332;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">🏢</div>
   <div>
     <div style="font-size:12px;font-weight:700;color:#1B4332">Office</div>
     <div style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.04em">Destination</div>
   </div>
 </div>
 <div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:6px">
   <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" style="flex-shrink:0;margin-top:1px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
   <span style="font-size:10px;color:#374151;line-height:1.4">${office.name}</span>
 </div>`,
            closePopup,
          );
          popup.setMap(map);
          customPopupRef.current = popup;
        });
      }

      fitMapToRoutes(map, routes);
    },
    [_clearOverlays, closePopup],
  );

  // ── focusRoute ─────────────────────────────────────────────────────────────
  const focusRoute = useCallback((routeId: string) => {
    const map = mapRef.current;
    if (!map) return;

    polylinesRef.current.forEach((polyline, id) => {
      const isFocused = id === routeId;
      polyline.setOptions({
        strokeWeight: isFocused ? POLYLINE_WEIGHT_FOCUSED : POLYLINE_WEIGHT,
        strokeOpacity: isFocused
          ? POLYLINE_OPACITY_FOCUSED
          : POLYLINE_OPACITY_DIMMED,
        zIndex: isFocused ? 10 : 2,
      });
    });

    markersRef.current.forEach((markers, id) => {
      const isFocused = id === routeId;
      const route = routesSnapshotRef.current.find((r) => r.routeId === id);
      markers.forEach((marker, idx) => {
        const emp = route?.employees[idx];
        if (!emp || !route) return;
        if (isFocused) {
          marker.setIcon(
            createHighlightedMarkerIcon(emp.stopOrder, route.color),
          );
          marker.setOpacity(1.0);
          marker.setMap(mapRef.current);
        } else {
          marker.setMap(null);
        }
      });
    });

    const focusedRoute = routesSnapshotRef.current.find(
      (r) => r.routeId === routeId,
    );
    if (focusedRoute) fitMapToRoute(map, focusedRoute);
  }, []);

  // ── focusMultipleRoutes ────────────────────────────────────────────────────
  const focusMultipleRoutes = useCallback((routeIds: string[]) => {
    const map = mapRef.current;
    if (!map) return;

    const focusedSet = new Set(routeIds);

    polylinesRef.current.forEach((polyline, id) => {
      const isFocused = focusedSet.has(id);
      polyline.setOptions({
        strokeWeight: isFocused ? POLYLINE_WEIGHT_FOCUSED : POLYLINE_WEIGHT,
        strokeOpacity: isFocused
          ? POLYLINE_OPACITY_FOCUSED
          : POLYLINE_OPACITY_DIMMED,
        zIndex: isFocused ? 10 : 2,
      });
    });

    markersRef.current.forEach((markers, id) => {
      const isFocused = focusedSet.has(id);
      const route = routesSnapshotRef.current.find((r) => r.routeId === id);
      markers.forEach((marker, idx) => {
        const emp = route?.employees[idx];
        if (!emp || !route) return;
        if (isFocused) {
          marker.setIcon(
            createHighlightedMarkerIcon(emp.stopOrder, route.color),
          );
          marker.setOpacity(1.0);
          marker.setMap(mapRef.current);
        } else {
          marker.setMap(null);
        }
      });
    });
  }, []);

  // ── clearFocus ─────────────────────────────────────────────────────────────
  const clearFocus = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    polylinesRef.current.forEach((polyline) => {
      polyline.setOptions({
        strokeWeight: POLYLINE_WEIGHT,
        strokeOpacity: POLYLINE_OPACITY,
        zIndex: 2,
      });
    });

    markersRef.current.forEach((markers) => {
      markers.forEach((marker) => marker.setMap(null));
    });

    fitMapToRoutes(map, routesSnapshotRef.current);
  }, []);

  // ── fitAllRoutes ───────────────────────────────────────────────────────────
  const fitAllRoutes = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    fitMapToRoutes(map, routesSnapshotRef.current);
  }, []);

  return {
    setMap,
    renderRoutes,
    focusRoute,
    focusMultipleRoutes,
    clearFocus,
    fitAllRoutes,
  };
}
