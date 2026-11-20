import type React from "react";
// import { StatusBadge } from "./StatusBadge";
// import type { StatusType } from "./StatusBadge";
import {
  thStyle,
  tdStyle,
  sectionCard,
  sectionHdr,
  viewAllBtn,
} from "../dashboardStyles";
import type { AdhocRequest } from "../types/employeeProfile.types";

export interface AdhocRequestsTableProps {
  requests: AdhocRequest[];
  onViewAll?: () => void;
}

export const AdhocRequestsTable: React.FC<AdhocRequestsTableProps> = ({
  requests,
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
        Recent Adhoc Requests
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
            <th style={thStyle}>Request ID</th>
            <th style={thStyle}>Date &amp; Time</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r, i) => (
            <tr key={i}>
              <td style={{ ...tdStyle, fontWeight: 700 }}>{r.ReqId}</td>
              <td style={tdStyle}>{r.RequestDate}</td>
              <td style={tdStyle}>{r.TripType}</td>
              <td style={tdStyle}>
                {r.STATUS}
                {/* <StatusBadge status={r.STATUS} /> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
