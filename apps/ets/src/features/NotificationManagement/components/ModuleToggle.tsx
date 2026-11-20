import React from "react";
import { TAB_OPTIONS } from "../constants/notificationManagementConstants";
import type { NotificationManagementTab } from "../types/notificationManagement.types";

interface ModuleToggleProps {
  value: NotificationManagementTab;
  onChange: (tab: NotificationManagementTab) => void;
}

// Pill toggle, same look as the App Control page tabs.
const ModuleToggle: React.FC<ModuleToggleProps> = ({ value, onChange }) => (
  <div
    role="tablist"
    style={{
      display: "inline-flex",
      background: "#f3f4f6",
      borderRadius: 16,
      padding: 5,
      gap: 2,
      maxWidth: "100%",
      overflowX: "auto",
    }}
  >
    {TAB_OPTIONS.map((opt) => {
      const selected = value === opt.key;
      return (
        <button
          key={opt.key}
          type="button"
          role="tab"
          aria-selected={selected}
          onClick={() => onChange(opt.key)}
          style={{
            padding: "4px 14px",
            borderRadius: 16,
            border: "none",
            background: selected ? "#3E9B73" : "transparent",
            color: selected ? "#fff" : "#6b7280",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: selected ? 600 : 400,
            boxShadow: selected ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            fontFamily: "inherit",
            transition: "all 0.15s",
            whiteSpace: "nowrap",
          }}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

export default ModuleToggle;
