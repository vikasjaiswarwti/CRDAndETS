// ─── Modals/AssignVendorModal.tsx ─────────────────────────────────────────────
// Assign / reassign a vendor to one OR many trips.
//
//   From a card  → pass routes={[route]}
//                  onSuccess receives (transporterId: number) — used to unlock driver
//
//   From toolbar → pass routes={selectedRoutes}  (any length)
//                  onSuccess receives (undefined)  — caller just refetches
//
// Props
//   routes     — VehicleRoute[]  ALWAYS an array (card wraps single route in [])
//   locCode    — number
//   onSuccess  — (transporterId?: number) => void
//   onClose    — () => void
//
// Left panel behaviour:
//   routes.length === 1  → full passenger cards (locality, gender, address)
//   routes.length  > 1  → trip summary rows (trip id, pax count, current vendor)
//
// APIs:
//   useGetAllVendorsQuery       from vendorApi
//   useAssignVendorMutation     from routeMakerApi  — accepts dsIds: number[]

import { useState, useMemo, useEffect } from "react";
import type { VehicleRoute } from "../types/Routemaker.types";
import { useAssignVendorMutation } from "../services/routeMakerApi";
import { useGetAllVendorsQuery } from "../../vendors/services/vendorApi";
import { message } from "antd";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";

import type { ShuttleStopApi } from "../types/Shuttleapitypes";
import StopWisePassengerList from "../components/Shuttle/StopWisePassengerList";

// ── helpers ───────────────────────────────────────────────────────────────────

function extractApiError(err: unknown): string {
  const data = (err as any)?.data;
  if (!data) return "Assignment failed. Please try again.";
  if (data.errors && typeof data.errors === "object") {
    const msgs: string[] = Object.values(
      data.errors as Record<string, string[]>,
    ).flat();
    if (msgs.length) return msgs.join(" ");
  }
  return data.message ?? data.title ?? "Assignment failed. Please try again.";
}

// ── micro: spinner ────────────────────────────────────────────────────────────

function Spin({ color = "#fff" }: { color?: string }) {
  return (
    <span
      style={{
        width: 11,
        height: 11,
        borderRadius: "50%",
        flexShrink: 0,
        border: `2px solid ${color}40`,
        borderTopColor: color,
        display: "inline-block",
        animation: "avm-spin 0.7s linear infinite",
      }}
    />
  );
}

// ── micro: gender badge ───────────────────────────────────────────────────────

function GenderBadge({ gender }: { gender?: string }) {
  const isFemale = gender === "F";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        fontSize: 9,
        fontWeight: 700,
        color: isFemale ? "#BE185D" : "#1D4ED8",
        background: isFemale ? "#FDF2F8" : "#EFF6FF",
        border: `1px solid ${isFemale ? "#FBCFE8" : "#BFDBFE"}`,
        borderRadius: 4,
        padding: "1px 5px",
      }}
    >
      {isFemale ? "♀" : "♂"}
    </span>
  );
}

// ── props ─────────────────────────────────────────────────────────────────────

interface Props {
  /** Always an array. From a card: [route]. From toolbar: selectedRoutes. */
  routes: VehicleRoute[];
  locCode: number;
  /**
   * Called after successful assignment.
   * transporterId is provided when routes.length === 1 (card use case)
   * so the card can immediately unlock the driver assign button.
   * Ignored / undefined for bulk toolbar use case.
   */
  onSuccess: (transporterId?: number) => void;
  onClose: () => void;
  shuttleStops?: ShuttleStopApi[];
  /** Reports the mutation's in-flight status, so the caller's trip card can show its own loader. */
  onAssigningChange?: (assigning: boolean) => void;
}

// ── component ─────────────────────────────────────────────────────────────────

export default function AssignVendorModal({
  routes,
  locCode,
  onSuccess,
  onClose,
  shuttleStops,
  onAssigningChange,
}: Props) {
  console.log("shuttleStops from AssignVendorModal", shuttleStops);

  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<{ id: number; name: string } | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isMobile = useIsMobile();

  const [leftOpen, setLeftOpen] = useState(!isMobile);

  // ── derived ───────────────────────────────────────────────────────────────

  const isSingle = routes.length === 1;
  const route = routes[0]; // safe for header — always at least 1 element

  const totalPax = useMemo(
    () => routes.reduce((sum, r) => sum + (r.TotalSeatUsed ?? 0), 0),
    [routes],
  );

  const isReassign = routes.some((r) => r.isVenddorAssign);

  // Passengers for the left panel (single-trip mode only)
  const passengers = useMemo(() => {
    if (!isSingle) return [];
    return (route?.Passengers ?? [])
      .slice()
      .sort((a, b) => a.PickupSequence - b.PickupSequence);
  }, [isSingle, route]);

  // ── vendor data ───────────────────────────────────────────────────────────

  const { data: vendorData, isLoading: vendorsLoading } = useGetAllVendorsQuery(
    { page: 1, pageSize: 500, location: String(locCode) },
  );

  const vendorOptions = useMemo(() => {
    const items = (vendorData?.items ?? []).map((v: any) => ({
      id: v.transporterId as number,
      name: (v.vendorName ?? "—") as string,
    }));
    const q = search.toLowerCase();
    return q ? items.filter((v) => v.name.toLowerCase().includes(q)) : items;
  }, [vendorData, search]);

  // ── mutation ──────────────────────────────────────────────────────────────

  const [assignVendor, { isLoading: assigning }] = useAssignVendorMutation();

  useEffect(() => {
    onAssigningChange?.(assigning);
    // Only the in-flight flag itself should trigger this — onAssigningChange
    // is a fresh closure every render from the parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assigning]);

  async function handleAssign() {
    if (!picked || assigning) return;
    setErrorMsg(null);
    try {
      await assignVendor({
        dsIds: routes.map((r) => r.VehicleId),
        transporterId: picked.id,
      }).unwrap();
      message.success("Vendor assigned successfully.");

      // Pass transporterId back for single-trip card use case
      onSuccess(isSingle ? picked.id : undefined);
      onClose();
    } catch (err) {
      setErrorMsg(extractApiError(err));
    }
  }

  const canAssign = !!picked && !assigning;

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`@keyframes avm-spin { to { transform: rotate(360deg); } }`}</style>

      {/* backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15,23,42,0.45)",
          backdropFilter: "blur(4px)",
          zIndex: 4000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* dialog card */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            // width: 560,
            width: isMobile ? "calc(100vw - 16px)" : 560,
            maxWidth: "96vw",
            // maxHeight: "88vh",
            maxHeight: isMobile ? "92vh" : "88vh",
            borderRadius: isMobile ? 10 : 14,
            background: "#fff",
            boxShadow:
              "0 4px 6px -1px rgba(0,0,0,0.07), 0 24px 50px -6px rgba(0,0,0,0.18)",
            border: "1px solid #E5E7EB",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* ════════════ HEADER ════════════ */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 16px",
              borderBottom: "1px solid #F3F4F6",
              background: "#FAFAFA",
              flexShrink: 0,
            }}
          >
            {/* truck icon */}
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                flexShrink: 0,
                background: "linear-gradient(135deg,#1B4332 0%,#16A34A 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="1" y="3" width="15" height="13" rx="2" />
                <path d="M16 8h4l3 3v5h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                {isReassign ? "Reassign Vendor" : "Assign Vendor"}
              </div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>
                {isSingle ? (
                  <>
                    Trip&nbsp;
                    <span style={{ fontWeight: 600, color: "#374151" }}>
                      #{route.VehicleId}
                    </span>
                    {isReassign && route.vendorName && (
                      <>
                        &nbsp;· Current:&nbsp;
                        <strong style={{ color: "#374151" }}>
                          {route.vendorName}
                        </strong>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <span style={{ fontWeight: 600, color: "#374151" }}>
                      {routes.length} trips
                    </span>
                    &nbsp;selected
                  </>
                )}
              </div>
            </div>

            {/* pax badge */}
            <span
              style={{
                padding: "3px 9px",
                borderRadius: 999,
                background: "#DCFCE7",
                color: "#15803D",
                fontSize: 10,
                fontWeight: 700,
                flexShrink: 0,
                border: "1px solid #BBF7D0",
              }}
            >
              {totalPax}&nbsp;pax
            </span>

            {/* close */}
            <button
              onClick={onClose}
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                flexShrink: 0,
                border: "1px solid #E5E7EB",
                background: "#fff",
                color: "#9CA3AF",
                fontSize: 18,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {/* ════════════ BODY ════════════ */}
          <div
            style={{
              display: "flex",
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            {/* ── LEFT: passengers (single) or trip list (bulk) ── */}
            <div
              style={{
                // width: 200,
                width: isMobile ? "100%" : 200,
                // maxHeight: isMobile ? 170 : undefined,
                maxHeight:
                  isMobile && leftOpen ? 170 : isMobile ? "auto" : undefined,
                flexShrink: 0,
                // borderRight: "1px solid #F3F4F6",
                borderRight: isMobile ? "none" : "1px solid #F3F4F6",
                borderBottom: isMobile ? "1px solid #F3F4F6" : "none",
                background: "#F9FAFB",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* column header */}
              {/* <div
                style={{
                  padding: "8px 12px 7px",
                  borderBottom: "1px solid #F3F4F6",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#9CA3AF",
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  flexShrink: 0,
                }}
              >
                {isSingle ? "Passengers" : "Trips"}
                &nbsp;&nbsp;
                <span
                  style={{
                    background: "#E5E7EB",
                    color: "#6B7280",
                    borderRadius: 999,
                    padding: "1px 6px",
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: 0,
                  }}
                >
                  {isSingle ? passengers.length : routes.length}
                </span>
              </div> */}

              {/* column header */}
              <div
                onClick={() => setLeftOpen((o) => !o)}
                style={{
                  padding: "8px 12px 7px",
                  borderBottom: leftOpen ? "1px solid #F3F4F6" : "none",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#9CA3AF",
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  flexShrink: 0,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  userSelect: "none",
                }}
              >
                <span>
                  {isSingle ? "Passengers" : "Trips"}
                  &nbsp;&nbsp;
                  <span
                    style={{
                      background: "#E5E7EB",
                      color: "#6B7280",
                      borderRadius: 999,
                      padding: "1px 6px",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: 0,
                    }}
                  >
                    {isSingle ? passengers.length : routes.length}
                  </span>
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9CA3AF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: leftOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                    flexShrink: 0,
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {/* scrollable content */}
              {leftOpen && (
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: isSingle ? 5 : 4,
                  }}
                >
                  {/* ── SINGLE TRIP: full passenger cards ── */}
                  {/* {isSingle && (
                    <>
                      {passengers.length === 0 ? (
                        <div
                          style={{
                            fontSize: 11,
                            color: "#9CA3AF",
                            textAlign: "center",
                            paddingTop: 20,
                          }}
                        >
                          No passengers
                        </div>
                      ) : (
                        passengers.map((p) => (
                          <div
                            key={p.Id}
                            style={{
                              borderRadius: 9,
                              background: "#fff",
                              border: `1px solid ${p.IsLate ? "#FECACA" : "#F3F4F6"}`,
                              padding: "7px 9px",
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <span
                                style={{
                                  minWidth: 18,
                                  height: 18,
                                  borderRadius: 5,
                                  flexShrink: 0,
                                  background: "#1B4332",
                                  color: "#fff",
                                  fontSize: 9,
                                  fontWeight: 800,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {p.PickupSequence}
                              </span>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: "#111827",
                                  flex: 1,
                                  minWidth: 0,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {p.Firstname}
                              </span>
                              <GenderBadge gender={p.Gender} />
                            </div>

                            {p.locality && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 3,
                                }}
                              >
                                <span style={{ fontSize: 10 }}>
                                  Locality:-{" "}
                                </span>
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 600,
                                    color: "#374151",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {p.locality}
                                </span>
                              </div>
                            )}

                            {p.Address && (
                              <div
                                style={{
                                  fontSize: 9,
                                  color: "#9CA3AF",
                                  lineHeight: 1.4,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical" as any,
                                  overflow: "hidden",
                                }}
                              >
                                <span style={{ fontSize: 10 }}>Address:- </span>
                                {p.Address}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </>
                  )} */}
                  {/* ── SINGLE TRIP: full passenger cards ── */}
                  {isSingle && (
                    <>
                      {/* ── SHUTTLE: stop-wise passenger list ── */}
                      {shuttleStops ? (
                        <StopWisePassengerList stops={shuttleStops} />
                      ) : (
                        /* ── CAB: flat passenger cards (unchanged) ── */
                        <>
                          {passengers.length === 0 ? (
                            <div
                              style={{
                                fontSize: 11,
                                color: "#9CA3AF",
                                textAlign: "center",
                                paddingTop: 20,
                              }}
                            >
                              No passengers
                            </div>
                          ) : (
                            passengers.map((p) => (
                              <div
                                key={p.Id}
                                style={{
                                  borderRadius: 9,
                                  background: "#fff",
                                  border: `1px solid ${p.IsLate ? "#FECACA" : "#F3F4F6"}`,
                                  padding: "7px 9px",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 4,
                                }}
                              >
                                {/* sequence + name */}
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                  }}
                                >
                                  <span
                                    style={{
                                      minWidth: 18,
                                      height: 18,
                                      borderRadius: 5,
                                      flexShrink: 0,
                                      background: "#1B4332",
                                      color: "#fff",
                                      fontSize: 9,
                                      fontWeight: 800,
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    {p.PickupSequence}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 700,
                                      color: "#111827",
                                      flex: 1,
                                      minWidth: 0,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {p.Firstname}
                                  </span>
                                  <GenderBadge gender={p.Gender} />
                                </div>

                                {p.locality && (
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 3,
                                    }}
                                  >
                                    <span style={{ fontSize: 10 }}>
                                      Locality:-{" "}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: 10,
                                        fontWeight: 600,
                                        color: "#374151",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {p.locality}
                                    </span>
                                  </div>
                                )}

                                {p.Address && (
                                  <div
                                    style={{
                                      fontSize: 9,
                                      color: "#9CA3AF",
                                      lineHeight: 1.4,
                                      display: "-webkit-box",
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: "vertical" as any,
                                      overflow: "hidden",
                                    }}
                                  >
                                    <span style={{ fontSize: 10 }}>
                                      Address:-{" "}
                                    </span>
                                    {p.Address}
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </>
                      )}
                    </>
                  )}

                  {/* ── BULK: trip summary rows ── */}
                  {!isSingle &&
                    routes.map((r) => (
                      <div
                        key={r.VehicleId}
                        style={{
                          borderRadius: 8,
                          background: "#fff",
                          border: "1px solid #F3F4F6",
                          padding: "7px 10px",
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#111827",
                            }}
                          >
                            #{r.VehicleId}
                          </span>
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              color: "#6B7280",
                              background: "#F3F4F6",
                              borderRadius: 999,
                              padding: "1px 6px",
                            }}
                          >
                            {r.TotalSeatUsed ?? 0} pax
                          </span>
                        </div>

                        {r.isVenddorAssign && r.vendorName ? (
                          <div
                            style={{
                              fontSize: 9,
                              color: "#9CA3AF",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Current: {r.vendorName}
                          </div>
                        ) : (
                          <div style={{ fontSize: 9, color: "#D97706" }}>
                            No vendor
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* ── RIGHT: vendor search + picker ── */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
              }}
            >
              {/* search bar */}
              <div
                style={{
                  padding: "10px 12px",
                  borderBottom: "1px solid #F3F4F6",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    border: "1px solid #D1D5DB",
                    borderRadius: 8,
                    padding: "6px 10px",
                    background: "#fff",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="2.5"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search vendors…"
                    autoFocus
                    style={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      fontSize: 12,
                      background: "transparent",
                      color: "#111827",
                    }}
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#9CA3AF",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* vendor list */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "8px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                {vendorsLoading ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: "32px 0",
                      color: "#9CA3AF",
                      fontSize: 12,
                    }}
                  >
                    <Spin color="#9CA3AF" /> Loading vendors…
                  </div>
                ) : vendorOptions.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "32px 0",
                      color: "#9CA3AF",
                      fontSize: 12,
                    }}
                  >
                    {search
                      ? `No vendors match "${search}"`
                      : "No vendors available"}
                  </div>
                ) : (
                  vendorOptions.map((v) => {
                    const active = picked?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setPicked(active ? null : v)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "9px 11px",
                          borderRadius: 8,
                          textAlign: "left",
                          border: `1.5px solid ${active ? "#15803D" : "#E5E7EB"}`,
                          background: active ? "#F0FDF4" : "#fff",
                          cursor: "pointer",
                          width: "100%",
                          transition: "border-color 0.1s, background 0.1s",
                        }}
                      >
                        {/* radio dot */}
                        <div
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            flexShrink: 0,
                            border: `2px solid ${active ? "#15803D" : "#D1D5DB"}`,
                            background: active ? "#15803D" : "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {active && (
                            <div
                              style={{
                                width: 5,
                                height: 5,
                                borderRadius: "50%",
                                background: "#fff",
                              }}
                            />
                          )}
                        </div>

                        <span
                          style={{
                            flex: 1,
                            fontSize: 12,
                            fontWeight: active ? 700 : 500,
                            color: active ? "#14532D" : "#374151",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {v.name}
                        </span>

                        {active && (
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#15803D"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* ════════════ ERROR ════════════ */}
          {errorMsg && (
            <div
              style={{
                padding: "8px 16px",
                flexShrink: 0,
                background: "#FEF2F2",
                borderTop: "1px solid #FECACA",
                fontSize: 11,
                color: "#DC2626",
                display: "flex",
                alignItems: "center",
                gap: 6,
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
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {errorMsg}
            </div>
          )}

          {/* ════════════ FOOTER ════════════ */}
          <div
            style={{
              padding: "10px 16px",
              borderTop: "1px solid #F3F4F6",
              background: "#FAFAFA",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: 11, color: "#6B7280" }}>
              {picked ? (
                <>
                  {isReassign ? "Reassigning" : "Assigning"}&nbsp;
                  {!isSingle && (
                    <strong style={{ color: "#374151" }}>
                      {routes.length} trips
                    </strong>
                  )}
                  {!isSingle && " "}to&nbsp;
                  <strong style={{ color: "#14532D" }}>{picked.name}</strong>
                </>
              ) : (
                "Select a vendor to continue"
              )}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={onClose}
                disabled={assigning}
                style={{
                  padding: "7px 18px",
                  borderRadius: 8,
                  border: "1px solid #D1D5DB",
                  background: "#fff",
                  color: "#6B7280",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: assigning ? "not-allowed" : "pointer",
                  opacity: assigning ? 0.6 : 1,
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleAssign}
                disabled={!canAssign}
                style={{
                  padding: "7px 22px",
                  borderRadius: 8,
                  border: "none",
                  background: canAssign
                    ? "linear-gradient(135deg,#1B4332 0%,#16A34A 100%)"
                    : "#E5E7EB",
                  color: canAssign ? "#fff" : "#9CA3AF",
                  fontSize: 12,
                  fontWeight: 700,
                  minWidth: 120,
                  cursor: canAssign ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  justifyContent: "center",
                  boxShadow: canAssign
                    ? "0 2px 8px rgba(22,163,74,0.28)"
                    : "none",
                  transition: "opacity 0.12s",
                }}
              >
                {assigning ? (
                  <>
                    <Spin /> Assigning…
                  </>
                ) : isReassign ? (
                  "Reassign"
                ) : (
                  "Assign Vendor"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
