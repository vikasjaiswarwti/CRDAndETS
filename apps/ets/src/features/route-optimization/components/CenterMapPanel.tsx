// src/features/route-maker/components/CenterMapPanel.tsx

import { useMemo, useEffect, useRef } from "react";
import type { VehicleRoute } from "../types/Routemaker.types";
import EfficiencyLegend from "./EfficiencyLegend";
import { APIProvider } from "@vis.gl/react-google-maps";
import RouteMap, { type RouteMapHandle } from "../map/RouteMap";
import {
  adaptVehicleRoutes,
  invalidateAdapterCache,
} from "../utils/vehicleRouteAdapter";

const API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ?? "";
const PUNE_CENTER = { lat: 18.5204, lng: 73.8567 };

interface Props {
  routes: VehicleRoute[];
  colorMap: Record<number, string>;
  activeVehicleId: number | null;
  mapRef: React.MutableRefObject<{
    renderRoutes: (r: VehicleRoute[], cm: Record<number, string>) => void;
    focusRoute: (id: number) => void;
    fitAllRoutes: () => void;
  } | null>;
  office?: { lat: number; lng: number; name: string };
  selectedVehicleIds: number[];
  // ADD to Props interface
  onRouteSelect?: (routeId: string) => void;
}

export default function CenterMapPanel({
  routes,
  colorMap,
  mapRef,
  office,
  selectedVehicleIds,
  onRouteSelect,
}: Props) {
  console.log("routes from Center map", routes);

  const innerRef = useRef<RouteMapHandle | null>(null);

  const routeData = useMemo(() => {
    invalidateAdapterCache(routes);
    return adaptVehicleRoutes(routes, colorMap);
  }, [routes, colorMap]);

  // ── Multi-select focus: highlight selected routes, dim the rest ──────────
  // useEffect(() => {
  //   if (selectedVehicleIds.length === 0) {
  //     innerRef.current?.clearFocus();
  //   } else {
  //     innerRef.current?.focusMultipleRoutes(selectedVehicleIds.map(String));
  //   }
  // }, [selectedVehicleIds]);

  // Re-apply focus after routeData rebuilds (after refetch/rearrange)
  // useEffect(() => {
  //   if (selectedVehicleIds.length === 0) return;
  //   const t = setTimeout(() => {
  //     innerRef.current?.focusMultipleRoutes(selectedVehicleIds.map(String));
  //   }, 100); // wait for renderRoutes to finish
  //   return () => clearTimeout(t);
  // }, [routeData]); // fires whenever routeData changes

  useEffect(() => {
    if (selectedVehicleIds.length === 0) {
      innerRef.current?.clearFocus();
      return;
    }
    const t = setTimeout(() => {
      innerRef.current?.focusMultipleRoutes(selectedVehicleIds.map(String));
    }, 100);
    return () => clearTimeout(t);
  }, [selectedVehicleIds, routeData]);

  // ── Wire the external mapRef the page uses ───────────────────────────────
  useEffect(() => {
    mapRef.current = {
      renderRoutes: (_r, _cm) => innerRef.current?.fitAllRoutes(),
      focusRoute: (id: number) => innerRef.current?.focusRoute(String(id)),
      fitAllRoutes: () => innerRef.current?.fitAllRoutes(),
    };
  });

  return (
    <div
      style={{
        position: "relative",
        background: "#e8f0e8",
        overflow: "hidden",
        minHeight: 0,
        height: "100%",
        width: "100%",
      }}
    >
      <APIProvider apiKey={API_KEY} libraries={["geometry", "marker"]}>
        <RouteMap
          ref={innerRef}
          routes={routeData}
          office={office}
          defaultCenter={PUNE_CENTER}
          defaultZoom={12}
          style={{ width: "100%", height: "100%" }}
          mapOptions={{
            disableDefaultUI: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            zoomControl: true,
            cameraControl: false,
            clickableIcons: false,
          }}
          onRouteSelect={onRouteSelect}
        />
      </APIProvider>

      <EfficiencyLegend />

      {!API_KEY && (
        <div
          style={{
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
          }}
        >
          ⚠️ Set VITE_GOOGLE_MAPS_API_KEY in .env for live tiles
        </div>
      )}
    </div>
  );
}
