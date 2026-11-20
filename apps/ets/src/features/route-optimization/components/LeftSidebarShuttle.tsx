import { useEffect, useState } from "react";
import { T } from "../constants/designTokens";
import { ShuttleStopCard } from "./ShuttleStopCard";
import type { ShuttleTripHeaderInfo } from "../types/apiRouteTypes";
import { TripSelectionBar } from "./TripSelectionBar";

export type Gender = "M" | "F" | "Other";

export interface Passenger {
  id: string;
  name: string;
  empId: string;
  gender?: Gender;
  isChecked: boolean;
}

// components/shuttle/ShuttleStopList.tsx
export interface ShuttleStop {
  id: string;
  stopNumber: number;
  stopName: string;
  address: string;
  passengerCount: number;
  distanceKms: number;
  eta: string;
  passengers: Passenger[];
}

interface LeftSidebarShuttleProps {
  tripInfo: ShuttleTripHeaderInfo;
  stops: ShuttleStop[];
  onAddUser: () => void;
  onLocationClick: (passenger: Passenger) => void;
  onCallClick: (passenger: Passenger) => void;
  onPassengerCheckToggle: (
    stopId: string,
    passengerId: string,
    checked: boolean,
  ) => void;
  selectedStopOrder?: number | null; // ← ADD THIS
  onStopSelect?: (stopNumber: number) => void; // ← ADD
}

function LeftSidebarShuttle({
  tripInfo,
  stops,
  onAddUser,
  onLocationClick,
  onCallClick,
  onPassengerCheckToggle,
  selectedStopOrder,
  onStopSelect,
}: LeftSidebarShuttleProps) {
  const [expandedStopId, setExpandedStopId] = useState<string | null>(
    stops[0]?.id ?? null, // first stop expanded by default
  );

  const handleToggle = (stopId: string) => {
    setExpandedStopId((prev) => (prev === stopId ? null : stopId));
  };

  // Add after the existing useState
  useEffect(() => {
    if (selectedStopOrder != null) {
      const match = stops.find((s) => s.stopNumber === selectedStopOrder);
      if (match) setExpandedStopId(match.id);
    }
  }, [selectedStopOrder, stops]);

  return (
    // <div style={{ padding: 6 }}>
    <div
      style={{
        padding: 6,
        background: "#F3F4F6",
        height: "100%",
        overflowY: "auto",
      }}
    >
      <TripSelectionBar tripInfo={tripInfo} onAddUser={onAddUser} />

      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: T.muted,
          letterSpacing: 0.8,
          margin: "6px 0 6px 2px",
        }}
      >
        SHUTTLE STOPS
      </p>

      <div
        style={{
          overflowY: "auto",
          maxHeight: "65vh", // adjust 180px to match your header + TripSelectionBar height
          paddingRight: 4, // prevents scrollbar from clipping card shadow
        }}
      >
        {stops.map((stop) => (
          <ShuttleStopCard
            key={stop.id}
            stop={stop}
            isExpanded={expandedStopId === stop.id}
            isSelected={selectedStopOrder === stop.stopNumber}
            onToggle={handleToggle}
            onSelect={onStopSelect}
            onLocationClick={onLocationClick}
            onCallClick={onCallClick}
            onPassengerCheckToggle={onPassengerCheckToggle}
          />
        ))}
      </div>
    </div>
  );
}
export default LeftSidebarShuttle;

// ----------- Passenger
// components/shuttle/PassengerRow.tsx
