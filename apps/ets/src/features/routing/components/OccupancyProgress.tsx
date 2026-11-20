// src/shared/components/OccupancyProgress/OccupancyProgress.tsx
import { memo } from "react";
import type { OccupancyLevel } from "../types/RouteTypes";
import { RM_FONT } from "../Routeuiconfig";

interface OccupancyProgressProps {
  value: number; // 0–100
}

function getLevel(value: number): OccupancyLevel {
  if (value <= 40) return "danger";
  if (value <= 70) return "warning";
  return "success";
}

const LEVEL_COLOR: Record<OccupancyLevel, { bar: string; text: string }> = {
  danger: { bar: "#F87171", text: "#EF4444" },
  warning: { bar: "#FBBF24", text: "#D97706" },
  success: { bar: "#10B981", text: "#065F46" },
};

export const OccupancyProgress = memo(function OccupancyProgress({
  value,
}: OccupancyProgressProps) {
  const level = getLevel(value);
  const pct = Math.max(0, Math.min(100, value));
  const { bar, text } = LEVEL_COLOR[level];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: RM_FONT.sm, fontWeight: 600, color: text }}>
        {pct}%
      </span>
      <div
        style={{
          height: 5,
          width: 72,
          borderRadius: 999,
          background: "#F3F4F6",
          overflow: "hidden",
        }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Occupancy ${pct}%`}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 999,
            background: bar,
            transition: "width 0.5s ease-out",
          }}
        />
      </div>
    </div>
  );
});
