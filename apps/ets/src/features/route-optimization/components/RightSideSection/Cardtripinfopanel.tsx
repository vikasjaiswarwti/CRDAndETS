// ─── components/CardTripInfoPanel.tsx ────────────────────────────────────────
// Content rendered inside the ℹ (info) popover on each RouteStackCard.
// Shows the full trip detail grid: status, flap no, assignment checks,
// vendor / vehicle / driver details, pax composition.
//
// Owns NO state — read-only view of the route object.
//
// Usage:
//   <Popover content={<CardTripInfoPanel route={route} />} trigger="click">
//     <InfoCircleOutlined />
//   </Popover>

import React from "react";
import type { VehicleRoute } from "../../types/Routemaker.types";

// ── Status map ────────────────────────────────────────────────────────────────

const TRIP_STATUS: Record<number, string> = {
  1: "Created",
  2: "Printed",
  3: "Started",
  4: "End",
  5: "Billed",
};

// ── Small helpers ─────────────────────────────────────────────────────────────

const MUTED = "#9CA3AF";
const TEXT = "#111827";
const BODY = "#374151";
const DIVIDER = "#F3F4F6";

function Row({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: React.ReactNode;
  valueColor?: string;
}) {
  return (
    <>
      <span style={{ color: MUTED }}>{label}</span>
      <span style={{ fontWeight: 600, color: valueColor ?? BODY }}>
        {value}
      </span>
    </>
  );
}

function Divider() {
  return (
    <div
      style={{
        gridColumn: "1/-1",
        height: 1,
        background: DIVIDER,
        margin: "5px 0",
      }}
    />
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  route: VehicleRoute;
}

export default function CardTripInfoPanel({ route }: Props) {
  const status =
    TRIP_STATUS[route.tripStatusCode] ?? `Code ${route.tripStatusCode}`;

  const assignments: { label: string; ok: boolean | undefined }[] = [
    { label: "Vehicle", ok: route.hasVehicleAssigned },
    { label: "Driver", ok: route.hasDriverAssigned },
    { label: "Escort", ok: route.hasEscortAssigned },
  ];

  return (
    <div
      style={{
        fontSize: 12,
        color: BODY,
        lineHeight: 1.9,
        minWidth: 186,
      }}
    >
      {/* ── Trip ID header ── */}
      <div
        style={{ fontWeight: 700, fontSize: 13, color: TEXT, marginBottom: 8 }}
      >
        Trip #{route.VehicleId}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: "1px 14px",
        }}
      >
        {/* Status + flap */}
        <Row label="Status" value={status} />
        <Row label="Flap No" value={`#${route.flapNo ?? "—"}`} />

        <Divider />

        {/* Assignment checks */}
        {assignments.map(({ label, ok }) => (
          <Row
            key={label}
            label={label}
            value={ok ? "✓ Assigned" : "✗ Not assigned"}
            valueColor={ok ? "#059669" : "#EF4444"}
          />
        ))}

        <Divider />

        {/* Vendor / vehicle / driver */}
        <Row label="Vendor" value={route.vendorName || "—"} />
        <Row label="Vehicle No" value={route.vehicleRegNo || "—"} />
        <Row label="Driver" value={route.driverName || "—"} />
        <Row label="Contact" value={route.driverMobile || "—"} />

        <Divider />

        {/* Composition */}
        <Row label="Pax" value={route.TotalSeatUsed ?? 0} />
        <Row label="Female" value={route.IsFemaleTrip ? "Yes" : "No"} />
        <Row
          label="Special"
          value={route.IsSpecialNeedTrip ? "⚠ Yes" : "No"}
          valueColor={route.IsSpecialNeedTrip ? "#F59E0B" : undefined}
        />
      </div>
    </div>
  );
}
