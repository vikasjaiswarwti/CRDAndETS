import { Checkbox } from "antd";
import { LocationEditIcon, Phone } from "lucide-react";
import { T } from "../constants/designTokens";
import type { Passenger } from "../types/apiRouteTypes";
import { CircleIconButton } from "./CircleIconButton";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
// components/shuttle/ShuttleIcons.tsx

interface PassengerRowProps {
  passenger: Passenger;
  onLocationClick: (passenger: Passenger) => void;
  onCallClick: (passenger: Passenger) => void;
  onCheckToggle: (passengerId: string, checked: boolean) => void;
}

export function PassengerRowShuttle({
  passenger,
  onLocationClick,
  onCallClick,
  onCheckToggle,
}: PassengerRowProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        // padding: "4px 0",
        borderBottom: `0.2px solid ${T.muted}`,
      }}
    >
      <Checkbox
        checked={passenger.isChecked}
        style={{
          transform: "scale(0.7)",
          transformOrigin: "left center",
        }}
        onChange={(e: CheckboxChangeEvent) =>
          onCheckToggle(passenger.id, e.target.checked)
        }
      />

      <span style={{ flex: 1, fontSize: 10, fontWeight: 600, color: T.text }}>
        {passenger.name}
      </span>

      {passenger.gender === "F" && (
        <span style={{ color: "#ec4899", fontSize: 10 }}>♀</span>
      )}

      <span style={{ fontSize: 10, color: T.muted }}>
        Emp ID-{passenger.empId}
      </span>

      {/* ✅ CircleIconButton — not the existing IconButton */}
      <CircleIconButton
        variant="danger"
        icon={LocationEditIcon}
        onClick={() => onLocationClick(passenger)}
        title="Track location"
      />

      <CircleIconButton
        variant="success"
        icon={Phone}
        onClick={() => onCallClick(passenger)}
        title="Call passenger"
      />
    </div>
  );
}
