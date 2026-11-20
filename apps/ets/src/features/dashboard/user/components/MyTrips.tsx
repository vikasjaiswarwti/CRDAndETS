// MyTrips.tsx
import type React from "react";
import { sectionHdr } from "../dashboardStyles";
import type { ApiTrip } from "../types/employeeProfile.types";

// ─── Status badge color map ───────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Created: { bg: "#E8F5EE", color: "#1B6B3A" },
  Started: { bg: "#E3F2FD", color: "#1565C0" },
  Ongoing: { bg: "#EDE7F6", color: "#4527A0" },
  Completed: { bg: "#F1F8E9", color: "#33691E" },
  Cancelled: { bg: "#FFEBEE", color: "#B71C1C" },
  End: { bg: "#F0F0F0", color: "#5E5E5E" },
};

const getStatusStyle = (status: string) =>
  STATUS_STYLE[status] ?? { bg: "#F5F5F5", color: "#555" };

// ─── TripCard ─────────────────────────────────────────────────────────────────

const TripCard: React.FC<{ trip: ApiTrip }> = ({ trip }) => {
  const isLogin = trip.Triptype === "Login";
  const statusStyle = getStatusStyle(trip.TripStatus);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E8F5EE",
        borderRadius: 12,
        padding: "16px 18px",
        flex: 1,
        minWidth: 0,
      }}
    >
      {/* ── Header: icon left · badges right ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        {/* Bus icon for Login, Clock icon for Logout */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: isLogin ? "#E8F5EE" : "#FFF3E0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {isLogin ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M15 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" />
              <path d="M10 12h11" />
              <path d="M18 7l5 5-5 5" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M9 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H9" />
              <path d="M14 12H3" />
              <path d="M6 7l-5 5 5 5" />
            </svg>
          )}
        </div>

        {/* Trip-type badge + status badge */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {/* LOGIN / LOGOUT badge */}
          <span
            style={{
              background: isLogin ? "#E8F5EE" : "#FFF3E0",
              color: isLogin ? "#1B4332" : "#E65100",
              fontSize: 10,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 99,
              letterSpacing: 0.5,
            }}
          >
            {trip.Triptype.toUpperCase()}
          </span>

          {/* Mushrafin Added: colored TripStatus badge */}
          <span
            style={{
              background: statusStyle.bg,
              color: statusStyle.color,
              fontSize: 10,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 99,
              letterSpacing: 0.5,
            }}
          >
            {trip.TripStatus.toUpperCase()}
          </span>
        </div>
      </div>

      {/* ── Data row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 10,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 10,
              color: "#52796F",
              margin: "0 0 3px",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              fontWeight: 500,
            }}
          >
            {isLogin ? "Pick Up" : "Drop Shift"}
          </p>
          <p
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#1B4332",
              margin: 0,
              lineHeight: 1,
            }}
          >
            {isLogin ? trip.PickShift : trip.DropShift}
          </p>
        </div>

        <div>
          <p
            style={{
              fontSize: 10,
              color: "#52796F",
              margin: "0 0 3px",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              fontWeight: 500,
            }}
          >
            ETA
          </p>
          <p
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#1B4332",
              margin: 0,
              lineHeight: 1,
            }}
          >
            {trip.ETA ?? "—"}
          </p>
        </div>
      </div>

      {/* ── Date ── */}
      <p
        style={{
          fontSize: 10,
          color: "#8A9E99",
          margin: 0,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          fontWeight: 500,
        }}
      >
        Date
      </p>
      <p
        style={{
          fontSize: 13,
          color: "#1B4332",
          margin: "0 0 2px",
          fontWeight: 500,
        }}
      >
        {trip.Dsdate}
      </p>
    </div>
  );
};

// ─── MyTrips ──────────────────────────────────────────────────────────────────

export const MyTrips: React.FC<{ trips: ApiTrip[]; title?: string }> = ({
  trips,
  title = "My Trips",
}) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid #E8F5EE",
      borderRadius: 12,
      padding: "16px 18px",
      flex: 1,
      minWidth: 0,
    }}
  >
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

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 12,
      }}
    >
      {trips.map((trip, idx) => (
        <TripCard key={idx} trip={trip} />
      ))}
    </div>
  </div>
);
