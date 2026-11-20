// ============================================================
// LockTypeTabs.tsx — Segmented lock-type selector (Cal Days /
// Day+Time / Weekly / Minutes).
//
// ⚠️  Tab changes are pure UI — no API call, no confirmation.
// Only actual value inputs trigger the confirmation workflow.
// ============================================================

import React, { useState } from "react";
import { CalendarDays, Clock, CalendarRange, Timer } from "lucide-react";

const PRIMARY = "#2563EB";
const BORDER = "#E5E7EB";
const BG_SEL = "#EFF6FF";
const BG_HOVER = "#F8FAFC";
const TEXT_PRI = "#111827";
const TEXT_SEC = "#6B7280";

export const LOCK_MODES = [
  { v: 1, label: "Cal Days", icon: <CalendarDays size={15} /> },
  { v: 2, label: "Day + Time", icon: <Clock size={15} /> },
  { v: 3, label: "Weekly", icon: <CalendarRange size={15} /> },
  { v: 4, label: "Minutes", icon: <Timer size={15} /> },
] as const;

interface LockTypeTabsProps {
  value: number;
  onChange: (mode: number) => void;
}

export const LockTypeTabs: React.FC<LockTypeTabsProps> = ({
  value,
  onChange,
}) => {
  const [hoverMode, setHoverMode] = useState<number | null>(null);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 8,
      }}
    >
      {LOCK_MODES.map((m) => {
        const sel = value === m.v;
        const hov = hoverMode === m.v && !sel;
        return (
          <button
            key={m.v}
            onClick={() => onChange(m.v)}
            onMouseEnter={() => setHoverMode(m.v)}
            onMouseLeave={() => setHoverMode(null)}
            style={{
              height: 48,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 14px",
              border: `1px solid ${sel ? PRIMARY : BORDER}`,
              borderRadius: 8,
              background: sel ? BG_SEL : hov ? BG_HOVER : "#fff",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontSize: 13,
              fontWeight: sel ? 500 : 400,
              color: sel ? PRIMARY : TEXT_PRI,
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                color: sel ? PRIMARY : TEXT_SEC,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
              }}
            >
              {m.icon}
            </span>
            {m.label}
          </button>
        );
      })}
    </div>
  );
};
