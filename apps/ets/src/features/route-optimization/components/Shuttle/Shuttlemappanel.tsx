// src/features/route-maker/components/ShuttleMapPanel.tsx
//
// Self-contained map panel for shuttle mode.
// Drop it in place of CenterMapPanel when vehicleMode === "shuttle".
//
// Does NOT use adaptVehicleRoutes / vehicleRouteAdapter — works directly
// from the raw ShuttleAnalyticsResponse so shuttle and cabs never share
// rendering logic.
//
// Behaviour:
//   • All trips visible; selected trip is full-colour, others dimmed
//   • Numbered stop markers (SVG circles) for each trip
//   • Click a stop marker → InfoWindow popup with passenger list
//   • Click a polyline → calls onTripSelect(tripId) (selects trip in parent)
//   • Office marker shown when office prop is provided

import { useEffect } from "react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import { useShuttleMap } from "./useShuttleMaphook";
import type { ShuttleAnalyticsResponse } from "../../types/Shuttleapitypes";

const API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ?? "";
const DEFAULT_CENTER = { lat: 18.5204, lng: 73.8567 };

// ─── Props ────────────────────────────────────────────────────────────────────

interface ShuttleMapPanelProps {
  /** Raw API response from shuttle-route-analytics */
  data: ShuttleAnalyticsResponse | undefined;
  /** Currently selected trip (highlights that trip, dims the rest) */
  selectedTripId: number | null;
  /**
   * Which stop order is currently selected in the left sidebar.
   * When set on the active trip, the map shows split route segments:
   *   • gray dim polyline before the stop
   *   • bright thick coloured polyline from the stop to office
   */
  selectedStopOrder?: number | null;
  /** Office pin */
  office?: { lat: number; lng: number; name: string };
  /** Called when user clicks a route polyline on the map */
  onTripSelect?: (tripId: number) => void;
  /** Called when user clicks a stop marker on the map */
  onStopSelect?: (stopOrder: number) => void;
  tripType?: "login" | "logout";
}

// ─── Inner component (must live inside <Map>) ─────────────────────────────────
// This is where the Google Maps API is accessible via useMap().

interface MapInnerProps {
  data: ShuttleAnalyticsResponse | undefined;
  selectedTripId: number | null;
  selectedStopOrder?: number | null;
  office?: ShuttleMapPanelProps["office"];
  onTripSelect?: (tripId: number) => void;
  onStopSelect?: (stopOrder: number) => void;
  tripType?: "login" | "logout";
}

function ShuttleMapInner({
  data,
  selectedTripId,
  selectedStopOrder,
  office,
  onTripSelect,
  onStopSelect,
  tripType,
}: MapInnerProps) {
  const map = useMap();
  const { setMap, renderShuttle } = useShuttleMap();

  // Wire map instance into the hook
  useEffect(() => {
    setMap(map);
    return () => setMap(null);
  }, [map, setMap]);

  // Re-draw whenever data or selection changes
  useEffect(() => {
    if (!map || !data?.trips?.length) return;
    renderShuttle(
      data.trips,
      selectedTripId,
      office,
      onTripSelect,
      selectedStopOrder,
      // onStopSelect,
      tripType,
    );
  }, [
    map,
    data,
    selectedTripId,
    selectedStopOrder,
    office,
    onTripSelect,
    onStopSelect,
    renderShuttle,
    tripType,
  ]);

  return null; // all rendering is imperative via useShuttleMap
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export default function ShuttleMapPanel({
  data,
  selectedTripId,
  selectedStopOrder,
  office,
  onTripSelect,
  onStopSelect,
  tripType,
}: ShuttleMapPanelProps) {
  // Start the map centered on the office if we have it
  const defaultCenter = office
    ? { lat: office.lat, lng: office.lng }
    : DEFAULT_CENTER;

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        height: "100%",
        width: "100%",
        background: "#e8f0e8",
        minHeight: 0,
      }}
    >
      <APIProvider apiKey={API_KEY} libraries={["geometry", "marker"]}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={12}
          disableDefaultUI={false}
          streetViewControl={false}
          mapTypeControl={false}
          fullscreenControl={true}
          zoomControl={true}
          clickableIcons={false}
          gestureHandling="greedy"
          style={{ width: "100%", height: "100%" }}
        >
          <ShuttleMapInner
            data={data}
            selectedTripId={selectedTripId}
            selectedStopOrder={selectedStopOrder}
            office={office}
            onTripSelect={onTripSelect}
            onStopSelect={onStopSelect}
            tripType={tripType}
          />
        </Map>
      </APIProvider>

      {/* No-API-key warning (mirrors CenterMapPanel) */}
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
