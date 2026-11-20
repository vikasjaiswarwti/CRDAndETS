import type React from "react";
// import { StatusBadge } from "./StatusBadge";
import {
  thStyle,
  tdStyle,
  sectionCard,
  sectionHdr,
  // viewAllBtn,
} from "../dashboardStyles";
import type { FeedbackItem } from "../types/employeeProfile.types";

export interface RecentFeedbackTableProps {
  title: string;
  items: FeedbackItem[];
  onViewAll?: () => void;
}
export const dummyFeedbackData: FeedbackItem[] = [
  {
    ReferenceNo: "CMP1001",
    ComplainType: "Driver Behavior",
    ComplainDate: "2026-06-20 10:30 AM",
    ComplainMessage:
      "The driver was rude and did not follow the assigned route.",
    TransportReply:
      "We apologize for the inconvenience. The driver has been warned and trained.",
    STATUS: "Resolved",
  },
  {
    ReferenceNo: "CMP1002",
    ComplainType: "Vehicle Cleanliness",
    ComplainDate: "2026-06-19 08:15 PM",
    ComplainMessage: "The cab was not clean and had an unpleasant smell.",
    TransportReply:
      "The vehicle has been sent for cleaning and quality checks.",
    STATUS: "Closed",
  },
  {
    ReferenceNo: "CMP1003",
    ComplainType: "Late Pickup",
    ComplainDate: "2026-06-18 09:00 AM",
    ComplainMessage:
      "The cab arrived 25 minutes late from the scheduled pickup time.",
    TransportReply:
      "We are investigating the delay and will improve our dispatch process.",
    STATUS: "In Progress",
  },
  {
    ReferenceNo: "CMP1004",
    ComplainType: "Route Issue",
    ComplainDate: "2026-06-17 06:45 PM",
    ComplainMessage:
      "The driver took a longer route which increased travel time.",
    TransportReply:
      "GPS logs are being reviewed and appropriate action will be taken.",
    STATUS: "Pending",
  },
  {
    ReferenceNo: "CMP1005",
    ComplainType: "Safety Concern",
    ComplainDate: "2026-06-16 11:20 PM",
    ComplainMessage: "The driver was overspeeding during the trip.",
    TransportReply:
      "Safety is our priority. The incident has been escalated to the operations team.",
    STATUS: "Resolved",
  },
];
export const RecentFeedbackTable: React.FC<RecentFeedbackTableProps> = ({
  title = "",
  items,
  // onViewAll,
}) => (
  <div style={{ ...sectionCard, marginBottom: 0 }}>
    {/* <div style={sectionHdr}>
      <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{title}</h2>
      {onViewAll && (
        <button style={viewAllBtn} onClick={onViewAll}>
          View All
        </button>
      )}
    </div> */}
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
    </div>

    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thStyle}>Request ID</th>
            <th style={thStyle}>Date &amp; Time</th>
            <th style={thStyle}>Complaint Type</th>
            <th style={thStyle}>Response Message</th>
            {/* <th style={thStyle}>Action</th> */}
            <th style={thStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r, i) => (
            <tr key={i}>
              <td style={{ ...tdStyle, fontWeight: 700 }}>{r.ReferenceNo}</td>
              <td style={tdStyle}>{r.ComplainDate}</td>
              <td style={tdStyle}>{r.ComplainType}</td>
              <td style={{ ...tdStyle, color: "#52796F", fontStyle: "italic" }}>
                {r.ComplainMessage}
              </td>
              {/* <td style={{ ...tdStyle, color: "#52796F", fontStyle: "italic" }}>
                {r.TransportReply ?? "-"}
              </td> */}
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
