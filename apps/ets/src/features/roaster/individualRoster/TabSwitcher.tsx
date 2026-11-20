// src/features/individualRoster/components/TabSwitcher.tsx

import React from "react";
import type { Tab } from "../types/scheduleView.types";
import { COLORS } from "../constants/Rosterconstants";

interface TabSwitcherProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

const TabSwitcher: React.FC<TabSwitcherProps> = ({ activeTab, onChange }) => (
  <div
    style={{
      display: "inline-flex",
      background: "#f3f4f6",
      borderRadius: 10,
      padding: 3,
      gap: 3,
    }}
  >
    {(["LOGIN", "LOGOUT"] as Tab[]).map((tab) => {
      const active = activeTab === tab;
      return (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          style={{
            padding: "6px 22px",
            borderRadius: 8,
            border: "none",
            background: active ? "#fff" : "transparent",
            color: active ? COLORS.primaryDark : COLORS.textMuted,
            fontSize: 12,
            fontWeight: active ? 700 : 500,
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: active ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
            transition: "all 0.15s ease",
          }}
        >
          {tab === "LOGIN" ? "Login" : "Logout"}
        </button>
      );
    })}
  </div>
);

export default TabSwitcher;
