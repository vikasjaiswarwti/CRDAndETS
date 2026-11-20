// ─── components/CardAssignButtons.tsx ────────────────────────────────────────
// Two assignment buttons in the RouteStackCard header row.
//
//   [Vendor Name | Assign Vendor]   [VehicleReg | Assign Driver]
//
// Clicking either opens a full modal (position:fixed) — no popovers.
// This component owns showVendorModal / showDriverModal state internally
// so the parent card stays clean.
//
// Props from parent (RouteStackCard):
//   route          — the single trip being acted on
//   locCode        — location code for vendor query
//   localVendorId  — transporterId captured after vendor was assigned this
//                    session; null if page was refreshed since
//   onVendorAssigned(id)  — parent saves transporterId in its own state
//   onDriverAssigned()    — parent triggers a refetch

import React, { useState } from "react";
import { T } from "../../constants/designTokens";
import type { VehicleRoute } from "../../types/Routemaker.types";
import { useUILibrary } from "../../../../shared/lib/ui-lib/ui-library-context";

import AssignVendorModal from "../../Modals/AssignVendorModal";
import AssignDriverVehicleModal from "../../Modals/AssignDriverVehicleModal";

import type { ShuttleStopApi } from "../../types/Shuttleapitypes";

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  route: VehicleRoute;
  locCode: number;
  localVendorId: number | null;
  onVendorAssigned: (transporterId: number) => void;
  onDriverAssigned: () => void;
  onTripActionLoadingChange?: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  shuttleStops?: ShuttleStopApi[]; // ← only shuttle cards pass this
  disabled?: boolean; // ← true for cancelled trips: locks both buttons
}

// ── Tiny link-style button ────────────────────────────────────────────────────

function LinkBtn({
  children,
  color,
  onClick,
  // title,
  maxWidth,
  disabled,
}: {
  children: React.ReactNode;
  color: string;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
  maxWidth?: number;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick?.(e);
      }}
      // title={title}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        flexShrink: 0,
        fontSize: T.fontXs,
        fontWeight: 700,
        color: disabled ? "#6B7280" : color,
        cursor: disabled ? "not-allowed" : "pointer",
        textDecoration: disabled ? "none" : "underline",
        maxWidth: maxWidth ?? undefined,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
const tooTipStyle: React.CSSProperties = { fontWeight: 600, fontSize: 11 };
export default function CardAssignButtons({
  route,
  locCode,
  localVendorId,
  onVendorAssigned,
  onDriverAssigned,
  onTripActionLoadingChange,
  shuttleStops,
  disabled = false,
}: Props) {
  // console.log("route from CardAssignButtons", route);

  const { Popover } = useUILibrary();

  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);

  const hasVendor = !!route.isVenddorAssign;
  const hasDriver = !!(route.hasDriverAssigned && route.vehicleRegNo);

  const assigningKey = `${route.VehicleId}-assigning`;
  const handleAssigningChange = (loading: boolean) => {
    onTripActionLoadingChange?.((prev) => ({
      ...prev,
      [assigningKey]: loading,
    }));
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Vendor button ── */}
      <Popover
        content={
          disabled ? (
            <span style={{ fontSize: 11, color: T.muted }}>
              Trip is cancelled — vendor assignment is locked.
            </span>
          ) : hasVendor ? (
            <div style={tooTipStyle}>
              Vendor Name - {route.vendorName ?? "-"}
            </div>
          ) : (
            <div style={tooTipStyle}>Click to assign vendor</div>
          )
        }
        title={null}
        trigger="hover"
        placement="top"
      >
        <LinkBtn
          color={hasVendor ? T.accent : T.hyperlink}
          maxWidth={hasVendor ? 80 : undefined}
          title={hasVendor ? "Reassign vendor" : "Assign vendor to this trip"}
          disabled={disabled}
          onClick={() => setShowVendorModal(true)}
        >
          {hasVendor ? route.vendorPrefixTag : "Assign Vendor"}
        </LinkBtn>
      </Popover>

      {/* ── Driver button ── */}
      {disabled ? (
        <Popover
          content={
            <span style={{ fontSize: 11, color: T.muted }}>
              Trip is cancelled — driver assignment is locked.
            </span>
          }
          trigger="hover"
          title={null}
          placement="top"
        >
          <LinkBtn color="#6366F1" disabled>
            Assign Driver
          </LinkBtn>
        </Popover>
      ) : hasVendor ? (
        <LinkBtn
          color="#6366F1"
          maxWidth={hasDriver ? 72 : undefined}
          title={
            hasDriver ? "Reassign driver & vehicle" : "Assign driver & vehicle"
          }
          onClick={() => setShowDriverModal(true)}
        >
          {hasDriver ? (
            <Popover
              content={
                <div className="flex flex-col gap-0.5 " style={tooTipStyle}>
                  <span> Vehicle No. - {route.vehicleRegNo ?? "-"}</span>
                  <span> Driver Name - {route.driverName ?? "-"}</span>
                  <span> Driver No. - {route.driverMobile ?? "-"}</span>
                </div>
              }
              title={null}
              trigger="hover"
              placement="top"
            >
              {route.vehicleRegNo}
            </Popover>
          ) : (
            <Popover
              content={<div style={tooTipStyle}>Assign vehicle & driver</div>}
              title={null}
              trigger="hover"
              placement="top"
            >
              Assign Driver
            </Popover>
          )}
        </LinkBtn>
      ) : (
        <Popover
          content={
            <span style={{ fontSize: 11, color: T.muted }}>
              Assign a vendor first to unlock driver assignment.
            </span>
          }
          trigger="hover"
          title={null}
          placement="top"
        >
          <LinkBtn color="#6366F1" disabled>
            Assign Driver
          </LinkBtn>
        </Popover>
      )}

      {/* ── Vendor modal ─────────────────────────────────────────────────────────
           IMPORTANT: always pass routes={[route]} (an array), never route={...}
           AssignVendorModal accepts routes: VehicleRoute[] for both single-card
           and bulk-toolbar use cases. The card passes a single-item array so the
           modal shows passenger details and returns the transporterId in onSuccess.
      ── */}
      {showVendorModal && (
        <AssignVendorModal
          routes={[route]}
          locCode={locCode}
          shuttleStops={shuttleStops}
          onAssigningChange={handleAssigningChange}
          onSuccess={(transporterId) => {
            // transporterId is always defined when routes.length === 1
            onVendorAssigned(transporterId!);
            setShowVendorModal(false);
          }}
          onClose={() => setShowVendorModal(false)}
        />
      )}

      {/* ── Driver + vehicle modal ── */}
      {showDriverModal && (
        <AssignDriverVehicleModal
          route={route}
          vendorId={localVendorId}
          shuttleStops={shuttleStops}
          onAssigningChange={handleAssigningChange}
          onSuccess={() => {
            onDriverAssigned();
            setShowDriverModal(false);
          }}
          onClose={() => setShowDriverModal(false)}
        />
      )}
    </>
  );
}
