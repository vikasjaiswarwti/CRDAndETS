import type React from "react";
import {
  thStyle,
  tdStyle,
  sectionCard,
  sectionHdr,
  viewAllBtn,
} from "../dashboardStyles";
import type { NoShowTrip } from "../types/employeeProfile.types";

export interface NoShowTripsTableProps {
  trips: NoShowTrip[];
  onViewAll?: () => void;
}

export const NoShowTripsTable: React.FC<NoShowTripsTableProps> = ({
  trips,
  onViewAll,
}) => {
  const safeTrips = Array.isArray(trips) ? trips : [];

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
        <h2
          style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#003D27" }}
        >
          No Show Trips
        </h2>
        {!!onViewAll && (
          <button style={viewAllBtn} onClick={onViewAll}>
            View All
          </button>
        )}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thStyle}>Trip ID</th>
            <th style={thStyle}>Trip Date</th>
            <th style={thStyle}>Trip Type</th>
            <th style={thStyle}>Shift</th>
          </tr>
        </thead>

        <tbody>
          {safeTrips.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                style={{
                  ...tdStyle,
                  textAlign: "center",
                  color: "#6B7280",
                }}
              >
                No no-show trips found
              </td>
            </tr>
          ) : (
            safeTrips.map((r, i) => (
              <tr key={r?.TripID ?? i}>
                <td
                  style={{
                    ...tdStyle,
                    fontWeight: 700,
                    color: "#E53E3E",
                  }}
                >
                  {r?.TripID ?? "-"}
                </td>

                <td style={tdStyle}>{r?.TripDate ?? "-"}</td>

                <td style={tdStyle}>{r?.TripType ?? "-"}</td>

                <td style={tdStyle}>{r?.ShiftTime ?? "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
