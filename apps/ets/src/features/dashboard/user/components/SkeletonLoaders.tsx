// src/.../employeeProfile/components/SkeletonLoaders.tsx
import { Skeleton } from "antd";
import React from "react";

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 16,
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
};

/* ── TopStatsBar: 5 stat cards side by side ─────────── */
export const TopStatsBarSkeleton: React.FC = () => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Skeleton.Avatar active size={44} shape="square" style={{ borderRadius: 12 }} />
          <div style={{ flex: 1 }}>
            <Skeleton active title={false} paragraph={{ rows: 2, width: ["60%", "40%"] }} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* ── MyTrips: 2 trip cards ───────────────────────────── */
export const MyTripsSkeleton: React.FC = () => (
  <div style={{ ...card }}>
    <Skeleton active title={{ width: "20%" }} paragraph={false} />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 14 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <Skeleton.Avatar active size={32} shape="circle" />
            <Skeleton active title={false} paragraph={{ rows: 1, width: "40%" }} />
          </div>
          <Skeleton active title={false} paragraph={{ rows: 3, width: ["50%", "60%", "50%"] }} />
        </div>
      ))}
    </div>
  </div>
);

/* ── AdhocRequestsTable: table with 4 rows ───────────── */
export const AdhocRequestsTableSkeleton: React.FC = () => (
  <div style={card}>
    <Skeleton active title={{ width: "25%" }} paragraph={false} />
    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
      {/* header row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} active title={{ width: "80%" }} paragraph={false} />
        ))}
      </div>
      {/* data rows */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          {Array.from({ length: 5 }).map((_, j) => (
            <Skeleton key={j} active title={{ width: "70%" }} paragraph={false} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

/* ── QuickAction: 2x2 icon grid + 2 list items ───────── */
export const QuickActionSkeleton: React.FC = () => (
  <div style={{ ...card, display: "flex", flexDirection: "column", gap: 12 }}>
    <Skeleton active title={{ width: "40%" }} paragraph={false} />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Skeleton.Avatar active size={40} shape="square" style={{ borderRadius: 10 }} />
          <Skeleton active title={{ width: "60%" }} paragraph={false} />
          <Skeleton active title={{ width: "80%" }} paragraph={false} />
        </div>
      ))}
    </div>
    {Array.from({ length: 2 }).map((_, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: "1px solid #e5e7eb" }}>
        <Skeleton.Avatar active size={36} shape="square" style={{ borderRadius: 8 }} />
        <Skeleton active title={{ width: "50%" }} paragraph={false} />
      </div>
    ))}
  </div>
);

/* ── NoShowTripsTable: table with 3 rows ─────────────── */
export const NoShowTripsTableSkeleton: React.FC = () => (
  <div style={card}>
    <Skeleton active title={{ width: "20%" }} paragraph={false} />
    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} active title={{ width: "80%" }} paragraph={false} />
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {Array.from({ length: 4 }).map((_, j) => (
            <Skeleton key={j} active title={{ width: "70%" }} paragraph={false} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

/* ── WeeklySchedule: 7 day pills ─────────────────────── */
export const WeeklyScheduleSkeleton: React.FC = () => (
  <div style={card}>
    <Skeleton active title={{ width: "25%" }} paragraph={false} />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginTop: 12 }}>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "12px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <Skeleton active title={{ width: "60%" }} paragraph={false} />
          <Skeleton active title={{ width: "80%" }} paragraph={false} />
        </div>
      ))}
    </div>
  </div>
);

/* ── RecentFeedbackTable: table with 3 rows ──────────── */
export const RecentFeedbackTableSkeleton: React.FC<{ title?: string }> = ({ title }) => (
  <div style={card}>
    <Skeleton active title={{ width: title ? `${title.length * 9}px` : "30%" }} paragraph={false} />
    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} active title={{ width: "80%" }} paragraph={false} />
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {Array.from({ length: 4 }).map((_, j) => (
            <Skeleton key={j} active title={{ width: "65%" }} paragraph={false} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

/* ── MyTeamTrip / TeamCabCard: 3 cab cards ───────────── */
export const TeamCabCardSkeleton: React.FC = () => (
  <div style={card}>
    <Skeleton active title={{ width: "20%" }} paragraph={false} />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 12 }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <Skeleton.Avatar active size={36} shape="circle" />
            <Skeleton active title={{ width: "60%" }} paragraph={false} />
          </div>
          <Skeleton active title={false} paragraph={{ rows: 3, width: ["80%", "60%", "70%"] }} />
        </div>
      ))}
    </div>
  </div>
);