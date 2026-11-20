// src/features/route-maker/components/Shuttle/ShuttleRouteStackPanel.tsx
//
// Right panel for shuttle mode — redesigned to match RouteStackPanel /
// RouteStackCard visual language exactly.
//
// Design contract (mirrors cabs panel):
//   • Panel shell      overflow: hidden — no scroll at panel level
//   • Header rows      overflow hidden, flex-shrink 0
//   • Trip list        overflowY: auto, thin scrollbar via scoped <style>
//   • Left color border per card matches useShuttleMap PALETTE order
//   • Info popover     same Building2/Car/User/Shield assignment-card layout
//   • Stats row        2fr 1fr 1fr grid  (First Stop · Distance · Duration)
//   • Assignment badges row  (Vehicle · Driver · Escort · time-window chip)

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  Bus,
  CheckCircle2,
  // Circle,
  Clock,
  Navigation,
  Timer,
  Users,
  Building2,
  Car,
  User,
  Shield,
  Hash,
} from "lucide-react";
import { InfoCircleOutlined } from "@ant-design/icons";
import { T } from "../../constants/designTokens";
import type {
  ShuttleAnalyticsResponse,
  ShuttleTripApi,
} from "../../types/Shuttleapitypes";
import { useUILibrary } from "../../../../shared/lib/ui-lib/ui-library-context";

import CardAssignButtons from "../RightSideSection/Cardassignbuttons";
import { toRouteAdapter } from "../../utils/Shuttleadapter";

// ─── Colour palette — must match useShuttleMap PALETTE order ─────────────────

const PALETTE = [
  "#0284C7",
  "#7C3AED",
  "#059669",
  "#D97706",
  "#DB2777",
  "#0891B2",
  "#DC2626",
  "#65A30D",
  "#9333EA",
];

function tripColor(idx: number): string {
  return PALETTE[idx % PALETTE.length];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "—";
  }
}

function fmtDuration(min: number): string {
  if (!min) return "—";
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ─── Shared toolbar-button style (mirrors RouteStackPanel TB) ─────────────────

const TB: React.CSSProperties = {
  height: 28,
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "0 9px",
  borderRadius: 6,
  border: `1px solid ${T.border}`,
  background: "#fff",
  color: T.muted,
  fontSize: T.fontSm,
  fontWeight: 500,
  cursor: "pointer",
  whiteSpace: "nowrap",
  flexShrink: 0,
  boxSizing: "border-box" as const,
  lineHeight: 1,
};

// ─── Sort types ───────────────────────────────────────────────────────────────

// type ShuttleSortField = "default" | "distance" | "passengers" | "duration";
// type SortDir = "asc" | "desc";

// const SORT_OPTIONS: { label: string; value: ShuttleSortField }[] = [
//   { label: "Distance", value: "distance" },
//   { label: "Passengers", value: "passengers" },
//   { label: "Duration", value: "duration" },
// ];

// ─── Sort dropdown (inline, no external dep) ──────────────────────────────────

// function ShuttleSortDropdown({
//   sortField,
//   sortDir,
//   onChange,
// }: {
//   sortField: ShuttleSortField;
//   sortDir: SortDir;
//   onChange: (f: ShuttleSortField, d: SortDir) => void;
// }) {
//   const [open, setOpen] = useState(false);
//   const ref = useRef<HTMLDivElement>(null);
//   const isActive = sortField !== "default";
//   const currentLabel =
//     SORT_OPTIONS.find((o) => o.value === sortField)?.label ?? "Sort";

//   useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       if (ref.current && !ref.current.contains(e.target as Node))
//         setOpen(false);
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   return (
//     <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
//       <button
//         onClick={() => setOpen((o) => !o)}
//         style={{
//           ...TB,
//           height: 28,
//           border: `1px solid ${isActive ? T.accent : T.border}`,
//           color: isActive ? T.accent : T.muted,
//           background: isActive ? T.accentBg : "#fff",
//         }}
//       >
//         {/* funnel icon */}
//         <svg
//           width="10"
//           height="10"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="2.5"
//           strokeLinecap="round"
//         >
//           <line x1="3" y1="6" x2="21" y2="6" />
//           <line x1="6" y1="12" x2="18" y2="12" />
//           <line x1="9" y1="18" x2="15" y2="18" />
//         </svg>
//         {isActive ? currentLabel : "Sort"}
//         {isActive && (
//           <span
//             onClick={(e) => {
//               e.stopPropagation();
//               onChange("default", "asc");
//             }}
//             style={{ marginLeft: 1, fontSize: 12, lineHeight: 1 }}
//           >
//             ×
//           </span>
//         )}
//       </button>

//       {open && (
//         <div
//           style={{
//             position: "fixed",
//             zIndex: 9999,
//             background: "#fff",
//             border: `1px solid ${T.border}`,
//             borderRadius: 8,
//             boxShadow: T.shadowMd,
//             padding: 4,
//             minWidth: 160,
//           }}
//         >
//           {SORT_OPTIONS.map((opt) => {
//             const active = sortField === opt.value;
//             return (
//               <button
//                 key={opt.value}
//                 onClick={() => {
//                   if (active) {
//                     onChange(opt.value, sortDir === "asc" ? "desc" : "asc");
//                   } else {
//                     onChange(opt.value, "asc");
//                   }
//                   setOpen(false);
//                 }}
//                 style={{
//                   width: "100%",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   padding: "6px 10px",
//                   border: "none",
//                   background: active ? T.accentBg : "none",
//                   borderRadius: 6,
//                   cursor: "pointer",
//                   fontSize: 12,
//                   color: active ? T.accent : T.text,
//                   fontWeight: active ? 600 : 400,
//                 }}
//               >
//                 {opt.label}
//                 {active && (
//                   <span style={{ fontSize: 11, marginLeft: 4 }}>
//                     {sortDir === "asc" ? "↑" : "↓"}
//                   </span>
//                 )}
//               </button>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }

// ─── Stat cell (mirrors RouteStackCard Stat) ──────────────────────────────────

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: T.fontXs,
          fontWeight: 800,
          color: accent ? T.text : T.textSm,
        }}
      >
        {value}
      </div>
      <div
        style={{ fontSize: 9, color: T.muted, marginTop: 1, fontWeight: 600 }}
      >
        {label}
      </div>
    </div>
  );
}

// ─── Trip card — mirrors RouteStackCard layout exactly ────────────────────────

function ShuttleTripCard({
  trip,
  color,
  isSelected,
  onSelect,
  tripType,
  locCode,
  onRefetch,
}: {
  trip: ShuttleTripApi;
  color: string;
  isSelected: boolean;
  onSelect: () => void;
  tripType: number;
  // ADD two props:
  locCode: number;
  onRefetch?: () => void;
}) {
  const { Popover } = useUILibrary();

  const durationMin = Math.round(parseFloat(trip.totalDuration || "0"));

  const firstStop = trip.stops[0];
  const lastStop = trip.stops[trip.stops.length - 1];

  const firstAddress = firstStop?.passengers[0]?.address
    ? firstStop.passengers[0].address.split(",")[0].trim()
    : firstStop
      ? `Stop ${firstStop.stopOrder}`
      : "—";

  const lastAddress = lastStop?.passengers[0]?.address
    ? lastStop.passengers[0].address.split(",")[0].trim()
    : lastStop
      ? `Stop ${lastStop.stopOrder}`
      : "—";

  const timeWindow =
    firstStop && lastStop
      ? `${fmtTime(firstStop.schArrivalTime)} → ${fmtTime(lastStop.schArrivalTime)}`
      : null;

  const sideBorder = `1px solid ${isSelected ? color : T.border}`;
  const bgColor = isSelected ? `${color}12` : T.panel;

  // CORRECT — vendor is assigned when vendorName is present
  const [localVendorId, setLocalVendorId] = useState<number | null>(
    !!trip.vendorName ? ((trip as any).transporterId ?? 1) : null,
  );

  useEffect(() => {
    setLocalVendorId(
      !!trip.vendorName ? ((trip as any).transporterId ?? 1) : null,
    );
  }, [trip.vendorName, (trip as any).transporterId]);

  // ── Info popover (mirrors RouteStackCard infoPopoverContent) ──────────────

  const infoPopoverContent = (
    <div style={{ width: 240, fontFamily: "inherit" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 13,
              fontWeight: 700,
              color: "#111827",
            }}
          >
            <Hash size={12} color="#9CA3AF" />
            Trip {trip.dsId}
          </div>
          <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2 }}>
            {trip.isGuard ? "Guard Trip" : "Shuttle Trip"} · {trip.stops.length}{" "}
            stops
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 4,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              padding: "2px 7px",
              borderRadius: 99,
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              color: "#1E40AF",
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            <Users size={9} />
            {trip.totalPax}
          </span>
          {trip.hasFemale && (
            <span
              style={{
                padding: "2px 7px",
                borderRadius: 99,
                background: "#FDF2F8",
                border: "1px solid #F9A8D4",
                color: "#9D174D",
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              ♀
            </span>
          )}
          {trip.hasSpecialNeeds && (
            <span
              style={{
                padding: "2px 7px",
                borderRadius: 99,
                background: "#FFFBEB",
                border: "1px solid #FDE68A",
                color: "#92400E",
                fontSize: 10,
              }}
            >
              ♿
            </span>
          )}
        </div>
      </div>

      {/* Assignment cards (mirrors RouteStackCard assignment section) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 5,
          background: "#F9FAFB",
          borderRadius: 8,
          padding: "8px 10px",
          marginBottom: 10,
        }}
      >
        {(
          [
            {
              icon: <Building2 size={12} />,
              label: "Vendor",
              ok: !!trip.vendorName,
              value: trip.vendorName,
              sub: null,
            },
            {
              icon: <Car size={12} />,
              label: "Vehicle",
              ok: trip.hasVehicleAssigned,
              value: trip.vehicleRegNo,
              sub: null,
            },
            {
              icon: <User size={12} />,
              label: "Driver",
              ok: trip.hasDriverAssigned,
              value: trip.driverName,
              sub: trip.driverMobile,
            },
            {
              icon: <Shield size={12} />,
              label: "Escort",
              ok: trip.hasEscortAssigned,
              value: trip.escortName,
              sub: trip.escortMobile,
            },
          ] as {
            icon: React.ReactNode;
            label: string;
            ok: boolean;
            value?: string | null;
            sub?: string | null;
          }[]
        ).map(({ icon, label, ok, value, sub }) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                flexShrink: 0,
                background: ok ? "#D1FAE5" : "#F3F4F6",
                color: ok ? "#059669" : "#9CA3AF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {icon}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 9,
                  color: "#9CA3AF",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {label}
              </div>
              {ok ? (
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#111827",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {value ?? "Assigned"}
                  {sub && (
                    <span
                      style={{
                        color: "#6B7280",
                        fontWeight: 400,
                        marginLeft: 4,
                      }}
                    >
                      · {sub}
                    </span>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 11,
                    color: "#9CA3AF",
                    fontStyle: "italic",
                  }}
                >
                  Not assigned
                </div>
              )}
            </div>

            {ok ? (
              <CheckCircle2
                size={13}
                color="#059669"
                style={{ flexShrink: 0 }}
              />
            ) : (
              <div
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: "50%",
                  border: "1.5px dashed #D1D5DB",
                  flexShrink: 0,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Quick stats */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {[
          {
            icon: <Navigation size={10} />,
            label: "Distance",
            value: `${trip.routeDistanceKm.toFixed(1)} km`,
          },
          {
            icon: <Timer size={10} />,
            label: "Duration",
            value: fmtDuration(durationMin),
          },
          {
            icon: <Clock size={10} />,
            label: "Time window",
            value: timeWindow ?? "—",
          },
        ].map(({ icon, label, value }) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 11,
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                color: "#9CA3AF",
              }}
            >
              {icon}
              {label}
            </span>
            <span style={{ color: "#374151", fontWeight: 600 }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Card render (mirrors RouteStackCard structure) ────────────────────────

  return (
    <div
      style={{
        background: bgColor,
        borderTop: sideBorder,
        borderRight: sideBorder,
        borderBottom: sideBorder,
        borderLeft: `2px solid ${color}`,
        borderRadius: T.radius,
        padding: "10px 12px",
        cursor: "pointer",
        transition: "background 0.15s, box-shadow 0.15s",
        position: "relative",
        boxShadow: isSelected ? T.shadowMd : T.shadow,
        marginBottom: 8,
        boxSizing: "border-box",
        width: "100%",
        minWidth: 0,
      }}
    >
      {/* ── ROW 1: checkbox · trip id · badges · spacer · info ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 8,
        }}
      >
        {/* Checkbox */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          style={{
            width: 16,
            height: 16,
            borderRadius: 3,
            flexShrink: 0,
            border: `2px solid ${isSelected ? color : T.border}`,
            background: isSelected ? color : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: 0,
          }}
        >
          {isSelected && (
            <svg
              width="10"
              height="10"
              viewBox="0 0 12 12"
              fill="none"
              stroke="#fff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="2 6 5 9 10 3" />
            </svg>
          )}
        </button>

        {/* Trip ID */}
        {/* <span
          style={{
            fontWeight: 700,
            fontSize: T.fontSm,
            color: isSelected ? color : T.text,
            flexShrink: 0,
          }}
        >
          Trip #{trip.dsId}
        </span> */}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            window.open(
              `/routing/route-tracking?dsId=${trip.dsId}`,
              "_blank",
              "noopener,noreferrer",
            );
          }}
          style={{
            fontWeight: 700,
            fontSize: T.fontSm,
            color: T.hyperlink,
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            textDecoration: "underline",
            flexShrink: 0,
          }}
        >
          Trip -{trip.dsId}
        </button>

        {/* Guard badge */}
        {trip.isGuard && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
              padding: "2px 5px",
              borderRadius: 99,
              fontSize: 9,
              fontWeight: 700,
              background: "#EFF6FF",
              border: "0.5px solid #BFDBFE",
              color: "#1E40AF",
            }}
          >
            <Shield size={8} />
            Guard
          </span>
        )}
        {trip.allFemale && (
          <span
            style={{
              padding: "2px 5px",
              borderRadius: 99,
              fontSize: 9,
              fontWeight: 700,
              background: "#FDF2F8",
              border: "0.5px solid #F9A8D4",
              color: "#9D174D",
            }}
          >
            ♀
          </span>
        )}

        <div style={{ flex: 1 }} />

        {/* Assign Vendor + Assign Driver — same CardAssignButtons as cab cards */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 6 }}
          onClick={(e) => e.stopPropagation()}
        >
          <CardAssignButtons
            route={toRouteAdapter(trip)}
            locCode={locCode}
            localVendorId={localVendorId}
            onVendorAssigned={(id) => setLocalVendorId(id)}
            onDriverAssigned={() => onRefetch?.()}
            shuttleStops={trip.stops}
          />
        </div>

        {/* Info popover trigger — stopPropagation to not fire card select */}
        <div onClick={(e) => e.stopPropagation()}>
          <Popover
            content={infoPopoverContent}
            title={null}
            trigger="click"
            placement="leftTop"
          >
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px 3px",
                borderRadius: T.radiusSm,
                color: T.muted,
                fontSize: 13,
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <InfoCircleOutlined />
            </button>
          </Popover>
        </div>
      </div>

      {/* ── ROW 2: stats grid (mirrors RouteStackCard 2fr 1fr 1fr) ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr",
          gap: 4,
          paddingTop: 8,
          borderTop: `1px solid ${T.border}`,
        }}
      >
        {tripType === 1 ? (
          <Stat label="First Stop" value={firstAddress} accent />
        ) : (
          <Stat label="Last Stop" value={lastAddress} accent />
        )}

        <Stat
          label="Distance"
          value={`${trip.routeDistanceKm.toFixed(1)} km`}
        />
        <Stat label="Duration" value={fmtDuration(durationMin)} />
      </div>

      {/* ── ROW 3: assignment badges + time window ── */}
      {/* <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          marginTop: 7,
          flexWrap: "wrap",
        }}
      >
        {[
          { ok: trip.hasVehicleAssigned, label: "Vehicle" },
          { ok: trip.hasDriverAssigned, label: "Driver" },
          { ok: trip.hasEscortAssigned, label: "Escort" },
        ].map(({ ok, label }) => (
          <span
            key={label}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              fontSize: 9,
              fontWeight: 600,
              padding: "2px 6px",
              borderRadius: 999,
              background: ok ? "#DCFCE7" : "#F3F4F6",
              color: ok ? "#16A34A" : "#6B7280",
              border: `1px solid ${ok ? "#BBF7D0" : "#E5E7EB"}`,
              whiteSpace: "nowrap",
            }}
          >
            {ok ? <CheckCircle2 size={8} /> : <Circle size={8} />}
            {label}
          </span>
        ))}

        {timeWindow && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              fontSize: 9,
              fontWeight: 600,
              padding: "2px 7px",
              borderRadius: 999,
              background: "#F0FDF4",
              color: "#15803D",
              border: "1px solid #BBF7D0",
              marginLeft: "auto",
              whiteSpace: "nowrap",
            }}
          >
            <Clock size={8} />
            {timeWindow}
          </span>
        )}
      </div> */}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ShuttleRouteStackPanelProps {
  data: ShuttleAnalyticsResponse | undefined;
  selectedTripIds: number[];
  onSelectTrip: (id: number) => void;
  isFetching: boolean;
  tripType: number;
  locCode: number; // ADD
  onRefetch?: () => void; // ADD
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ShuttleRouteStackPanel({
  data,
  selectedTripIds,
  onSelectTrip,
  isFetching,
  tripType,
  locCode, // ADD
  onRefetch, // ADD
}: ShuttleRouteStackPanelProps) {
  const [search, setSearch] = useState("");
  const [compactMode, setCompactMode] = useState(false);
  // const [sortField, setSortField] = useState<ShuttleSortField>("default");
  // const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Scoped scrollbar CSS id (mirrors RouteStackPanel pattern)
  const listIdRef = useRef(`ssl-${Math.random().toString(36).slice(2, 7)}`);
  const listId = listIdRef.current;

  const trips = data?.trips ?? [];

  // Build colorMap aligned to PALETTE order (same as useShuttleMap)
  const colorMap = useMemo(
    () =>
      Object.fromEntries(trips.map((t, i) => [t.dsId, tripColor(i)])) as Record<
        number,
        string
      >,
    [trips],
  );

  const selectionCount = selectedTripIds.length;

  // ── Filtered + sorted trip list ──────────────────────────────────────────

  const displayedTrips = useMemo(() => {
    let result = [...trips];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          String(t.dsId).includes(q) ||
          t.vehicleRegNo?.toLowerCase().includes(q) ||
          t.driverName?.toLowerCase().includes(q) ||
          t.vendorName?.toLowerCase().includes(q) ||
          t.stops.some((s) =>
            s.passengers.some(
              (p) =>
                p.passengerName.toLowerCase().includes(q) ||
                p.mobileNo.includes(q),
            ),
          ),
      );
    }

    // result.sort((a, b) => {
    //   let va = 0,
    //     vb = 0;
    //   switch (sortField) {
    //     case "distance":
    //       va = a.routeDistanceKm;
    //       vb = b.routeDistanceKm;
    //       break;
    //     case "passengers":
    //       va = a.totalPax;
    //       vb = b.totalPax;
    //       break;
    //     case "duration":
    //       va = parseFloat(a.totalDuration || "0");
    //       vb = parseFloat(b.totalDuration || "0");
    //       break;
    //     default:
    //       return 0;
    //   }
    //   return sortDir === "asc" ? va - vb : vb - va;
    // });

    return result;
  }, [trips, search]);

  const clearSearch = () => setSearch("");

  // ── CSV Export ────────────────────────────────────────────────────────────

  const handleExport = useCallback(() => {
    if (displayedTrips.length === 0) return;
    const headers = [
      "Trip ID",
      "Vendor",
      "Vehicle",
      "Driver",
      "Driver Mobile",
      "Total Pax",
      "Distance (km)",
      "Duration (min)",
      "Stops",
      "Has Vehicle",
      "Has Driver",
      "Has Escort",
      "Is Guard",
      "Is Flagged",
      "Is Approved",
    ];
    const rows = displayedTrips.map((t) => [
      t.dsId,
      t.vendorName ?? "Unassigned",
      t.vehicleRegNo ?? "",
      t.driverName ?? "",
      t.driverMobile ?? "",
      t.totalPax,
      t.routeDistanceKm,
      Math.round(parseFloat(t.totalDuration || "0")),
      t.stops.length,
      t.hasVehicleAssigned ? "Yes" : "No",
      t.hasDriverAssigned ? "Yes" : "No",
      t.hasEscortAssigned ? "Yes" : "No",
      t.isGuard ? "Yes" : "No",
      t.isFlagged ? "Yes" : "No",
      t.isApproved ? "Yes" : "No",
    ]);
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `shuttle-routes-${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [displayedTrips]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        background: "transparent",
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      {/* Scoped thin scrollbar (mirrors RouteStackPanel) */}
      <style>{`
        #${listId}::-webkit-scrollbar { width: 3px; }
        #${listId}::-webkit-scrollbar-track { background: ${T.border}; border-radius: 99px; }
        #${listId}::-webkit-scrollbar-thumb { background: ${T.muted}; border-radius: 99px; min-height: 40px; }
        #${listId}::-webkit-scrollbar-thumb:hover { background: ${T.text}; }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════════
          HEADER — never scrolls
      ══════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          flexShrink: 0,
          background: T.panel,
          zIndex: 10,
          width: "100%",
          boxSizing: "border-box",
          overflowX: "hidden",
        }}
      >
        {/* ── Row 1: title · status · selection count · spacer · export · compact ── */}
        <div
          style={{
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <Bus size={14} color={T.accent} style={{ flexShrink: 0 }} />
          <span
            style={{
              fontWeight: 700,
              fontSize: T.fontMd,
              color: T.text,
              flexShrink: 0,
            }}
          >
            Shuttle Routes
          </span>

          {isFetching && (
            <span style={{ fontSize: 10, color: T.accent, fontWeight: 600 }}>
              Updating...
            </span>
          )}

          {/* Selected count badge */}
          {selectionCount > 0 && (
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "#1B4332",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {selectionCount}
            </span>
          )}

          <div style={{ flex: 1, minWidth: 0 }} />

          {/* Trips count chip */}
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: 999,
              background: T.accentBg,
              color: T.accent,
              flexShrink: 0,
            }}
          >
            {trips.length} {trips.length === 1 ? "trip" : "trips"}
          </span>

          {/* Export CSV */}
          <button
            onClick={handleExport}
            title="Export CSV"
            style={{
              ...TB,
              height: 26,
              width: 26,
              padding: 0,
              justifyContent: "center",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>

          {/* Compact toggle */}
          <button
            type="button"
            onClick={() => setCompactMode((c) => !c)}
            title={compactMode ? "Expand" : "Compact"}
            style={{
              ...TB,
              height: 26,
              width: 26,
              padding: 0,
              justifyContent: "center",
              background: compactMode ? T.accentBg : T.card,
              color: compactMode ? T.accent : T.muted,
              border: `1px solid ${compactMode ? T.accent : T.border}`,
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Row 2 (hidden in compact mode): select-all · search · sort ── */}
        {!compactMode && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 12px",
                boxSizing: "border-box",
              }}
            >
              {/* Select-all checkbox (same logic as RouteStackPanel) */}
              <div
                onClick={() => {
                  if (
                    selectedTripIds.length === displayedTrips.length &&
                    displayedTrips.length > 0
                  ) {
                    // deselect all
                    selectedTripIds.forEach((id) => onSelectTrip(id));
                  } else {
                    // select unselected ones
                    displayedTrips
                      .filter((t) => !selectedTripIds.includes(t.dsId))
                      .forEach((t) => onSelectTrip(t.dsId));
                  }
                }}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 3,
                  flexShrink: 0,
                  border: `2px solid ${selectedTripIds.length > 0 ? T.accent : T.border}`,
                  background:
                    selectedTripIds.length === displayedTrips.length &&
                    displayedTrips.length > 0
                      ? T.accent
                      : selectedTripIds.length > 0
                        ? T.accentBg
                        : "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {selectedTripIds.length > 0 &&
                  selectedTripIds.length < displayedTrips.length && (
                    <div
                      style={{
                        width: 8,
                        height: 2,
                        background: T.accent,
                        borderRadius: 1,
                      }}
                    />
                  )}
                {selectedTripIds.length === displayedTrips.length &&
                  displayedTrips.length > 0 && (
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
              </div>

              {/* Search */}
              <div
                style={{
                  position: "relative",
                  flex: "0 1 55%",
                  minWidth: 0,
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={T.muted}
                  strokeWidth="2.5"
                  style={{
                    position: "absolute",
                    left: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search trip, driver, passenger…"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    height: 28,
                    padding: "0 26px 0 27px",
                    border: `1px solid ${T.border}`,
                    borderRadius: 6,
                    fontSize: T.fontXs,
                    background: "#fff",
                    outline: "none",
                    color: T.text,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = T.accent;
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${T.accentBg}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = T.border;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                {search && (
                  <button
                    onClick={clearSearch}
                    style={{
                      position: "absolute",
                      right: 6,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: T.muted,
                      fontSize: 13,
                      padding: 0,
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sort */}
              {/* <ShuttleSortDropdown
                sortField={sortField}
                sortDir={sortDir}
                onChange={(f, d) => {
                  setSortField(f);
                  setSortDir(d);
                }}
              /> */}
            </div>

            {/* KPI bar */}
            {/* {data && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 6,
                  padding: "6px 12px 8px",
                  background: "#F8FAFC",
                  borderBottom: `1px solid ${T.border}`,
                }}
              >
                {[
                  { label: "Employees", value: data.totalEmployees },
                  {
                    label: "Distance",
                    value: `${data.totalDistanceKm.toFixed(1)} km`,
                  },
                  { label: "Vendors", value: data.totalVendorsAllocated },
                ].map((item) => (
                  <div key={item.label} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: T.text,
                      }}
                    >
                      {item.value}
                    </div>
                    <div style={{ fontSize: 9, color: T.muted }}>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            )} */}
          </>
        )}
      </div>

      {/* Selection hint banner */}
      {selectedTripIds.length > 0 && (
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 12px",
            background: T.accentBg,
            borderBottom: `1px solid ${T.accent}33`,
            fontSize: 10,
            color: T.accent,
            fontWeight: 600,
          }}
        >
          <Bus size={10} />
          Showing stops for Trip #{selectedTripIds[0]} in left panel
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TRIP LIST — only scrollable area
      ══════════════════════════════════════════════════════════════════ */}
      <div
        id={listId}
        style={
          {
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            scrollbarWidth: "thin",
            scrollbarColor: `${T.muted} ${T.border}`,
            padding: "10px 8px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            background: T.bg,
            width: "100%",
            minWidth: 0,
          } as React.CSSProperties
        }
      >
        {displayedTrips.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "56px 16px",
              color: T.muted,
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.22 }}>
              📭
            </div>
            <div style={{ fontSize: T.fontSm }}>
              {isFetching
                ? "Loading shuttle routes…"
                : search
                  ? "No matching trips found"
                  : "No shuttle trips available"}
            </div>
          </div>
        ) : (
          displayedTrips.map((trip) => (
            <ShuttleTripCard
              key={trip.dsId}
              trip={trip}
              color={colorMap[trip.dsId] ?? T.accent}
              isSelected={selectedTripIds.includes(trip.dsId)}
              onSelect={() => onSelectTrip(trip.dsId)}
              tripType={tripType}
              locCode={locCode} // ADD
              onRefetch={onRefetch} // ADD
            />
          ))
        )}
      </div>
    </div>
  );
}
