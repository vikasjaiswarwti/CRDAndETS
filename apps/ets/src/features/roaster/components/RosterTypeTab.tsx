import { memo } from "react";

type RosterType = "LOGIN" | "LOGOUT" | "BOTH";

import { COLORS } from "../constants/Rosterconstants";

const C = {
  tabBg: "#EEF3F0",
  tabActiveBg: "#fff",
  lightBorder: COLORS.border,
  primaryDark: COLORS.primaryDark,
} as const;

interface RosterTypeTabsProps {
  value: RosterType;
  onChange: (v: RosterType) => void;
}

const RosterTypeTabs = memo(function RosterTypeTabs({
  value,
  onChange,
}: RosterTypeTabsProps) {
  return (
    <div
      style={{
        display: "inline-flex",
        background: C.tabBg,
        borderRadius: 999,
        padding: 4,
        marginBottom: 14,
        gap: 0,
      }}
    >
      {(["LOGIN", "LOGOUT", "BOTH"] as RosterType[]).map((type) => {
        const active = value === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            style={{
              padding: "9px 44px",
              borderRadius: 999,
              border: active
                ? `1.5px solid ${C.lightBorder}`
                : "1.5px solid transparent",
              background: active ? C.tabActiveBg : "transparent",
              color: C.primaryDark,
              fontSize: 14,
              fontWeight: active ? 600 : 500,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.18s ease",
              boxShadow: active ? "0 1px 6px rgba(27,67,50,0.10)" : "none",
              whiteSpace: "nowrap",
              letterSpacing: "0.01em",
            }}
          >
            {type === "LOGIN" ? "Login" : type === "LOGOUT" ? "Logout" : "Both"}
          </button>
        );
      })}
    </div>
  );
});

export default RosterTypeTabs;
