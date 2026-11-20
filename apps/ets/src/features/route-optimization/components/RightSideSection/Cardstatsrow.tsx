// ─── components/CardStatsRow.tsx ──────────────────────────────────────────────
// The 5-cell stats grid rendered at the bottom of each RouteStackCard.
//
// Cells:
//   First Stop | Duration | Distance | Extra Dist (hover) | ETA (hover)
//
// Extra Dist and ETA cells show per-passenger breakdown in a hover popover.
// All formatting is done internally — parent just passes the raw route object.
//
// Usage:
//   <CardStatsRow route={route} Popover={Popover} />

import React from "react";
import { T } from "../../constants/designTokens";
import type { VehicleRoute } from "../../types/Routemaker.types";
import {
  fmtDuration,
  fmtDist,
  firstStopLabel,
  fmt12,
} from "../../utils/routeMakerHelpers";
import { Stat } from "./Cardmicros";

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  route: VehicleRoute;
  /** Pass Popover from useUILibrary() in the parent */
  Popover: React.ComponentType<any>;
}

// ── Extra Distance tooltip ────────────────────────────────────────────────────

function ExtraDistTooltip({
  route,
  extraDist,
}: {
  route: VehicleRoute;
  extraDist: string;
}) {
  return (
    <div style={{ fontSize: 11, maxWidth: 200 }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: T.text }}>
        Extra Distance Breakdown
      </div>
      <div style={{ color: T.muted, marginBottom: 6 }}>
        Extra km driven beyond each passenger's direct route.
      </div>

      {(route.Passengers ?? []).map((p) => (
        <div
          key={p.Id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            marginTop: 2,
          }}
        >
          <span
            style={{
              color: T.text,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 115,
            }}
          >
            {p.Firstname}
          </span>
          <span style={{ color: "#F59E0B", fontWeight: 700, flexShrink: 0 }}>
            +{(p.extraDistanceKm ?? 0).toFixed(2)} km
          </span>
        </div>
      ))}

      <div style={{ height: 1, background: T.border, margin: "6px 0" }} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontWeight: 700,
        }}
      >
        <span style={{ color: T.text }}>Total extra</span>
        <span style={{ color: "#F59E0B" }}>{extraDist}</span>
      </div>
    </div>
  );
}

// ── ETA tooltip ───────────────────────────────────────────────────────────────

function EtaTooltip({
  route,
  eta,
  duration,
  isLate,
}: {
  route: VehicleRoute;
  eta: string;
  duration: string;
  isLate: boolean;
}) {
  return (
    <div style={{ fontSize: 11, maxWidth: 174 }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: T.text }}>
        Estimated Office Arrival
      </div>

      {route.CabDepartureTime && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            marginTop: 2,
          }}
        >
          <span style={{ color: T.muted }}>Cab departs</span>
          <span style={{ fontWeight: 600, color: T.text }}>
            {fmt12(route.CabDepartureTime)}
          </span>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          marginTop: 2,
        }}
      >
        <span style={{ color: T.muted }}>Arrives office</span>
        <span style={{ fontWeight: 700, color: isLate ? T.warn : "#22C55E" }}>
          {eta}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          marginTop: 2,
        }}
      >
        <span style={{ color: T.muted }}>Duration</span>
        <span style={{ fontWeight: 600, color: T.text }}>{duration}</span>
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CardStatsRow({ route, Popover }: Props) {
  const firstStop = firstStopLabel(route);
  const dist = fmtDist(route.RouteDistanceKm);
  const extraDist = `${(route.ExtraDistanceKm ?? 0).toFixed(2)} km`;
  const eta = fmt12(route.EstimatedOfficeArrival);
  const duration = fmtDuration(route.RouteDurationMinutes);
  const isLate = !!route.AnyCabMemberIsLate;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
        gap: 4,
        paddingTop: 8,
        borderTop: `1px solid ${T.border}`,
      }}
    >
      <Stat label="First Stop" value={firstStop} accent />
      <Stat label="Duration" value={duration} />
      <Stat label="Distance" value={dist} />

      <Stat
        label="Extra Dist"
        value={extraDist}
        Popover={Popover}
        tooltip={<ExtraDistTooltip route={route} extraDist={extraDist} />}
      />

      <Stat
        label="ETA"
        value={eta}
        Popover={Popover}
        tooltip={
          <EtaTooltip
            route={route}
            eta={eta}
            duration={duration}
            isLate={isLate}
          />
        }
      />
    </div>
  );
}
