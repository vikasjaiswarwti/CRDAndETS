import type React from "react";
import { thStyle, tdStyle, sectionCard, sectionHdr } from "../dashboardStyles";
import type { TeamCabTrip } from "../types/employeeProfile.types";
import { Crosshair, User } from "lucide-react";
import { formatTime, formatDate } from "../config/parsers";
export interface MyTeamTripProps {
  title?: string;
  trips: TeamCabTrip[];
}

const MyTeamTrip: React.FC<MyTeamTripProps> = ({
  title = "My Team Trips",
  trips,
}) => {
  const handleTrack = (dsId: number) => {
    window.open(`/routing/route-tracking?dsId=${dsId}`, "_blank");
  };

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
          {title}
        </h2>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {/* <th style={thStyle}>Trip ID</th> */}
              <th style={thStyle}>Employee</th>
              <th style={thStyle}>Trip Type</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Scheduled Time</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>

          <tbody>
            {trips.map((trip) => (
              <tr key={trip.dsId}>
                {/* <td style={{ ...tdStyle, fontWeight: 700 }}>{trip.dsId}</td> */}

                <td style={{ ...tdStyle, fontWeight: 600 }}>
                  <span className="flex gap-2">
                    <User size={16} />
                    {trip.fullName}
                  </span>
                </td>

                <td style={tdStyle}>{trip.tripTypeName}</td>

                <td style={tdStyle}>{formatDate(trip.dsDate)}</td>

                <td style={{ ...tdStyle, fontWeight: 600 }}>
                  {formatTime(trip.scheduledStartTime)}
                </td>

                <td style={tdStyle}>{trip.tripStatusName}</td>

                <td style={tdStyle}>
                  <button
                    onClick={() => handleTrack(trip.dsId)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "#F0FDF4",
                      color: "#1B4332",
                      border: "1px solid #BBF7D0",
                      borderRadius: 999, // pill shape
                      padding: "5px 14px",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {/* Crosshair / target icon — inline SVG, no import needed */}
                    {/* <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#22C55E"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                    <line x1="12" y1="2" x2="12" y2="6" />
                    <line x1="12" y1="18" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="6" y2="12" />
                    <line x1="18" y1="12" x2="22" y2="12" />
                  </svg> */}
                    <Crosshair size={13} color="#22C55E" strokeWidth={2.2} />
                    Track Vehicle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyTeamTrip;
