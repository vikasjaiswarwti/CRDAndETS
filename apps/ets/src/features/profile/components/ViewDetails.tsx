import React, { useState } from "react";
import { Spin, Button } from "antd";
import { useGoogleMapV2 } from "../../../shared/hooks/useGoogleMap";
import type { GlobalUserProfile } from "../types/profile.types";
import AddressChangeBanner from "../../dashboard/user/components/AddressStatusBadge";
import EditProfileModal from "./EditProfileModal";
import { useGetUserAppConfigurationByLocCodeQuery } from "../../new-app-control/services/userAppConfigurationApi";
import { LockOutlined } from "@ant-design/icons";

interface Props {
  data: GlobalUserProfile;
  onProfileUpdated?: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const display = (
  val: string | number | null | undefined,
  fallback = "-",
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

// const getInitials = (first = "", last = "") =>
//   `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "EM";

// ─── Design tokens — professional grey / charcoal ────────────────────────────

const T = {
  grey900: "#1B1E23",
  grey800: "#2B3036",
  grey700: "#3E444C",
  accent: "#4B5563",
  tint: "#F3F4F6",
  tintLine: "#E5E7EB",
  steel: "#B8BEC6",
  page: "#F7F8F9",
  card: "#FFFFFF",
  border: "#E5E7EB",
  hairline: "#F0F1F3",
  ink: "#1E293B",
  inkSoft: "#475569",
  label: "#9CA3AF",
  empty: "#CBD0D6",
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const divider: React.CSSProperties = {
  borderTop: `1px solid ${T.hairline}`,
  margin: "14px 0",
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
    <div
      style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.7px",
          textTransform: "uppercase",
          color: T.label,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 13.5,
          fontWeight: empty ? 400 : 500,
          color: empty ? T.empty : T.ink,
          fontStyle: empty ? "italic" : "normal",
          lineHeight: 1.45,
          overflowWrap: "anywhere",
        }}
        title={empty ? undefined : val}
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
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      gap: "16px 14px",
    }}
  >
    {children}
  </div>
);

// ─── Section card ─────────────────────────────────────────────────────────────

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ icon, title, children }) => (
  <div
    style={{
      background: T.card,
      borderRadius: 14,
      border: `1px solid ${T.border}`,
      overflow: "hidden",
      boxShadow: "0 1px 2px rgba(27, 30, 35, 0.04)",
      transition: "box-shadow 160ms ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = "0 4px 14px rgba(27, 30, 35, 0.08)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = "0 1px 2px rgba(27, 30, 35, 0.04)";
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "10px 16px",
        background: T.tint,
        borderBottom: `1px solid ${T.tintLine}`,
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          background: "#FFFFFF",
          border: `1px solid ${T.tintLine}`,
          color: T.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <span
        style={{
          fontSize: 13.5,
          fontWeight: 600,
          color: T.grey800,
          letterSpacing: "0.1px",
        }}
      >
        {title}
      </span>
    </div>
    <div style={{ padding: 20 }}>{children}</div>
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

const ViewDetails: React.FC<Props> = ({ data, onProfileUpdated }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const fullName = [data.firstName, data.middleName, data.lastName]
    .filter(Boolean)
    .join(" ");
  const { data: userAppDetailData } = useGetUserAppConfigurationByLocCodeQuery(
    { LocCode: data.locCode as number },
    { skip: !data.locCode },
  );
  const isUserUpdateProfile = React.useMemo(() => {
    if (!userAppDetailData?.length) return false;

    try {
      const basicSetting = JSON.parse(userAppDetailData[0].basicSetting);
      return basicSetting?.[0]?.IsUserUpdateProfile ?? false;
    } catch {
      return false;
    }
  }, [userAppDetailData]);
  // const initials = getInitials(data.firstName ?? "", data.lastName ?? "");

  // Same hook call pattern as ApproveRejectModal
  const { mapRef, isLoaded } = useGoogleMapV2({
    defaultLat: data.emp_Lat ?? 28.6139,
    defaultLng: data.emp_Lng ?? 77.209,
  });

  return (
    <div
      style={{
        fontFamily: T.font,
        background: T.page,
        padding: "20px 22px 26px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <p style={{ fontWeight: 600, color: T.grey800, fontSize: 16 }}>
          My Profile
        </p>
        {isUserUpdateProfile ? (
          <Button
            type="primary"
            onClick={() => setIsEditOpen(true)}
            style={{ background: "#1A5C99", borderColor: "#1A5C99" }}
          >
            Edit Profile
          </Button>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              background: "#FFF7ED",
              border: "1px solid #FED7AA",
              color: "#C2410C",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            <LockOutlined /> Profile updates are managed by your Transport
            Manager.
          </div>
        )}
      </div>
      {/* ════ CONTENT GRID ════ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 350px",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* ════ LEFT COLUMN ════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionCard icon={<IcoUser />} title="Personal & Contact Info">
            <Grid cols={3}>
              <Field label="Name" value={fullName} />
              <Field label="Department" value={data.depCode} />
              <Field label="Gender" value={genderLabel(data.gender)} />
            </Grid>

            <div style={divider} />

            <Grid cols={2}>
              <Field label="Mobile" value={data.mobileNo} />
              <Field label="Email ID" value={data.emailId} />
            </Grid>
          </SectionCard>

          <SectionCard icon={<IcoBriefcase />} title="Work Info">
            <Grid cols={3}>
              <Field label="Project Name" value={data.proCode} />
              <Field label="Supervisor Name" value={data.supEmployeeId} />
              <Field label="SPOC Name" value={data.spocEmployeeId} />
            </Grid>

            <div style={divider} />

            <Grid cols={3}>
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
          </SectionCard>

          <SectionCard icon={<IcoHome />} title="Address">
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
          </SectionCard>
        </div>

        {/* ════ RIGHT COLUMN — Location ════ */}
        <SectionCard icon={<IcoMapPin />} title="Location">
          {data?.empId && <AddressChangeBanner empId={data.empId} />}
          <Field label="Geo Point" value={data.locationName} />

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
              border: `1px solid ${T.tintLine}`,
              marginTop: 16,
              position: "relative",
              height: 240,
              backgroundColor: "#F1F2F4",
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
                  gap: 8,
                  background: T.tint,
                  color: T.grey700,
                  fontSize: 13,
                  zIndex: 2,
                }}
              >
                <Spin size="small" /> Loading map…
              </div>
            )}

            {/* mapRef div — Google Maps mounts here */}
            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

            {/* Coordinates pill overlaid on map */}
            {isLoaded && (
              <div
                style={{
                  position: "absolute",
                  left: 10,
                  bottom: 10,
                  zIndex: 1,
                  background: "rgba(27, 30, 35, 0.82)",
                  backdropFilter: "blur(4px)",
                  borderRadius: 8,
                  padding: "5px 10px",
                  color: "#E3E6EA",
                  fontSize: 11,
                  fontWeight: 500,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "0.2px",
                  pointerEvents: "none",
                }}
              >
                {data.emp_Lat != null && data.emp_Lng != null
                  ? `${data.emp_Lat.toFixed(6)}, ${data.emp_Lng.toFixed(6)}`
                  : "Coordinates unavailable"}
              </div>
            )}
          </div>

          {/* Geographic Verification badge */}
          <div
            style={{
              marginTop: 12,
              background: T.tint,
              border: `1px solid ${T.tintLine}`,
              borderRadius: 9,
              padding: "8px 12px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 11.5,
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: T.accent,
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IcoCheck />
            </span>
            <span style={{ fontWeight: 600, color: T.grey800 }}>
              Geographic Verification
            </span>
            <span style={{ fontWeight: 400, color: T.grey700 }}>
              Precise Coordinates Validated
            </span>
          </div>

          <div style={divider} />

          {/* Coordinates */}
          <Grid cols={2}>
            <Field label="Latitude" value={data.emp_Lat?.toFixed(6)} />
            <Field label="Longitude" value={data.emp_Lng?.toFixed(6)} />
          </Grid>
        </SectionCard>
      </div>

      {/* ════ EDIT PROFILE MODAL ════ */}
      <EditProfileModal
        open={isEditOpen}
        data={data}
        onClose={() => setIsEditOpen(false)}
        onUpdated={onProfileUpdated}
      />
    </div>
  );
};

export default ViewDetails;
