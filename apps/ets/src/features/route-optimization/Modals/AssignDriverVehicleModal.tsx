// ─── Modals/AssignDriverVehicleModal.tsx ──────────────────────────────────────
// Assign a vehicle + driver to a single trip.
// Opened from "Assign Driver" button on RouteStackCard.

import React, { useState, useMemo, useRef, useEffect } from "react";
import { message, Select } from "antd";
import "antd/dist/reset.css"; // Ant Design v5 — swap for antd/dist/antd.css if on v4
import type { VehicleRoute } from "../types/Routemaker.types";
import type { VehicleOption, DriverOption } from "../types/apiRouteTypes";
import {
  useGetAvailableVehiclesQuery,
  useGetAvailableDriversQuery,
  useAllocateVehicleAndDriverMutation,
} from "../services/routeMakerApi";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";

import type { ShuttleStopApi } from "../types/Shuttleapitypes";
import StopWisePassengerList from "../components/Shuttle/StopWisePassengerList";

// ── helpers ───────────────────────────────────────────────────────────────────

function extractApiError(err: unknown): string {
  const data = (err as any)?.data;
  if (!data) return "Allocation failed. Please try again.";
  if (data.errors && typeof data.errors === "object") {
    const msgs: string[] = Object.values(
      data.errors as Record<string, string[]>,
    ).flat();
    if (msgs.length) return msgs.join(" ");
  }
  return data.message ?? data.title ?? "Allocation failed. Please try again.";
}

const SKIP_DRIVER_ID = -1;

// ── tiny spinner ──────────────────────────────────────────────────────────────

function Spin({ color = "#9CA3AF" }: { color?: string }) {
  return (
    <span
      style={{
        width: 12,
        height: 12,
        borderRadius: "50%",
        border: `2px solid ${color}30`,
        borderTopColor: color,
        display: "inline-block",
        animation: "advm-spin 0.7s linear infinite",
        flexShrink: 0,
      }}
    />
  );
}

// ── gender badge ──────────────────────────────────────────────────────────────

function GenderBadge({ gender }: { gender?: string }) {
  const isFemale = gender === "F";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        fontSize: 10,
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

// ── field label style ─────────────────────────────────────────────────────────

const fieldLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "#6B7280",
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  marginBottom: 6,
  display: "flex",
  alignItems: "center",
  gap: 4,
};

// ── props ─────────────────────────────────────────────────────────────────────

interface Props {
  route: VehicleRoute;
  vendorId: number | null;
  onSuccess: () => void;
  onClose: () => void;
  shuttleStops?: ShuttleStopApi[];
  /** Reports the mutation's in-flight status, so the caller's trip card can show its own loader. */
  onAssigningChange?: (assigning: boolean) => void;
}

// ── component ─────────────────────────────────────────────────────────────────

export default function AssignDriverVehicleModal({
  route,
  vendorId,
  onSuccess,
  onClose,
  shuttleStops,
  onAssigningChange,
}: Props) {
  const dsId = route.VehicleId;
  const modalRef = useRef<HTMLDivElement>(null);

  const [pickedVehicleId, setPickedVehicleId] = useState<number | null>(null);
  const [pickedDriverId, setPickedDriverId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isMobile = useIsMobile();

  const [paxOpen, setPaxOpen] = useState(!isMobile);

  const { data: vehicles = [], isLoading: vehiclesLoading } =
    useGetAvailableVehiclesQuery(
      { dsId, vendorId: vendorId ?? 0 },
      { skip: vendorId == null },
    );

  const { data: drivers = [], isLoading: driversLoading } =
    useGetAvailableDriversQuery(
      { dsId, vendorId: vendorId ?? 0 },
      { skip: vendorId == null },
    );

  const [allocate, { isLoading: allocating }] =
    useAllocateVehicleAndDriverMutation();

  useEffect(() => {
    onAssigningChange?.(allocating);
    // Only the in-flight flag itself should trigger this — onAssigningChange
    // is a fresh closure every render from the parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allocating]);

  const passengers = useMemo(
    () =>
      (route.Passengers ?? [])
        .slice()
        .sort((a, b) => a.PickupSequence - b.PickupSequence),
    [route.Passengers],
  );

  const canAllocate =
    pickedVehicleId !== null && pickedDriverId !== null && !allocating;

  async function handleAllocate() {
    if (!canAllocate) return;
    setErrorMsg(null);
    try {
      await allocate({
        dsId,
        vehicleId: pickedVehicleId!,
        driverId: pickedDriverId === SKIP_DRIVER_ID ? null : pickedDriverId,
      }).unwrap();

      message.success("Vehicle & Driver assigned successfully.");

      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(extractApiError(err));
    }
  }

  // ── Build antd Select options ─────────────────────────────────────────────

  const vehicleOptions = (vehicles as VehicleOption[]).map((v) => ({
    value: v.vehicleId,
    label: [v.vehicleNo ?? `Vehicle ${v.vehicleId}`, v.vehicleModel]
      .filter(Boolean)
      .join("  ·  "),
    searchText: [v.vehicleNo, v.vehicleModel]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  }));

  // const driverOptions = (drivers as DriverOption[]).map((d) => ({
  //   value: d.driverId,
  //   label: [d.driverName ?? `Driver ${d.driverId}`, d.mobileNo]
  //     .filter(Boolean)
  //     .join("  ·  "),
  //   searchText: [d.driverName, d.mobileNo]
  //     .filter(Boolean)
  //     .join(" ")
  //     .toLowerCase(),
  // }));

  const linkedDriverId =
    (vehicles as any[]).find((v) => v.vehicleId === pickedVehicleId)
      ?.driverId ?? null;

  const driverOptions = (drivers as DriverOption[])
    .map((d) => ({
      value: d.driverId,
      label: [d.driverName ?? `Driver ${d.driverId}`, d.mobileNo]
        .filter(Boolean)
        .join("  ·  "),
      searchText: [d.driverName, d.mobileNo]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    }))
    .sort((a, b) =>
      a.value === linkedDriverId ? -1 : b.value === linkedDriverId ? 1 : 0,
    );
  return (
    <>
      <style>{`
        @keyframes advm-spin { to { transform: rotate(360deg); } }

        /* ── Ant Design Select overrides scoped to this modal ── */
        .advm-select .ant-select-selector {
          border-radius: 8px !important;
          border-width: 1.5px !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          color: #111827 !important;
          min-height: 36px !important;
          padding-top: 2px !important;
          padding-bottom: 2px !important;
        }
        .advm-select.ant-select-focused .ant-select-selector,
        .advm-select .ant-select-selector:hover {
          border-color: #1E3A5F !important;
          box-shadow: 0 0 0 2px rgba(30,58,95,0.10) !important;
        }
        .advm-select-vehicle.ant-select:not(.ant-select-disabled) .ant-select-selector {
          border-color: ${pickedVehicleId ? "#1E3A5F" : "#D1D5DB"} !important;
        }
        .advm-select-driver.ant-select:not(.ant-select-disabled) .ant-select-selector {
          border-color: ${pickedDriverId !== null ? "#2563EB" : "#D1D5DB"} !important;
        }
        .advm-select .ant-select-selection-placeholder {
          font-size: 12px !important;
          color: #9CA3AF !important;
        }
        .advm-select .ant-select-selection-search-input {
          font-size: 12px !important;
        }

        /* ── Dropdown panel ── */
        .advm-dropdown {
          z-index: 5000 !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.14) !important;
          padding: 4px !important;
        }
        .advm-dropdown .ant-select-item {
          font-size: 12px !important;
          border-radius: 6px !important;
          padding: 7px 10px !important;
        }
        .advm-dropdown .ant-select-item-option-selected {
          background: #EFF6FF !important;
          color: #1D4ED8 !important;
          font-weight: 600 !important;
        }
        .advm-dropdown .ant-select-item-option-active {
          background: #F3F4F6 !important;
        }
        .advm-dropdown .ant-select-item-empty {
          font-size: 12px !important;
          color: #9CA3AF !important;
        }
      `}</style>

      {/* ── backdrop ── */}
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
        {/* ── dialog card ── */}
        <div
          ref={modalRef}
          onClick={(e) => e.stopPropagation()}
          style={{
            // width: 580,
            width: isMobile ? "calc(100vw - 16px)" : 580,
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
            // NOTE: "visible" so the antd dropdown can overflow downward
            overflow: "visible",
            position: "relative",
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
              borderRadius: "14px 14px 0 0",
            }}
          >
            {/* icon */}
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                flexShrink: 0,
                background: "linear-gradient(135deg,#1E3A5F 0%,#3B82F6 100%)",
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
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                Assign Vehicle &amp; Driver
              </div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>
                Trip&nbsp;
                <span style={{ fontWeight: 600, color: "#374151" }}>
                  #{route.VehicleId}
                </span>
                {route.vendorName && (
                  <>
                    {" "}
                    ·{" "}
                    <span style={{ color: "#374151" }}>{route.vendorName}</span>
                  </>
                )}
              </div>
            </div>

            {/* pax pill */}
            <span
              style={{
                padding: "3px 9px",
                borderRadius: 999,
                background: "#EFF6FF",
                color: "#1D4ED8",
                fontSize: 10,
                fontWeight: 700,
                flexShrink: 0,
                border: "1px solid #BFDBFE",
              }}
            >
              {route.TotalSeatUsed ?? passengers.length}&nbsp;pax
            </span>

            <button
              onClick={onClose}
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                border: "1px solid #E5E7EB",
                background: "#fff",
                color: "#9CA3AF",
                fontSize: 18,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {/* ════════════ BODY ════════════ */}
          {vendorId == null ? (
            /* No vendor assigned yet */
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: 36,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  background: "#FEF3C7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#D97706"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div>
                <div
                  style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}
                >
                  No vendor assigned
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#6B7280",
                    marginTop: 4,
                    maxWidth: 290,
                    lineHeight: 1.6,
                  }}
                >
                  Use <strong>Assign Vendor</strong> first, then return here to
                  assign vehicle &amp; driver.
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  marginTop: 4,
                  padding: "8px 22px",
                  borderRadius: 8,
                  border: "1px solid #D1D5DB",
                  background: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flex: 1,
                minHeight: 0,
                // allow children to scroll internally but not clip the dropdown
                overflow: "visible",
                flexDirection: isMobile ? "column" : "row",
              }}
            >
              {/* ── LEFT: passenger cards ── */}
              <div
                style={{
                  // width: 210,
                  width: isMobile ? "100%" : 210,
                  maxHeight: isMobile ? 180 : undefined,
                  flexShrink: 0,
                  // borderRight: "1px solid #F3F4F6",
                  borderRight: isMobile ? "none" : "1px solid #F3F4F6",
                  borderBottom: isMobile ? "1px solid #F3F4F6" : "none",
                  background: "#F9FAFB",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: isMobile ? 0 : "0 0 0 14px",
                  // clip only the passenger list, not the right panel
                  overflow: "hidden",
                }}
              >
                {/* column header */}
                {/* <div
                  onClick={() => setPaxOpen((o) => !o)}
                  style={{
                    padding: "8px 12px 7px",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#9CA3AF",
                    letterSpacing: "0.07em",
                    borderBottom: paxOpen ? "1px solid #F3F4F6" : "none",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    userSelect: "none",
                    flexShrink: 0,
                  }}
                >
                  Passengers&nbsp;&nbsp;
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
                    {passengers.length}
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
                      transform: paxOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                      flexShrink: 0,
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div> */}

                {/* column header */}
                <div
                  onClick={() => setPaxOpen((o) => !o)}
                  style={{
                    padding: "8px 12px 7px",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#9CA3AF",
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    borderBottom: paxOpen ? "1px solid #F3F4F6" : "none",
                    flexShrink: 0,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    userSelect: "none",
                  }}
                >
                  <span>
                    Passengers&nbsp;&nbsp;
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
                      {passengers.length}
                    </span>
                  </span>
                  {/* chevron */}

                  <div style={{ display: "flex" }}>
                    {isMobile && (
                      <span style={{ marginRight: "2px" }}>
                        Click here to expand
                      </span>
                    )}
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
                        transform: paxOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                        flexShrink: 0,
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* scrollable list */}
                {/* {paxOpen && (
                  <div
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      padding: 8,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    {passengers.length === 0 ? (
                      <div
                        style={{
                          fontSize: 11,
                          color: "#9CA3AF",
                          textAlign: "center",
                          paddingTop: 24,
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
                            padding: "8px 10px",
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
                                minWidth: 20,
                                height: 20,
                                borderRadius: 6,
                                flexShrink: 0,
                                background: "#1E3A5F",
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
                                fontSize: 12,
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
                                gap: 4,
                              }}
                            >
                              <span style={{ fontSize: 11 }}>Locality:- </span>
                              <span
                                style={{
                                  fontSize: 11,
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
                                fontSize: 10,
                                lineHeight: 1.4,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              <span style={{ fontSize: 11 }}>Address:- </span>
                              {p.Address}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )} */}

                {paxOpen && (
                  <div
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      padding: 8,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    {/* ── SHUTTLE: stop-wise ── */}
                    {shuttleStops ? (
                      <StopWisePassengerList stops={shuttleStops} />
                    ) : (
                      /* ── CAB: flat list (unchanged) ── */
                      <>
                        {passengers.length === 0 ? (
                          <div
                            style={{
                              fontSize: 11,
                              color: "#9CA3AF",
                              textAlign: "center",
                              paddingTop: 24,
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
                                padding: "8px 10px",
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
                                    minWidth: 20,
                                    height: 20,
                                    borderRadius: 6,
                                    flexShrink: 0,
                                    background: "#1E3A5F",
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
                                    fontSize: 12,
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
                                    gap: 4,
                                  }}
                                >
                                  <span style={{ fontSize: 11 }}>
                                    Locality:-{" "}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 11,
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
                                    fontSize: 10,
                                    lineHeight: 1.4,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                >
                                  <span style={{ fontSize: 11 }}>
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
                  </div>
                )}
              </div>

              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  padding: "16px 18px",
                  gap: 5,
                  overflowY: "auto",
                  minWidth: 0,
                }}
              >
                <div>
                  <div style={fieldLabel}>
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6B7280"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    Vehicle
                    <span
                      style={{
                        color: "#EF4444",
                        fontWeight: 400,
                        fontSize: 11,
                        letterSpacing: 0,
                        textTransform: "none",
                      }}
                    >
                      *
                    </span>
                  </div>

                  {vehiclesLoading ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 0",
                        fontSize: 12,
                        color: "#9CA3AF",
                      }}
                    >
                      <Spin /> Loading vehicles…
                    </div>
                  ) : (
                    <>
                      <Select
                        showSearch
                        allowClear
                        placeholder="— Select vehicle —"
                        style={{ width: "100%" }}
                        className="advm-select advm-select-vehicle"
                        value={pickedVehicleId ?? undefined}
                        // onChange={(val) =>
                        //   setPickedVehicleId(val !== undefined ? val : null)
                        // }

                        onChange={(val) => {
                          setPickedVehicleId(val ?? null);
                          const linked =
                            (vehicles as any[]).find((v) => v.vehicleId === val)
                              ?.driverId ?? null;
                          setPickedDriverId(linked);
                        }}
                        filterOption={(input, option) =>
                          (option?.searchText ?? "").includes(
                            input.toLowerCase(),
                          )
                        }
                        options={vehicleOptions}
                        notFoundContent={
                          <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                            No vehicles found
                          </span>
                        }
                        // Render dropdown relative to the modal card so it
                        // never gets clipped by any parent overflow:hidden
                        getPopupContainer={() =>
                          modalRef.current ?? document.body
                        }
                        // Always open below the trigger; never auto-flip up

                        popupClassName="advm-dropdown"
                      />
                      {vehicles.length === 0 && (
                        <p
                          style={{
                            margin: "6px 0 0",
                            fontSize: 11,
                            color: "#9CA3AF",
                          }}
                        >
                          No vehicles available for this vendor.
                        </p>
                      )}
                    </>
                  )}
                </div>

                {pickedVehicleId && (
                  <p
                    style={{
                      fontSize: 11,
                      color:
                        linkedDriverId == null
                          ? "#6B7280"
                          : driverOptions.find(
                                (d) => d.value === linkedDriverId,
                              )
                            ? "#059669"
                            : "#DC2626",
                    }}
                  >
                    {linkedDriverId == null
                      ? "No mapped driver, please select driver"
                      : driverOptions.find((d) => d.value === linkedDriverId)
                        ? "✓ Driver found"
                        : "Driver not found in available list"}
                  </p>
                )}

                {/* ── Driver ── */}
                <div>
                  <div style={fieldLabel}>
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6B7280"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                    </svg>
                    Driver
                    <span
                      style={{
                        color: "#EF4444",
                        fontWeight: 400,
                        fontSize: 11,
                        letterSpacing: 0,
                        textTransform: "none",
                      }}
                    >
                      *
                    </span>
                  </div>

                  {driversLoading ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 0",
                        fontSize: 12,
                        color: "#9CA3AF",
                      }}
                    >
                      <Spin /> Loading drivers…
                    </div>
                  ) : (
                    <Select
                      showSearch
                      allowClear
                      placeholder="— Select driver —"
                      style={{ width: "100%" }}
                      className="advm-select advm-select-driver"
                      value={pickedDriverId ?? undefined}
                      onChange={(val) =>
                        setPickedDriverId(val !== undefined ? val : null)
                      }
                      filterOption={(input, option) =>
                        (option?.searchText ?? "").includes(input.toLowerCase())
                      }
                      options={driverOptions}
                      notFoundContent={
                        <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                          No drivers found
                        </span>
                      }
                      getPopupContainer={() =>
                        modalRef.current ?? document.body
                      }
                      popupClassName="advm-dropdown"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ════════════ ERROR STRIP ════════════ */}
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
              justifyContent: "flex-end",
              gap: 8,
              flexShrink: 0,
              borderRadius: "0 0 14px 14px",
            }}
          >
            <button
              onClick={onClose}
              disabled={allocating}
              style={{
                padding: "7px 18px",
                borderRadius: 8,
                border: "1px solid #D1D5DB",
                background: "#fff",
                color: "#6B7280",
                fontSize: 12,
                fontWeight: 600,
                cursor: allocating ? "not-allowed" : "pointer",
                opacity: allocating ? 0.6 : 1,
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleAllocate}
              disabled={!canAllocate}
              style={{
                padding: "7px 22px",
                borderRadius: 8,
                border: "none",
                background: canAllocate
                  ? "linear-gradient(135deg,#1E3A5F 0%,#2563EB 100%)"
                  : "#E5E7EB",
                color: canAllocate ? "#fff" : "#9CA3AF",
                fontSize: 12,
                fontWeight: 700,
                cursor: canAllocate ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: 7,
                minWidth: 110,
                justifyContent: "center",
                boxShadow: canAllocate
                  ? "0 2px 8px rgba(37,99,235,0.28)"
                  : "none",
                transition: "opacity 0.12s",
              }}
            >
              {allocating ? (
                <>
                  <Spin color="#fff" />
                  Allocating…
                </>
              ) : (
                "Allocate"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
