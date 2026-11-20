// components/shuttle/TripSelectionBar.tsx

import { T } from "../constants/designTokens";
import type { ShuttleTripHeaderInfo } from "../types/apiRouteTypes";


interface TripSelectionBarProps {
  tripInfo: ShuttleTripHeaderInfo;
  onAddUser: () => void;
  onSelectionToggle?: (isSelected: boolean) => void;
}

function CheckIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#ffffff"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

export function TripSelectionBar({
  tripInfo,
  onAddUser,
  onSelectionToggle,
}: TripSelectionBarProps) {
  const { tripId, isSelected } = tripInfo;

  const handleCheckboxClick = () => {
    onSelectionToggle?.(!isSelected);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "#ffffff",
        border: `0.5px solid ${T.border}`,
        borderRadius: 10,
        padding: "10px 14px",
        marginBottom: 2,
      }}
    >
      {/* ── Checkbox ── */}
      <button
        onClick={handleCheckboxClick}
        title={isSelected ? "Deselect shuttle" : "Select shuttle"}
        style={{
          width: 12,
          height: 12,
          borderRadius: 5,
          backgroundColor: isSelected ? "#1d4ed8" : "#ffffff",
          border: isSelected ? "none" : `1.5px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: onSelectionToggle ? "pointer" : "default",
          flexShrink: 0,
          padding: 0,
          transition: "background-color 0.15s ease",
        }}
      >
        {isSelected && <CheckIcon />}
      </button>

      {/* ── Label ── */}
      <span
        style={{
          fontSize: 8,
          fontWeight: 700,
          color: T.text,
        //   letterSpacing: 0.5,
        //   flex: 1,
        //   whiteSpace: "nowrap",
        }}
      >
        SELECTED SHUTTLE
      </span>

      {/* ── Trip ID ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontSize: 9,
          fontWeight: 600,
          color: T.text,
          whiteSpace: "nowrap",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "#1d4ed8",
            flexShrink: 0,
          }}
        />
        <span>Trip ID {tripId}</span>
      </div>

      {/* ── Divider ── */}
      <div
        style={{
          width: 1,
          height: 14,
          background: T.border,
          flexShrink: 0,
        }}
      />

      {/* ── Add User ── */}
      <button
        onClick={onAddUser}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 9,
          fontWeight: 600,
          color: "#1d4ed8",
          border: "1.5px solid #1d4ed8",
          borderRadius: 999,
          padding: "3px 6px",
          cursor: "pointer",
          background: "none",
          whiteSpace: "nowrap",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#eff6ff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "none";
        }}
      >
        <PlusIcon />
        Add User
      </button>
    </div>
  );
}