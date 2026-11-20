// ─── components/RouteStackCard.tsx ───────────────────────────────────────────
//
// FIXES IN THIS VERSION
// ─────────────────────
// 1. Info popover was invisible: two nested divs both had
//    onClick stopPropagation — the outer div ate the click before the
//    Popover trigger could fire. Removed the redundant inner wrapper.
//
// 2. Assign Vendor crash: CardAssignButtons now owns vendor/driver modal
//    state. It wraps the single `route` in an array for AssignVendorModal.
//
// 3. Triple-dot menu: pin, flag, approve moved into a ⋯ popover to save
//    row space. Only the adhoc (+) and info (ℹ) buttons stay inline.
//
// 4. localVendorId: card tracks the transporterId returned after vendor
//    assignment so the driver button unlocks immediately.

import React, { useEffect, useState } from "react";
import { T } from "../constants/designTokens";
import type { VehicleRoute } from "../types/Routemaker.types";
import {
  fmtDuration,
  fmtDist,
  firstStopLabel,
  lastStopLabel,
  fmt12,
} from "../utils/routeMakerHelpers";

import Icon from "./Icon";
import GuardSvg from "../assets/icons/guard.svg";
import PinnedSvg from "../assets/icons/pinned.svg";
import PinnedEmptySvg from "../assets/icons/pinEmpty.svg";

import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { InfoCircleOutlined } from "@ant-design/icons";
import { buildCardTooltips } from "./Routestackcardtooltips";

import AddAdhocEmployeeModal from "../Modals/AddAdhocEmployeeInExistingTrip";
import CardAssignButtons from "./RightSideSection/Cardassignbuttons";

import AssignGuardModal from "../Modals/AssignGuardModal";
import PublishTripModal from "../Modals/PublishTripModal";

// ADD to imports at top of RouteStackCard.tsx
import {
  Building2,
  Car,
  User,
  Shield,
  CheckCircle2,
  MapPin,
  Clock,
  Users,
  Hash,
  Printer,
  Pencil,
} from "lucide-react";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";
import { InlineMobilePassengerList } from "./PassengersPopupMobile";

import { PassengerNamesPreview } from "./PassengerNamesPreview"; // ← add
import { Progress } from "antd";
import type { DragPassenger } from "../hooks/useDragAndDrop";
// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  route: VehicleRoute;
  color: string;
  isActive: boolean;
  isOverZone: boolean;
  isPinned: boolean;
  onSelect: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onAssign: () => void; // kept for RouteStackPanel compat; not used inside card
  onFlag: () => void;
  onApprove: () => void;
  onPin?: () => void;
  onDeallocate?: () => void;
  onEditTrip: (route: VehicleRoute) => void;
  onSplit?: (vehicleId: number, employeeIds: number[]) => void;
  onMobilePassengerDrop?: (
    passenger: DragPassenger,
    targetVehicleId: number,
  ) => void;

  isFlagged?: boolean;
  isApproved?: boolean;
  isFlagLoading?: boolean;
  isApproveLoading?: boolean;
  isDeallocateLoading?: boolean;
  isAssigning?: boolean;

  locCode: number;
  tripType: number;
  shiftId: number;
  routeDate: string;
  onRefetch?: () => void;
  onTripActionLoadingChange?: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}

// ── Trip-status map ───────────────────────────────────────────────────────────

const TRIP_STATUS: Record<number, string> = {
  1: "Created",
  2: "Printed",
  3: "Started",
  4: "End",
  5: "Audited",
  6: "Billed",
  9: "Cancelled",
};

// Badge colors per status code — falls back to a neutral grey for
// unmapped/unknown codes so the label is always legible.
const TRIP_STATUS_STYLE: Record<
  number,
  { bg: string; border: string; color: string }
> = {
  1: { bg: "#EFF6FF", border: "#BFDBFE", color: "#1E40AF" }, // Created — blue
  2: { bg: "#F5F3FF", border: "#DDD6FE", color: "#5B21B6" }, // Printed — violet
  3: { bg: "#FFFBEB", border: "#FDE68A", color: "#92400E" }, // Started — amber
  4: { bg: "#F3F4F6", border: "#D1D5DB", color: "#374151" }, // End — grey
  5: { bg: "#ECFEFF", border: "#A5F3FC", color: "#155E75" }, // Audited — cyan
  6: { bg: "#ECFDF5", border: "#A7F3D0", color: "#065F46" }, // Billed — green
  9: { bg: "#FEF2F2", border: "#FECACA", color: "#991B1B" }, // Cancelled — red
};

const DEFAULT_STATUS_STYLE = {
  bg: "#F3F4F6",
  border: "#E5E7EB",
  color: "#6B7280",
};

// ── IconBtn ───────────────────────────────────────────────────────────────────

// ── Stat cell ─────────────────────────────────────────────────────────────────

function Stat({
  label,
  value,
  accent,
  color,
}: {
  label: string;
  value: string;
  accent?: boolean;
  color?: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: T.fontXs,
          fontWeight: 800,
          // color: accent ? T.text : T.textSm,
          color: color ?? (accent ? T.text : T.textSm), // ← color wins
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 9,
          color: T.muted,
          marginTop: 1,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
    </div>
  );
}
const getOccupancyColor = (percent: number) => {
  if (percent >= 90) return "#22C55E"; // Green
  if (percent >= 70) return "#F59E0B"; // Yellow
  if (percent >= 50) return "#F97316"; // Orange
  return "#EF4444"; // Red
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function RouteStackCard({
  route,
  color,
  isActive,
  isOverZone,
  isPinned = true,
  onSelect,
  onDragOver,
  onDragLeave,
  onDrop,
  onFlag,
  onApprove,
  onPin,
  onDeallocate,
  onEditTrip,
  onSplit,
  onMobilePassengerDrop,

  isFlagged = false,
  isApproved = false,
  isFlagLoading = false,
  isApproveLoading = false,
  isDeallocateLoading = false,
  isAssigning = false,
  locCode,
  tripType,
  shiftId,
  routeDate,
  onRefetch,
  onTripActionLoadingChange,
}: Props) {
  const { Popover, Popconfirm } = useUILibrary();

  const isMobile = useIsMobile();

  const [showPassengers, setShowPassengers] = useState(false);

  const [showAdhocModal, setShowAdhocModal] = useState(false);
  const [isDotsMenuOpen, setIsDotsMenuOpen] = useState(false);

  const [showGuardModal, setShowGuardModal] = useState(false);

  const [showPublishModal, setShowPublishModal] = useState(false);
  // Track the vendorId assigned THIS session so driver modal unlocks immediately
  // const [localVendorId, setLocalVendorId] = useState<number | null>(null);

  // const [localVendorId, setLocalVendorId] = useState<number | null>(
  //   route.isVenddorAssign ? ((route as any).transporterId ?? -1) : null,
  // );

  // REPLACE with:
  const [localVendorId, setLocalVendorId] = useState<number | null>(
    route.isVenddorAssign ? ((route as any).transporterId ?? -1) : null,
  );

  // console.log("route from RouteStackCard", route);

  useEffect(() => {
    setLocalVendorId(
      route.isVenddorAssign ? ((route as any).transporterId ?? -1) : null,
    );
  }, [route.isVenddorAssign, (route as any).transporterId]);

  //route Passengers

  const TT = buildCardTooltips({
    route,
    isFlagged,
    isApproved,
    isPinned,
    hasVendor: !!route.isVenddorAssign,
    vendorName: route.vendorName,
  });

  // const firstStop = firstStopLabel(route);

  const stopLabel =
    tripType === 2 ? lastStopLabel(route) : firstStopLabel(route);

  const dist = fmtDist(route.RouteDistanceKm);
  const extraDist = `${route.ExtraDistanceKm ?? 0} km`;
  const eta = fmt12(route.EstimatedOfficeArrival);
  const duration = fmtDuration(route.RouteDurationMinutes);
  const isLate = route.AnyCabMemberIsLate;

  const isCancelled = route.tripStatusCode === 9;

  const sideBorder = `1px solid ${
    isCancelled ? T.danger : isOverZone ? color : isActive ? color : T.border
  }`;
  const bgColor = isCancelled
    ? T.dangerBgCancelled
    : isActive
      ? isLate
        ? T.warnBg
        : `${color}12`
      : T.panel;

  // ── Info popover content ──────────────────────────────────────────────────

  const statusLabel =
    TRIP_STATUS[route.tripStatusCode] ?? `Code ${route.tripStatusCode}`;
  const statusStyle =
    TRIP_STATUS_STYLE[route.tripStatusCode] ?? DEFAULT_STATUS_STYLE;

  const infoPopoverContent = (
    <div style={{ width: 240, fontFamily: "inherit" }}>
      {/* ── Header ── */}
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
            Trip {route.VehicleId}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginTop: 4,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "1px 7px",
                borderRadius: 99,
                fontSize: 9,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.03em",
                background: statusStyle.bg,
                border: `1px solid ${statusStyle.border}`,
                color: statusStyle.color,
              }}
            >
              {statusLabel}
            </span>
            {route.flapNo ? (
              <span style={{ fontSize: 10, color: "#9CA3AF" }}>
                Flap #{route.flapNo}
              </span>
            ) : null}
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
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
            {route.TotalSeatUsed ?? 0}
          </span>
          {route.IsFemaleTrip && (
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
          {route.IsSpecialNeedTrip && (
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

      {/* ── Assignment cards ── */}
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
              ok: !!route.vendorPrefixTag,
              value: route.vendorName,
              sub: null,
            },
            {
              icon: <Car size={12} />,
              label: "Vehicle",
              ok: !!route.hasVehicleAssigned,
              value: route.vehicleRegNo,
              sub: null,
            },
            {
              icon: <User size={12} />,
              label: "Driver",
              ok: !!route.hasDriverAssigned,
              value: route.driverName,
              sub: route.driverMobile,
            },
            {
              icon: <Shield size={12} />,
              label: "Escort",
              ok: !!route.hasEscortAssigned,
              value: (route as any).escortName,
              sub: (route as any).escortMobile,
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
            {/* Icon circle */}
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

            {/* Text */}
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

            {/* Status icon */}
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

      {/* ── Quick stats ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {[
          {
            icon: <MapPin size={10} />,
            label: "Extra dist.",
            value: extraDist ? `${parseFloat(extraDist).toFixed(2)} KM` : "—",
          },
          { icon: <Clock size={10} />, label: "ETA", value: eta },
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

  // helper — add above the component or in a utils file
  function chip(
    bg: string,
    border: string,
    color: string,
  ): React.CSSProperties {
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: 2,
      padding: "2px 5px",
      borderRadius: 99,
      fontSize: 10,
      fontWeight: 600,
      background: bg,
      border: `0.5px solid ${border}`,
      color,
    };
  }
  // ── Triple-dot menu content (pin · flag · approve) ────────────────────────

  const dotsMenuContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        minWidth: 130,
      }}
      // FIX: do NOT stopPropagation here — Popover already handles this
    >
      {/* Pin */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPin?.();
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 8px",
          border: "none",
          background: "none",
          borderRadius: 6,
          cursor: "pointer",
          fontSize: 12,
          color: isPinned ? color : T.text,
          fontWeight: isPinned ? 600 : 400,
          width: "100%",
          textAlign: "left",
        }}
      >
        <Icon src={isPinned ? PinnedSvg : PinnedEmptySvg} size={13} />
        {isPinned ? "Unpin" : "Pin"}
      </button>

      {/* Flag */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onFlag();
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 8px",
          border: "none",
          background: "none",
          borderRadius: 6,
          cursor: isFlagLoading ? "not-allowed" : "pointer",
          fontSize: 12,
          color: isFlagged ? T.flagColor : T.text,
          fontWeight: isFlagged ? 600 : 400,
          width: "100%",
          textAlign: "left",
          opacity: isFlagLoading ? 0.5 : 1,
        }}
      >
        {isFlagLoading ? (
          <span style={{ fontSize: 10 }}>…</span>
        ) : (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill={isFlagged ? T.flagColor : "none"}
            stroke={isFlagged ? T.flagColor : T.muted}
            strokeWidth="2"
          >
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" y1="22" x2="4" y2="15" />
          </svg>
        )}
        {isFlagged ? "Unflag" : "Flag"}
      </button>

      {/* Approve */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onApprove();
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 8px",
          border: "none",
          background: "none",
          borderRadius: 6,
          cursor: isApproveLoading ? "not-allowed" : "pointer",
          fontSize: 12,
          color: isApproved ? "#22C55E" : T.text,
          fontWeight: isApproved ? 600 : 400,
          width: "100%",
          textAlign: "left",
          opacity: isApproveLoading ? 0.5 : 1,
        }}
      >
        {isApproveLoading ? (
          <span style={{ fontSize: 10 }}>…</span>
        ) : (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isApproved ? "#22C55E" : T.muted}
            strokeWidth={isApproved ? "2.8" : "2"}
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        )}
        {isApproved ? "Approved ✓" : "Approve"}
      </button>

      {/* Publish trip — opens a confirmation modal before publishing */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowPublishModal(true);
        }}
        disabled={isCancelled}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 8px",
          border: "none",
          background: "none",
          borderRadius: 6,
          cursor: isCancelled ? "not-allowed" : "pointer",
          fontSize: 12,
          color: T.text,
          fontWeight: 400,
          width: "100%",
          textAlign: "left",
          opacity: isCancelled ? 0.5 : 1,
        }}
      >
        <Printer size={12} />
        Publish Trip
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsDotsMenuOpen(false);
          onEditTrip(route);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 8px",
          border: "none",
          background: "none",
          borderRadius: 6,
          cursor: "pointer",
          fontSize: 12,
          color: T.text,
          fontWeight: 400,
          width: "100%",
          textAlign: "left",
          opacity: 1,
        }}
      >
        <Pencil size={12} />
        Edit Trip
      </button>

      {/* Deallocate vehicle — only when a vehicle is currently assigned */}
      {route.hasVehicleAssigned && (
        <Popconfirm
          title="Deallocate vehicle?"
          description={`This removes the assigned vehicle from Trip #${route.VehicleId}.`}
          okText="Deallocate"
          cancelText="Cancel"
          placement="left"
          onConfirm={(e) => {
            e?.stopPropagation();
            onDeallocate?.();
          }}
          onCancel={(e) => e?.stopPropagation()}
        >
          <button
            // onClick={(e) => e.stopPropagation()}
            disabled={isDeallocateLoading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 8px",
              border: "none",
              background: "none",
              borderRadius: 6,
              cursor: isDeallocateLoading ? "not-allowed" : "pointer",
              fontSize: 12,
              color: T.danger,
              fontWeight: 400,
              width: "100%",
              textAlign: "left",
              opacity: isDeallocateLoading ? 0.5 : 1,
            }}
          >
            {isDeallocateLoading ? (
              <span style={{ fontSize: 10 }}>…</span>
            ) : (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke={T.danger}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="1" y="6" width="15" height="11" rx="2" />
                <path d="M16 9h2.5a2 2 0 0 1 1.8 1.1l1.7 3.4V17h-2" />
                <circle cx="6" cy="17.5" r="1.5" />
                <circle cx="15" cy="17.5" r="1.5" />
                <line x1="3" y1="3" x2="21" y2="21" />
              </svg>
            )}
            Deallocate Vehicle
          </button>
        </Popconfirm>
      )}

      {route.IsGuardAllocated && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowGuardModal(true);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 8px",
            border: "none",
            background: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 12,
            color: route.hasEscortAssigned ? "#059669" : T.text,
            fontWeight: route.hasEscortAssigned ? 600 : 400,
            width: "100%",
            textAlign: "left",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          {route.hasEscortAssigned ? "Reassign Guard" : "Assign Guard"}
        </button>
      )}
    </div>
  );

  // ── Badge dots (female · guard · special) ─────────────────────────────────

  // ── Render ────────────────────────────────────────────────────────────────
  const occupancyPercent =
    route.capacity > 0 ? (route.occupancy / route.capacity) * 100 : 0;
  const occupancyColor = getOccupancyColor(occupancyPercent);
  return (
    <div
      data-route-card-id={route.VehicleId}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        background: bgColor,
        borderTop: sideBorder,
        borderRight: sideBorder,
        borderBottom: sideBorder,
        borderLeft: `2px solid ${isCancelled ? T.danger : color}`,
        borderRadius: T.radius,
        padding: "10px 12px",
        cursor: "pointer",
        transition: "background 0.15s, box-shadow 0.15s",
        position: "relative",
        boxShadow: isActive ? T.shadowMd : T.shadow,
      }}
    >
      {/* Assign-in-progress overlay — shown only on this card while its own
          vendor/driver assignment mutation (and the refetch it triggers) is
          in flight, so a single card's action never looks like the whole
          list is busy. */}
      {isAssigning && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: T.radius,
            background: "rgba(255,255,255,0.72)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3,
          }}
        >
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              border: `2.5px solid ${color}40`,
              borderTopColor: color,
              display: "inline-block",
              animation: "rscAssignSpin 0.7s linear infinite",
            }}
          />
          <style>{`@keyframes rscAssignSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Drop overlay */}
      {isOverZone && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: T.radius,
            background: `${T.accent}14`,
            border: `2px dashed ${T.accent}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: T.fontXs,
            color,
            fontWeight: 700,
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          Drop to reassign
        </div>
      )}

      {/* ── ROW 1: checkbox · trip link · badges · pax · assign btns · actions ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 8,
        }}
      >
        {/* Checkbox */}
        <Popover
          content={
            isCancelled ? (
              <span style={{ fontSize: 11, color: T.muted }}>
                Trip is cancelled — it can't be selected for bulk actions.
              </span>
            ) : null
          }
          title={null}
          trigger="hover"
          placement="top"
        >
          <button
            type="button"
            disabled={isCancelled}
            onClick={(e) => {
              e.stopPropagation();
              if (isCancelled) return;
              onSelect();
            }}
            style={{
              width: 16,
              height: 16,
              borderRadius: 3,
              flexShrink: 0,
              border: `2px solid ${isCancelled ? T.border : isActive ? color : T.border}`,
              background: isCancelled
                ? T.border
                : isActive
                  ? color
                  : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: isCancelled ? "not-allowed" : "pointer",
              opacity: isCancelled ? 0.6 : 1,
              padding: 0,
            }}
          >
            {isActive && !isCancelled && (
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
        </Popover>

        {/* Trip ID link */}
        <Popover
          content={
            <div style={{ fontWeight: 600, fontSize: 11 }}>
              {isCancelled
                ? "Trip is cancelled — tracking is unavailable."
                : "Click to open the tracking page."}
            </div>
          }
          title={null}
          trigger="hover"
          placement="top"
        >
          <button
            type="button"
            disabled={isCancelled}
            onClick={(e) => {
              e.stopPropagation();
              if (isCancelled) return;
              window.open(
                `/routing/route-tracking?dsId=${route.VehicleId}`,
                "_blank",
                "noopener,noreferrer",
              );
            }}
            style={{
              fontWeight: 700,
              fontSize: T.fontSm,
              color: isCancelled ? T.danger : T.hyperlink,
              background: "none",
              border: "none",
              padding: 0,
              cursor: isCancelled ? "not-allowed" : "pointer",
              textDecoration: "underline",
              flexShrink: 0,
            }}
          >
            {route.VehicleId}
          </button>
        </Popover>
        <Popover
          content={
            <div
              style={{
                fontWeight: 600,
                fontSize: 11,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span> Occupancy: {route.occupancy}</span>
              <span> Capacity: {route.capacity}</span>
            </div>
          }
          title={null}
          trigger="hover"
          placement="top"
        >
          <Progress
            type="circle"
            percent={occupancyPercent}
            strokeWidth={4}
            format={() => `${route.occupancy}/${route.capacity}`}
            strokeColor={occupancyColor}
            size={22}
            styles={{
              indicator: {
                fontSize: 9,
                fontWeight: 800,
              },
            }}
          />
        </Popover>
        {route.IsGuardAllocated && (
          <span style={chip("#EFF6FF", "#93C5FD", "#1E40AF")}>
            <Icon src={GuardSvg} size={10} />
          </span>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Assign Vendor + Assign Driver — CardAssignButtons handles modals */}
        {/* FIX: stopPropagation only on the wrapper, not on a nested div too */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 6 }}
          onClick={(e) => e.stopPropagation()}
        >
          <CardAssignButtons
            route={route}
            locCode={locCode}
            localVendorId={localVendorId}
            onVendorAssigned={(id) => setLocalVendorId(id)}
            onDriverAssigned={() => onRefetch?.()}
            onTripActionLoadingChange={onTripActionLoadingChange}
            disabled={isCancelled}
          />
        </div>

        {/* Adhoc add employee */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Popover
            content={
              isCancelled ? (
                <span style={{ fontSize: 11, color: T.muted }}>
                  Trip is cancelled — can't add an employee.
                </span>
              ) : (
                TT.adhoc
              )
            }
            title={null}
            trigger="hover"
            placement="top"
          >
            <button
              disabled={isCancelled}
              onClick={() => {
                if (isCancelled) return;
                setShowAdhocModal(true);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: isCancelled ? "not-allowed" : "pointer",
                opacity: isCancelled ? 0.5 : 1,
                padding: "2px 3px",
                color: T.muted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
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
                <circle cx="12" cy="12" r="9" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </button>
          </Popover>

          {/* Triple-dot menu: pin · flag · approve */}
          <Popover
            content={dotsMenuContent}
            title={null}
            trigger="click"
            placement="bottomRight"
            open={isDotsMenuOpen}
            onOpenChange={setIsDotsMenuOpen}
          >
            <button
              title="More actions"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px 3px",
                borderRadius: T.radiusSm,
                color: T.muted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="none"
              >
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
          </Popover>

          {/* Info popover — click trigger, NO stopPropagation wrapper here */}
          {!isMobile && (
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
          )}
        </div>
      </div>

      {/* ── ROW 2: stats ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: 4,
          paddingTop: 8,
          borderTop: `1px solid ${T.border}`,
        }}
      >
        <Stat
          label={tripType === 2 ? "Last Stop" : "First Stop"}
          value={stopLabel}
          accent
        />
        <Stat label="Duration" value={duration} />
        <Stat label="Distance" value={dist} />
        {/* ── 4th col: Cancelled (red) | Copied (grey + hover date) | Generated (green) ── */}
        {isCancelled ? (
          <div style={{ fontSize: T.fontXs, fontWeight: 800, color: T.danger }}>
            Cancelled
          </div>
        ) : route.copied ? (
          <Popover
            content={
              <div style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>
                Copied from&nbsp;
                <span style={{ color: "#111827" }}>{route.copiedFrom}</span>
              </div>
            }
            title={null}
            trigger="hover"
            placement="top"
          >
            <div style={{ cursor: "help" }}>
              <Stat label="Source" value="Copied" color="#9CA3AF" />
            </div>
          </Popover>
        ) : (
          <div
            style={{ fontSize: T.fontXs, fontWeight: 800, color: "#16A34A" }}
          >
            Generated
          </div>
        )}

        {/* ── Inline passenger list — mobile only ── */}
      </div>

      {isMobile && !showPassengers && (
        <PassengerNamesPreview route={route} color={color} maxVisible={4} />
      )}

      {isMobile && showPassengers && (
        <div
          style={{
            marginTop: 8,
            borderTop: `1px solid ${T.border}`,
            borderRadius: `0 0 ${T.radius} ${T.radius}`,
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mini header */}

          {/* Scrollable rows */}
          <div style={{ maxHeight: 260, overflowY: "auto" }}>
            <InlineMobilePassengerList
              route={route}
              color={color}
              tripType={tripType}
              onSplit={onSplit}
              onRefetch={onRefetch}
              onMobilePassengerDrop={onMobilePassengerDrop}
            />
          </div>
        </div>
      )}

      {isMobile && (
        <div
          style={{
            paddingTop: 8,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Popover
            content={infoPopoverContent}
            title={null}
            trigger="click"
            placement="topRight"
          >
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "none",
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                padding: "4px 8px",
                cursor: "pointer",
                color: T.muted,
                fontSize: 11,
              }}
            >
              <InfoCircleOutlined style={{ fontSize: 11 }} />
              Trip Details
            </button>
          </Popover>

          <button
            // onClick={() => setShowPassengers(true)}
            onClick={() => setShowPassengers((p) => !p)}
            style={{
              marginLeft: 5,
              marginRight: 5,
              background: showPassengers ? `${color}18` : "none",
              border: showPassengers ? `1px solid ${color}44` : "none",
              cursor: "pointer",
              padding: "2px 3px",
              color: showPassengers ? color : T.muted,
              display: "flex",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 10, marginRight: 3 }}>Passenger</span>
            <Users size={14} />
          </button>
        </div>
      )}

      {/* Adhoc modal */}
      {showAdhocModal && (
        <AddAdhocEmployeeModal
          tripID={route.VehicleId}
          tripType={tripType}
          locCode={locCode}
          onClose={() => setShowAdhocModal(false)}
          onSuccess={() => {
            setShowAdhocModal(false);
            onRefetch?.();
          }}
        />
      )}

      {showGuardModal && (
        <AssignGuardModal
          dsId={route.VehicleId}
          onSuccess={() => {
            onRefetch?.();
            setShowGuardModal(false);
          }}
          onClose={() => setShowGuardModal(false)}
        />
      )}

      {showPublishModal && (
        <PublishTripModal
          routes={[route]}
          locCode={locCode}
          shiftId={shiftId}
          tripType={tripType}
          routeDate={routeDate}
          onClose={() => setShowPublishModal(false)}
          onSuccess={() => {
            setShowPublishModal(false);
            onRefetch?.();
          }}
        />
      )}

      {/* {showPassengers && (
        <PassengersPopup
          route={route}
          color={color}
          onClose={() => setShowPassengers(false)}
        />
      )} */}
    </div>
  );
}
