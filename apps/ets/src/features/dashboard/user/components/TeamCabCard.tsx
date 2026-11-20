import type React from "react";
import {
  thStyle,
  tdStyle,
  sectionCard,
  sectionHdr,
  viewAllBtn,
} from "../dashboardStyles";
import type { TeamCab } from "../types/employeeProfile.types";

// ─── Type ─────────────────────────────────────────────────────────────────────

export interface TeamCabCardProps {
  title?: string;
  cabs: TeamCab[];
  onViewAll?: () => void;
}

export const TeamCabCard: React.FC<TeamCabCardProps> = ({
  title = "My Cab",
  cabs,
  onViewAll,
}) => (
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
        {title}
      </h2>
      {onViewAll && (
        <button style={viewAllBtn} onClick={onViewAll}>
          View All
        </button>
      )}
    </div>

    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thStyle}>Trip ID</th>
            <th style={thStyle}>Employee</th>
            {/* <th style={thStyle}>Emp ID</th> */}
            <th style={thStyle}>Trip Type</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Shift</th>
            <th style={thStyle}>ETA</th>
            <th style={thStyle}>Address</th>
            <th style={thStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {cabs.map((t, i) => (
            <tr key={i}>
              <td style={{ ...tdStyle, fontWeight: 700 }}>#{t.Dsid}</td>
              <td style={{ ...tdStyle, fontWeight: 600 }}>{t.Empname}</td>
              {/* <td style={{ ...tdStyle, color: "#52796F" }}>{t.EmployeeID}</td> */}
              <td style={tdStyle}>{t.Triptype}</td>
              <td style={tdStyle}>{t.Dsdate}</td>
              <td style={{ ...tdStyle, fontWeight: 600 }}>{t.PickShift}</td>
              <td style={{ ...tdStyle, color: "#40916C", fontWeight: 600 }}>
                {t.ETA}
              </td>
              <td
                style={{
                  ...tdStyle,
                  fontSize: 12,
                  color: "#52796F",
                  maxWidth: 180,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={t.Address}
              >
                {t.Address}
              </td>
              <td style={tdStyle}>
                {t.TripStatus}
                {/* <TripStatusBadge status={t.TripStatus} /> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
