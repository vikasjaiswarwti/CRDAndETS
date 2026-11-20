import type React from "react";
import { sectionCard, sectionHdr } from "../dashboardStyles";
import type { DaySchedule } from "../types/employeeProfile.types";

export interface WeeklyScheduleProps {
  days: DaySchedule[];
  /** How many days to show per page (default: 7) */
  pageSize?: number;
}

/**
 * Returns a 3-letter uppercase day abbreviation (e.g., "MON", "TUE")
 * for a given day-of-month number, relative to current month/year.
 */

export const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({
  days,
  pageSize = 7,
}) => {
  return (
    <div style={sectionCard}>
      <div
        style={{
          ...sectionHdr,
          display: "flex",
          alignItems: "center",
          gap: 10,
          paddingLeft: 0,
        }}
      >
        <div
          style={{
            width: 4,
            height: 28,
            backgroundColor: "#22C55E",
            borderRadius: 4,
            flexShrink: 0,
          }}
        />
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
          Weekly Schedule
        </h2>
      </div>

      {/* Horizontal scroll wrapper for narrow viewports */}
      <div style={{ overflowX: "auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${pageSize}, minmax(80px, 1fr))`,
            gap: 8,
            minWidth: pageSize * 88, // ensures cards don't collapse below readable width
          }}
        >
          {days.map((d, i) => {
            return (
              <div
                key={i}
                style={{
                  border: `1px solid #E8F5EE`,
                  borderRadius: 10,
                  padding: "12px 6px",
                  background: "#fff",
                  textAlign: "center",
                  transition: "border-color 0.2s",
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    color: "#8A9E99",
                    margin: "0 0 4px",
                    fontWeight: 700,
                    letterSpacing: 0.8,
                  }}
                >
                  {d.WeekDay}
                </p>
                <p
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#22C55E",
                    margin: "0 0 8px",
                  }}
                >
                  {d.WeekDate}
                </p>

                {/* IN time */}
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#52796F",
                    margin: "0 0 2px",
                  }}
                >
                  IN: {d.In}
                </p>

                {/* OUT time */}
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#52796F",
                    margin: 0,
                  }}
                >
                  OUT: {d.Out}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
