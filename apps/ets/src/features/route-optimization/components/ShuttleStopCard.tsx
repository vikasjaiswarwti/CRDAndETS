import { T } from "../constants/designTokens";
import type { Passenger, ShuttleStop } from "../types/apiRouteTypes";
import { PassengerRowShuttle } from "./PassengerRowShuttle";
import { StopMetaBadge } from "./StopMetaBadge";
import { StopNumberBadge } from "./StopNumberBadge";

interface ShuttleStopCardProps {
  stop: ShuttleStop;
  isExpanded: boolean;
  onToggle: (stopId: string) => void;
  isSelected?: boolean;
  onSelect?: (stopNumber: number) => void; // ← ADD
  onLocationClick: (passenger: Passenger) => void;
  onCallClick: (passenger: Passenger) => void;
  onPassengerCheckToggle: (
    stopId: string,
    passengerId: string,
    checked: boolean,
  ) => void;
}

const ChevronIcon = ({ isExpanded }: { isExpanded: boolean }) => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#9ca3af"
    strokeWidth="2.5"
    strokeLinecap="round"
    style={{
      transition: "transform 0.2s ease",
      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
      flexShrink: 0,
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
// const STOP_COLORSShuttle = ["#1d4ed8", "#ea580c", "#d97706", "#dc2626"];

export function ShuttleStopCard({
  stop,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
  onLocationClick,
  onCallClick,
  onPassengerCheckToggle,
}: ShuttleStopCardProps) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 6,
        marginBottom: 10,
        border: isSelected ? "1.5px solid #3B82F6" : `1px solid ${T.border}`,
        boxShadow: isSelected ? "0 0 0 3px rgba(59,130,246,0.12)" : "none",
        overflow: "hidden",
      }}
    >
      {/* ── Header — only this row is the toggle button ── */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onToggle(stop.id)}
        onKeyDown={(e) => e.key === "Enter" && onToggle(stop.id)}
        style={{ padding: "8px 10px 6px", cursor: "pointer" }}
      >
        {/* Row 1: checkbox · stop number · name · chevron */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <input
            type="checkbox"
            checked={!!isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect?.(stop.stopNumber);
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              cursor: "pointer",
              accentColor: "#3B82F6",
              width: 14,
              height: 14,
              flexShrink: 0,
            }}
          />
          <StopNumberBadge number={stop.stopNumber} />
          <p
            style={{
              flex: 1,
              fontSize: 11,
              fontWeight: 700,
              color: T.text,
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              // whiteSpace: "nowrap",
            }}
          >
            {stop.address}
          </p>
          <ChevronIcon isExpanded={isExpanded} />
        </div>

        {/* Row 2: address — left-padded to align under the stop name */}
        <p
          style={{
            fontSize: 10,
            color: T.muted,
            margin: "4px 0 0",
            paddingLeft: 46, // checkbox(14) + gap(8) + badge(~16) + gap(8)
            lineHeight: 1.3,
          }}
        ></p>
      </div>

      {/* ── Passengers panel — outside button so clicks don't fire toggle ── */}
      {isExpanded && (
        <div
          style={{
            borderTop: `1px solid ${T.border}`,
            padding: "8px 10px",
          }}
        >
          <p
            style={{
              fontSize: 9,
              fontWeight: 600,
              color: T.muted,
              letterSpacing: 0.8,
              marginBottom: 8,
              marginTop: 0,
            }}
          >
            PASSENGERS
          </p>
          {stop.passengers.map((passenger) => (
            <PassengerRowShuttle
              key={passenger.id}
              passenger={passenger}
              onLocationClick={onLocationClick}
              onCallClick={onCallClick}
              onCheckToggle={(pId, checked) =>
                onPassengerCheckToggle(stop.id, pId, checked)
              }
            />
          ))}
        </div>
      )}

      {/* ── Meta footer — always visible ── */}
      <div
        style={{
          borderTop: `1px solid ${T.border}`,
          padding: "6px 10px",
        }}
      >
        <StopMetaBadge
          pax={stop.passengerCount}
          distanceKms={stop.distanceKms}
          eta={stop.eta}
        />
      </div>
    </div>
  );
}
