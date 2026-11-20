import React from "react";
import { T } from "../constants/Designtokens";

interface Props {
  onCallDriver: () => void;
  onCallEmployee: () => void;
}

export const FloatingActionBar: React.FC<Props> = ({ onCallDriver, onCallEmployee }) => {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <button
        onClick={onCallDriver}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: T.danger,
          color: "#fff",
          border: "none",
          borderRadius: 24,
          padding: "10px 20px",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(239,68,68,0.35)",
        }}
      >
        <PhoneIcon /> Call Driver
      </button>
      <button
        onClick={onCallEmployee}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: T.warning,
          color: "#fff",
          border: "none",
          borderRadius: 24,
          padding: "10px 20px",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(245,158,11,0.35)",
        }}
      >
        <PhoneIcon /> Call Employee
      </button>
    </div>
  );
};

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path
      d="M3 3.5C3 2.67 3.67 2 4.5 2h1.38a.5.5 0 01.49.4l.6 2.98a.5.5 0 01-.15.47L5.5 7.1a9.09 9.09 0 004.4 4.4l1.25-1.32a.5.5 0 01.47-.15l2.98.6a.5.5 0 01.4.49V12.5A1.5 1.5 0 0113.5 14C7.7 14 2 8.3 2 2.5"
      stroke="#fff"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);