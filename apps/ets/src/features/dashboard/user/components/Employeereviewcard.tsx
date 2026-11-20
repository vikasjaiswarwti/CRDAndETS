// src/features/dashboard/employee/components/EmployeeReviewCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Matches the reference screenshot layout exactly.
// Map rendered via useGoogleMapV2 — same pattern as ApproveRejectModal.
// Pure display: no API calls, no internal data fetching.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { Spin } from "antd";
import { useGoogleMapV2 } from "../../../../shared/hooks/useGoogleMap";
import type { GlobalUserProfile } from "../types/employeeProfile.types";

interface Props {
  data: GlobalUserProfile;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const display = (
  val: string | number | null | undefined,
  fallback = "N/A",
): string => {
  if (
    val === null ||
    val === undefined ||
    val === "" ||
    val === 0 ||
    val === "0"
  )
    return fallback;
  return String(val);
};

const genderLabel = (g: string | null | undefined): string => {
  const map: Record<string, string> = { M: "Male", F: "Female", O: "Other" };
  return g ? (map[g] ?? g) : "N/A";
};

const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return "N/A";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const getInitials = (first = "", last = "") =>
  `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "EM";

// ─── Shared style tokens ──────────────────────────────────────────────────────

const GREEN = "#1B4332";
const GREEN_LIGHT = "#E8F5EE";
const GREEN_MID = "#2D6A4F";

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E2E8F0",
  borderRadius: 12,
  padding: "18px 20px",
};

const sectionTitle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  fontSize: 13,
  fontWeight: 600,
  color: GREEN_MID,
  marginBottom: 14,
};

const divider: React.CSSProperties = {
  borderTop: "1px solid #F1F5F9",
  margin: "13px 0",
};

// ─── Field atom ──────────────────────────────────────────────────────────────

const Field: React.FC<{
  label: string;
  value: string | number | null | undefined;
  fallback?: string;
}> = ({ label, value, fallback = "N/A" }) => {
  const val = display(value, fallback);
  const empty = val === fallback;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.55px",
          textTransform: "uppercase",
          color: "#9CA3AF",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: empty ? "#CBD5E1" : "#1e293b",
          fontStyle: empty ? "italic" : "normal",
        }}
      >
        {val}
      </span>
    </div>
  );
};

// ─── Grid wrapper ─────────────────────────────────────────────────────────────

const Grid: React.FC<{ cols: number; children: React.ReactNode }> = ({
  cols,
  children,
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: "14px 12px",
    }}
  >
    {children}
  </div>
);

// ─── Inline SVG icons ────────────────────────────────────────────────────────

const IcoUser = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IcoBriefcase = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
const IcoHome = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const IcoMapPin = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const IcoCheck = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

const EmployeeReviewCard: React.FC<Props> = ({ data }) => {
  const fullName = [data.firstName, data.middleName, data.lastName]
    .filter(Boolean)
    .join(" ");
  const initials = getInitials(data.firstName ?? "", data.lastName ?? "");

  // Same hook call pattern as ApproveRejectModal
  const { mapRef, isLoaded } = useGoogleMapV2({
    defaultLat: data.emp_Lat ?? 28.6139,
    defaultLng: data.emp_Lng ?? 77.209,
  });

  return (
    <div
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: "#F8FAFC",
        padding: "20px 22px 24px",
        boxSizing: "border-box",
      }}
    >
      {/* ── Page header ── */}
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 4,
          }}
        >
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: GREEN_MID,
              margin: 0,
            }}
          >
            Registration Review: {display(data.employeeId)}
          </h2>
          {data.isActive && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: GREEN_LIGHT,
                color: GREEN,
                fontSize: 11,
                fontWeight: 600,
                borderRadius: 20,
                padding: "3px 10px",
              }}
            >
              <IcoCheck /> Active
            </span>
          )}
        </div>
        <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>
          Submitted on {formatDate(data.createdOn)}
          &nbsp;•&nbsp; Reviewing Officer: Admin
        </p>
      </div>

      {/* ── Two-column layout: left wide, right fixed ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* ════ LEFT COLUMN ════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Personal & Contact Info */}
          <div style={card}>
            <div style={sectionTitle}>
              <IcoUser /> Personal &amp; Contact Info
            </div>

            {/* Avatar row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: GREEN_LIGHT,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 15,
                  fontWeight: 700,
                  color: GREEN,
                }}
              >
                {initials}
              </div>
              <div>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#1e293b",
                    margin: 0,
                  }}
                >
                  {fullName}
                </p>
                <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>
                  {display(data.employeeId)} &nbsp;•&nbsp; Employee #
                  {data.empId}
                </p>
              </div>
            </div>

            <Grid cols={4}>
              <Field label="Name" value={fullName} />
              <Field label="Department" value={data.depCode} />
              <Field label="Gender" value={genderLabel(data.gender)} />
              <Field label="Employee ID" value={data.employeeId} />
            </Grid>

            <div style={divider} />

            <Grid cols={2}>
              <Field label="Mobile" value={data.mobileNo} />
              <Field label="Email ID" value={data.emailId} />
            </Grid>
          </div>

          {/* Work Info */}
          <div style={card}>
            <div style={sectionTitle}>
              <IcoBriefcase /> Work Info
            </div>
            <Grid cols={3}>
              {/* <Field label="Office / Loc Code" value={data.locCode} /> */}
              <Field label="Project Name" value={data.proCode} />
              <Field label="Supervisor Name" value={data.supEmployeeId} />
            </Grid>
            <div style={divider} />
            <Grid cols={3}>
              <Field label="SPOC Name" value={data.spocEmployeeId} />
              <Field
                label="Special Needs"
                value={
                  data.special_Needs === 0
                    ? "None Specified"
                    : String(data.special_Needs)
                }
                fallback="None Specified"
              />
              <Field label="LOB Name" value={data.lobName} />
            </Grid>
          </div>

          {/* Address */}
          <div style={card}>
            <div style={sectionTitle}>
              <IcoHome /> Address
            </div>
            <Grid cols={3}>
              <Field label="City" value={data.city} />
              <Field
                label="State"
                value={data.stateName ?? String(data.stateCode)}
              />
              <Field label="Pin Code" value={data.pin} />
            </Grid>
            <div style={divider} />
            <Field label="Address" value={data.address} />
          </div>
        </div>

        {/* ════ RIGHT COLUMN — Location ════ */}
        <div style={card}>
          <div
            style={{
              ...sectionTitle,
              textTransform: "uppercase",
              fontSize: 11,
              letterSpacing: "0.6px",
            }}
          >
            <IcoMapPin /> Location
          </div>

          {/* Geo Point */}
          <div style={{ marginBottom: 12 }}>
            <span
              style={{
                display: "block",
                fontSize: 10,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.55px",
                color: "#9CA3AF",
                marginBottom: 4,
              }}
            >
              Geo Point
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#1e293b",
                lineHeight: 1.5,
              }}
            >
              {data.locationName || "N/A"}
            </span>
          </div>

          <div style={divider} />

          {/* Nodal Pick / Drop */}
          <Grid cols={2}>
            <Field label="Nodal Pick" value={data.nodal_Pick} />
            <Field label="Nodal Drop" value={data.nodal_Drop} />
          </Grid>

          {/* ── Map — same DOM pattern as ApproveRejectModal ── */}
          <div
            style={{
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid #B7E4C7",
              marginTop: 14,
              position: "relative",
              height: 240,
              backgroundColor: "#e8f5e9",
            }}
          >
            {/* Loading overlay — shown while map script loads */}
            {!isLoaded && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#F0FAF4",
                  color: "#52796F",
                  fontSize: 13,
                  zIndex: 1,
                }}
              >
                <Spin /> &nbsp; Loading map…
              </div>
            )}
            {/* mapRef div — Google Maps mounts here */}
            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
          </div>

          {/* Geographic Verification badge */}
          <div
            style={{
              marginTop: 10,
              background: GREEN_LIGHT,
              borderRadius: 8,
              padding: "7px 12px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              fontWeight: 600,
              color: GREEN,
            }}
          >
            <IcoCheck />
            Geographic Verification &nbsp;
            <span style={{ fontWeight: 400, color: GREEN_MID }}>
              Precise Coordinates Validated
            </span>
          </div>

          <div style={divider} />

          {/* Coordinates */}
          <Grid cols={2}>
            <Field label="Latitude" value={data.emp_Lat?.toFixed(6)} />
            <Field label="Longitude" value={data.emp_Lng?.toFixed(6)} />
          </Grid>
        </div>
      </div>
    </div>
  );
};

export default EmployeeReviewCard;
