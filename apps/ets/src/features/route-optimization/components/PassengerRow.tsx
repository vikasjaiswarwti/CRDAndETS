// ─── components/PassengerRow.tsx ──────────────────────────────────────────────
// A single draggable passenger stop row inside a cab group.
//
// Grid columns: [checkbox | drag | seq | gender | info | metrics]
// Checkbox → isChecked/onCheckChange for reorder selection
// Drag handle → IcDrag (leftmost visible icon, after checkbox)

import React, { useEffect } from "react";
import { T } from "../constants/designTokens";
import { fmt12 } from "../utils/routeMakerHelpers";
import { IcDrag } from "../assets/icons/RouteMakerIcons";
import type { Passenger } from "../types/Routemaker.types";
import type { DragPassenger } from "../hooks/useDragAndDrop";

import EtaEditPopover from "./EditETAPopover";
import { useState, useRef } from "react";

import {
  useDeletePaxFromRouteMutation,
  useMarkNoShowMutation,
} from "../services/routeMakerApi";

import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";

// import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
// import { CAB_TOOLTIPS } from "./CabGroupPanelTooltips";

// function DragIcon() {
//   return (
//     <img
//       src={IcDrag}
//       alt="Commutr"
//       style={{ height: 26, width: "auto", display: "block" }}
//     />
//   );
// }

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  passenger: Passenger;
  groupColor: string;
  isDragging: boolean;
  vehicleId: number;
  vehicleLabel: string;
  /** Whether this passenger is checked for reordering */
  isChecked?: boolean;
  /** Called when the checkbox is toggled */
  onCheckChange?: (checked: boolean) => void;
  onDragStart: (e: React.DragEvent, payload: DragPassenger) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onRefetch?: () => void;

  /** Whether vehicle + driver are assigned — gates "Mark No Show" */
  isVehicleAssigned?: boolean;
  /** 1 = login, 2 = logout — required by markNoShow API */
  tripType?: number;
  /** Driver's mobile number passed to markNoShow API */
  driverMobileNo?: string;
  onSplit?: (vehicleId: number, empIds: number[]) => void;
}

function ExpandableAddress({ full }: { full?: string }) {
  const [open, setOpen] = useState(false);
  if (!full) return null;
  const short = full.split(",")[0].trim();
  return (
    <div
      style={{ fontSize: 10, color: T.muted, lineHeight: 1.4, marginTop: 1 }}
    >
      {open ? full : short}
      {full !== short && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
          style={{
            marginLeft: 4,
            color: T.accent,
            cursor: "pointer",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {open ? "less" : "...more"}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PassengerRow({
  passenger,
  groupColor,
  isDragging,
  vehicleId,
  vehicleLabel,
  isChecked = false,
  onCheckChange,
  onDragStart,
  onDragEnd,
  onRefetch,

  isVehicleAssigned = false,
  tripType = 1,
  driverMobileNo = "",
  onSplit,
}: Props) {
  console.log("passenger from Left Sidebar", passenger);

  const { Popover } = useUILibrary();

  // Add inside component
  const { message } = useUILibrary();

  const [etaOpen, setEtaOpen] = useState(false);
  const etaAnchorRef = useRef<HTMLButtonElement>(null);
  const etaLabel = fmt12(passenger.EstimatedPickupTime) || "—";

  const isFemale = passenger.Gender === "F";
  const badgeBg = isFemale ? "#EC4899" : groupColor;
  // const shortAddr = passenger.Address?.split(",")[0].trim() ?? "";

  // const shortAddr = passenger.Address ?? "";

  const [confirmNoShow, setConfirmNoShow] = useState(false);
  const [markNoShow, { isLoading: isMarkingNoShow }] = useMarkNoShowMutation();

  const [showRemoveOptions, setShowRemoveOptions] = useState(false);

  async function handleMarkNoShow() {
    try {
      const res = await markNoShow({
        dsId: vehicleId,
        empID: passenger.empId,
        tripType,
        mobileNo: driverMobileNo,
      }).unwrap();

      setConfirmNoShow(false);
      setMenuOpen(false);
      // Show whatever the backend sends back
      message.success(res?.message ?? res?.title ?? "Marked as No Show.");
      onRefetch?.();
    } catch (err) {
      const data = (err as any)?.data;
      const errMsg = data?.errors
        ? Object.values(data.errors as Record<string, string[]>)
            .flat()
            .join(" ")
        : (data?.message ?? data?.title ?? "Failed to mark No Show.");
      message.error(errMsg);
    }
  }

  const payload: DragPassenger = {
    passengerId: passenger.Id,
    passengerName: passenger.Firstname,
    employeeId: passenger.EmployeeID,
    gender: passenger.Gender,
    sourceVehicleId: vehicleId,
    sourceVehicleLabel: vehicleLabel,
    pickupSequence: passenger.PickupSequence,
  };

  // Add state + mutation inside component
  const [menuOpen, setMenuOpen] = useState(false);
  // const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [deletePax, { isLoading: isDeleting }] =
    useDeletePaxFromRouteMutation();

  // Close menu on outside click
  // useEffect(() => {
  //   if (!menuOpen) return;
  //   function handleOutside(e: MouseEvent) {
  //     if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
  //       setMenuOpen(false);
  //     }
  //   }
  //   document.addEventListener("mousedown", handleOutside);
  //   return () => document.removeEventListener("mousedown", handleOutside);
  // }, [menuOpen]);

  // REPLACE the existing useEffect
  useEffect(() => {
    const anyOpen = menuOpen || showRemoveOptions || confirmNoShow;
    if (!anyOpen) return;

    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        // Don't close mid-flight
        if (isDeleting || isMarkingNoShow) return;
        setMenuOpen(false);
        setShowRemoveOptions(false);
        setConfirmNoShow(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen, showRemoveOptions, confirmNoShow, isDeleting, isMarkingNoShow]);

  async function handleDelete() {
    try {
      await deletePax({ dsid: vehicleId, EmpID: passenger.empId }).unwrap();
      // setConfirmDelete(false);
      setShowRemoveOptions(false); // ← close after success
      setMenuOpen(false);
      message.success(
        `${passenger.Firstname} removed from Trip #${vehicleId}.`,
      );
      onRefetch?.();
    } catch {
      setShowRemoveOptions(false); // ← close after error too
      setMenuOpen(false);
      // handle error silently or show toast
      message.error(
        `Failed to remove ${passenger.Firstname}. Please try again.`,
      );
    }
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, payload)}
      onDragEnd={onDragEnd}
      style={{
        // [checkbox 16px | drag 14px | seq 18px | gender 20px | info 1fr | metrics 60px]
        display: "grid",
        // gridTemplateColumns: "16px 18px 20px 1fr 70px",
        gridTemplateColumns: "16px 40px 1fr 70px 18px",
        alignItems: "start",
        gap: "0 6px",
        padding: "7px 8px 7px 6px",
        borderBottom: `1px solid ${T.border}`,
        background: isDragging ? T.accentBg : T.card,
        opacity: isDragging ? 0.45 : 1,
        cursor: "grab",
        transition: "background 0.12s, opacity 0.12s",
        userSelect: "none",
        outline: isDragging ? `1.5px solid ${groupColor}55` : "none",
        outlineOffset: -1,
      }}
    >
      {/* ── Col 1: noShow Checkbox ── */}

      {/* <Popover
        content={CAB_TOOLTIPS.dragDrop}
        title={null}
        trigger="hover"
        placement="right"
      > */}
      <div
        style={{
          paddingTop: 2,
          cursor: "grab",
          color: T.text,

          justifyContent: "center",
          opacity: 0.5,
        }}
        aria-hidden="true"
      >
        {/* ── Col 1: Checkbox ── */}
        <div
          style={{
            paddingTop: 2,
            display: "flex",
            alignItems: "flex-start",
            marginBottom: "10px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => onCheckChange?.(e.target.checked)}
            style={{
              width: 13,
              height: 13,
              cursor: "pointer",
              accentColor: groupColor,
            }}
          />
        </div>

        <IcDrag />
      </div>
      {/* </Popover> */}

      {/* ── Col 2: Drag handle ── */}

      {/* ── Col 3: Sequence badge ── */}
      {/* <div
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: badgeBg,
          color: "#fff",
          fontSize: 9,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 1,
          flexShrink: 0,
        }}
      >
        {passenger.PickupSequence}
      </div> */}

      {/* ── Col 4: Gender indicator ── */}
      {/* <div
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: isFemale ? "#FDF2F8" : "#EFF6FF",
          border: `1.5px solid ${isFemale ? "#F9A8D4" : "#BFDBFE"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 9,
          color: isFemale ? "#EC4899" : "#3B82F6",
          fontWeight: 700,
          marginTop: 1,
          flexShrink: 0,
        }}
      >
        {isFemale ? "♀" : "♂"}
      </div> */}

      {/* ── Col 2: Seq + Gender combined ── */}
      {/* <div
        style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 1 }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: badgeBg,
            color: "#fff",
            fontSize: 9,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {passenger.PickupSequence}
        </div>
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: isFemale ? "#FDF2F8" : "#EFF6FF",
            border: `1.5px solid ${isFemale ? "#F9A8D4" : "#BFDBFE"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            color: isFemale ? "#EC4899" : "#3B82F6",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {isFemale ? "♀" : "♂"}
        </div>
      </div> */}

      {/* ── Col 2: Seq + Gender combined ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          marginTop: 1,
        }}
      >
        {/* Icons row */}
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: badgeBg,
              color: "#fff",
              fontSize: 9,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {passenger.PickupSequence}
          </div>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: isFemale ? "#FDF2F8" : "#EFF6FF",
              border: `1.5px solid ${isFemale ? "#F9A8D4" : "#BFDBFE"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              color: isFemale ? "#EC4899" : "#3B82F6",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {isFemale ? "♀" : "♂"}
          </div>
        </div>

        {/* NO SHOW tag — always reserves space so layout stays stable */}
        <Popover
          content={
            <span style={{ fontSize: 11, color: T.muted }}>
              {passenger.noShowType ?? ""}
            </span>
          }
          trigger="hover"
          title={null}
          placement="top"
        >
          <span
            style={{
              fontSize: 7,
              fontWeight: 800,
              letterSpacing: "0.03em",
              whiteSpace: "nowrap",
              padding: "1px 4px",
              borderRadius: 3,
              cursor: "pointer",
              ...(passenger.noShow
                ? {
                    background: "#FEE2E2",
                    color: "#DC2626",
                    border: "1px solid #FECACA",
                  }
                : {
                    background: "transparent",
                    color: "transparent",
                    border: "1px solid transparent",
                    pointerEvents: "none",
                  }),
            }}
          >
            NO SHOW
          </span>
        </Popover>
      </div>

      {/* ── Col 5: Employee info ── */}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 9,
            fontWeight: 800,
            color: T.text,
            lineHeight: 1.3,
          }}
        >
          {passenger.displayName && <>{passenger.displayName} - </>}
          {passenger.Firstname}
        </div>
        {/* <div
          style={{
            fontSize: 10.5,
            fontWeight: 500,
            color: T.text,
            lineHeight: 1.3,
          }}
        >
          {passenger.Firstname}
        </div> */}
        {/* locality */}

        {passenger.mobileNo && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              marginTop: 2,
            }}
          >
            <svg
              width="8"
              height="8"
              viewBox="0 0 24 24"
              fill="none"
              stroke={groupColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
            <span style={{ fontSize: 9, fontWeight: 600 }}>
              {passenger.mobileNo}
            </span>
          </div>
        )}
        {passenger.locality != null && (
          <div
            style={{
              fontSize: 10,
              color: T.muted,
              lineHeight: 1.4,
              marginTop: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontWeight: 700,
              // whiteSpace: "nowrap",
            }}
          >
            Zone - {passenger.locality}
          </div>
        )}
        <div
          style={{
            fontSize: 10,
            color: T.muted,
            lineHeight: 1.4,
            marginTop: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            // whiteSpace: "nowrap",
          }}
        >
          {/* {shortAddr} */}
          <ExpandableAddress full={passenger.Address} />
        </div>
        {/* {passenger.IsLate && (
          <span
            style={{
              display: "inline-block",
              marginTop: 2,
              fontSize: 9,
              background: T.dangerBg,
              color: T.danger,
              padding: "1px 5px",
              borderRadius: 3,
              fontWeight: 700,
            }}
          >
            LATE
          </span>
        )} */}
      </div>

      {/* ── Col 6: Dist / ED / ETA ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: "1px 4px",
          fontSize: 9.5,
          textAlign: "right",
        }}
      >
        <span style={{ color: T.text }}>Dist.</span>
        <span style={{ color: T.textSm, fontWeight: 600 }}>
          {passenger.routedDistanceKm != null
            ? `${passenger.routedDistanceKm.toFixed(1)} km`
            : "—"}
        </span>
        <span style={{ color: T.text }}>ED</span>
        <span style={{ color: T.textSm, fontWeight: 600 }}>
          {passenger.extraDistanceKm != null
            ? `${passenger.extraDistanceKm.toFixed(1)} km`
            : "—"}
        </span>
        {/* <span style={{ color: T.text }}>ETA</span>
        <span style={{ color: T.textSm, fontWeight: 600 }}>
          {fmt12(passenger.EstimatedPickupTime)}
        </span> */}

        <span style={{ color: T.text }}>ETA</span>
        <span style={{ position: "relative" }}>
          <button
            ref={etaAnchorRef}
            title="Click to edit pickup time"
            onClick={(e) => {
              e.stopPropagation();
              setEtaOpen((o) => !o);
            }}
            style={{
              all: "unset",
              cursor: "pointer",
              fontSize: 9.5,
              fontWeight: 700,
              color: etaOpen ? groupColor : badgeBg,
              textDecoration: "underline",
              textDecorationStyle: "dashed",
              textUnderlineOffset: 2,
              textDecorationColor: `${badgeBg}88`,
              borderRadius: 3,
              padding: "0 2px",
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            {etaLabel}
            <svg
              width="7"
              height="7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.7, flexShrink: 0 }}
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>

          {etaOpen && (
            <EtaEditPopover
              passenger={passenger}
              vehicleId={vehicleId}
              groupColor={groupColor}
              anchorRef={etaAnchorRef as React.RefObject<HTMLElement>}
              onClose={() => setEtaOpen(false)}
              onAfterSave={() => {
                setEtaOpen(false);
                onRefetch?.();
              }}
            />
          )}
        </span>
      </div>

      {/* ── Col 5: Triple dot menu ── */}
      {/* <div ref={menuRef} style={{ position: "relative", marginTop: 1 }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((o) => !o);
          }}
          style={{
            all: "unset",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 18,
            height: 18,
            borderRadius: T.radiusSm,
            color: T.muted,
            background: menuOpen ? T.accentBg : "transparent",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill={T.muted}>
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>

        {menuOpen && !confirmDelete && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 4px)",
              zIndex: 9999,
              background: "#fff",
              borderRadius: T.radiusSm,
              border: `1px solid ${T.border}`,
              minWidth: 140,
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              overflow: "hidden",
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDelete(true);
              }}
              style={{
                all: "unset",
                width: "100%",
                padding: "8px 12px",
                fontSize: 11,
                fontWeight: 600,
                color: "#ef4444",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxSizing: "border-box",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#fef2f2")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
              Remove Employee
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isVehicleAssigned) setConfirmNoShow(true);
              }}
              disabled={!isVehicleAssigned}
              style={{
                all: "unset",
                width: "100%",
                padding: "8px 12px",
                fontSize: 11,
                fontWeight: 600,
                color: isVehicleAssigned ? "#D97706" : T.muted,
                cursor: isVehicleAssigned ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxSizing: "border-box",
                borderTop: `1px solid ${T.border}`,
                opacity: isVehicleAssigned ? 1 : 0.45,
              }}
              title={
                !isVehicleAssigned
                  ? "Assign a vehicle & driver first"
                  : undefined
              }
              onMouseEnter={(e) => {
                if (isVehicleAssigned)
                  e.currentTarget.style.background = "#FFFBEB";
              }}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isVehicleAssigned ? "#D97706" : T.muted}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
              Mark No Show
              {!isVehicleAssigned && (
                <span
                  style={{ fontSize: 9, color: T.textSub, marginLeft: "auto" }}
                >
                  No vehicle
                </span>
              )}
            </button>
          </div>
        )}

       
        {confirmDelete && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 4px)",
              zIndex: 9999,
              background: "#fff",
              borderRadius: T.radiusSm,
              border: `1px solid #fca5a5`,
              minWidth: 180,
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              padding: "10px 12px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#ef4444",
                marginBottom: 4,
              }}
            >
              Remove Employee?
            </div>

            <div style={{ fontSize: 10, color: T.muted, marginBottom: 10 }}>
              <div
                style={{
                  fontWeight: 700,
                  color: T.text,
                  fontSize: 11,
                  marginBottom: 4,
                }}
              >
                {passenger.Firstname} will be removed from Trip #{vehicleId}.
              </div>
              {passenger.mobileNo && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    marginBottom: 2,
                  }}
                >
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={groupColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                  <span style={{ color: groupColor, fontWeight: 600 }}>
                    {passenger.mobileNo}
                  </span>
                </div>
              )}
              {passenger.Address && (
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 4 }}
                >
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={T.muted}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginTop: 1, flexShrink: 0 }}
                  >
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span style={{ lineHeight: 1.4 }}>{passenger.Address}</span>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(false);
                  setMenuOpen(false);
                }}
                style={{
                  flex: 1,
                  height: 26,
                  fontSize: 10,
                  fontWeight: 600,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.radiusSm,
                  background: "transparent",
                  color: T.muted,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  height: 26,
                  fontSize: 10,
                  fontWeight: 700,
                  border: "none",
                  borderRadius: T.radiusSm,
                  background: isDeleting ? "#fca5a5" : "#ef4444",
                  color: "#fff",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                }}
              >
                {isDeleting ? "Removing…" : "Confirm"}
              </button>
            </div>
          </div>
        )}

        {confirmNoShow && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 4px)",
              zIndex: 9999,
              background: "#fff",
              borderRadius: T.radiusSm,
              border: `1px solid #FDE68A`,
              minWidth: 190,
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              padding: "10px 12px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#D97706",
                marginBottom: 4,
              }}
            >
              Mark as No Show?
            </div>
            <div style={{ fontSize: 10, color: T.muted, marginBottom: 10 }}>
              <div
                style={{
                  fontWeight: 700,
                  color: T.text,
                  fontSize: 11,
                  marginBottom: 4,
                }}
              >
                {passenger.Firstname} will be marked absent for this trip.
              </div>
              {driverMobileNo && (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={groupColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                  <span style={{ fontSize: 9, color: T.muted }}>Driver: </span>
                  <span
                    style={{ color: groupColor, fontWeight: 600, fontSize: 9 }}
                  >
                    {driverMobileNo}
                  </span>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmNoShow(false);
                  setMenuOpen(false);
                }}
                style={{
                  flex: 1,
                  height: 26,
                  fontSize: 10,
                  fontWeight: 600,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.radiusSm,
                  background: "transparent",
                  color: T.muted,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkNoShow();
                }}
                disabled={isMarkingNoShow}
                style={{
                  flex: 1,
                  height: 26,
                  fontSize: 10,
                  fontWeight: 700,
                  border: "none",
                  borderRadius: T.radiusSm,
                  background: isMarkingNoShow ? "#FDE68A" : "#D97706",
                  color: "#fff",
                  cursor: isMarkingNoShow ? "not-allowed" : "pointer",
                }}
              >
                {isMarkingNoShow ? "Saving…" : "Confirm"}
              </button>
            </div>
          </div>
        )}
      </div> */}

      {/* ── Col 5: Triple dot menu ── */}
      <div ref={menuRef} style={{ position: "relative", marginTop: 1 }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((o) => !o);
          }}
          style={{
            all: "unset",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 18,
            height: 18,
            borderRadius: T.radiusSm,
            color: T.muted,
            background: menuOpen ? T.accentBg : "transparent",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill={T.muted}>
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>

        {/* ── Main dropdown ── */}
        {menuOpen && !confirmNoShow && !showRemoveOptions && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 4px)",
              zIndex: 9999,
              background: "#fff",
              borderRadius: T.radiusSm,
              border: `1px solid ${T.border}`,
              minWidth: 150,
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              overflow: "hidden",
            }}
          >
            {/* Remove Employee — now shows options sub-panel */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowRemoveOptions(true);
              }}
              style={{
                all: "unset",
                width: "100%",
                padding: "8px 12px",
                fontSize: 11,
                fontWeight: 600,
                color: "#ef4444",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxSizing: "border-box",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#fef2f2")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
              Remove Employee
            </button>

            {/* Mark No Show */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isVehicleAssigned) setConfirmNoShow(true);
              }}
              disabled={!isVehicleAssigned}
              style={{
                all: "unset",
                width: "100%",
                padding: "8px 12px",
                fontSize: 11,
                fontWeight: 600,
                color: isVehicleAssigned ? "#D97706" : T.muted,
                cursor: isVehicleAssigned ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxSizing: "border-box",
                borderTop: `1px solid ${T.border}`,
                opacity: isVehicleAssigned ? 1 : 0.45,
              }}
              title={
                !isVehicleAssigned
                  ? "Assign a vehicle & driver first"
                  : undefined
              }
              onMouseEnter={(e) => {
                if (isVehicleAssigned)
                  e.currentTarget.style.background = "#FFFBEB";
              }}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isVehicleAssigned ? "#D97706" : T.muted}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
              Mark No Show
              {!isVehicleAssigned && (
                <span
                  style={{ fontSize: 9, color: T.muted, marginLeft: "auto" }}
                >
                  No vehicle
                </span>
              )}
            </button>
          </div>
        )}

        {/* ── Remove options: choose action ── */}
        {/* ── Remove options: choose action ── */}
        {showRemoveOptions && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 4px)",
              zIndex: 9999,
              background: "#fff",
              borderRadius: T.radiusSm,
              border: `1px solid ${T.border}`,
              minWidth: 210,
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              overflow: "hidden",
            }}
          >
            {/* Option 1: Remove completely */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                // setShowRemoveOptions(false);
                // setConfirmDelete(true);
                // setMenuOpen(false);
                handleDelete();
              }}
              disabled={isDeleting}
              style={{
                all: "unset",
                width: "100%",
                padding: "11px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 3,
                cursor: "pointer",
                boxSizing: "border-box",
                borderBottom: `1px solid ${T.border}`,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#fef2f2")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {isDeleting ? (
                  /* inline spinner */
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    style={{ animation: "spin 0.8s linear infinite" }}
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                ) : (
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                )}
                <span
                  style={{ fontSize: 11, fontWeight: 700, color: "#ef4444" }}
                >
                  {isDeleting ? "Removing…" : "Remove from trip"}
                </span>
              </div>
              <span
                style={{
                  fontSize: 9.5,
                  color: T.muted,
                  paddingLeft: 17,
                  lineHeight: 1.4,
                }}
              >
                {isDeleting
                  ? "Please wait…"
                  : "This will directly remove employee from this trip."}
              </span>
            </button>

            {/* Option 2: Split to new trip */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowRemoveOptions(false);
                setMenuOpen(false);
                onSplit?.(vehicleId, [passenger.Id]);
              }}
              style={{
                all: "unset",
                width: "100%",
                padding: "11px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 3,
                cursor: "pointer",
                boxSizing: "border-box",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#EFF6FF")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3" />
                </svg>
                <span
                  style={{ fontSize: 11, fontWeight: 700, color: "#2563EB" }}
                >
                  Split to new trip
                </span>
              </div>
              <span
                style={{
                  fontSize: 9.5,
                  color: T.muted,
                  paddingLeft: 17,
                  lineHeight: 1.4,
                }}
              >
                Split this employee into a new trip — a dedicated trip will be
                created.
              </span>
            </button>
          </div>
        )}

        {/* {confirmDelete && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 4px)",
              zIndex: 9999,
              background: "#fff",
              borderRadius: T.radiusSm,
              border: `1px solid #fca5a5`,
              minWidth: 180,
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              padding: "10px 12px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#ef4444",
                marginBottom: 4,
              }}
            >
              Remove Employee?
            </div>

            <div style={{ fontSize: 10, color: T.muted, marginBottom: 10 }}>
              <div
                style={{
                  fontWeight: 700,
                  color: T.text,
                  fontSize: 11,
                  marginBottom: 4,
                }}
              >
                {passenger.Firstname} will be removed from Trip #{vehicleId}.
              </div>
              {passenger.mobileNo && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    marginBottom: 2,
                  }}
                >
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={groupColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                  <span style={{ color: groupColor, fontWeight: 600 }}>
                    {passenger.mobileNo}
                  </span>
                </div>
              )}
              {passenger.Address && (
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 4 }}
                >
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={T.muted}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginTop: 1, flexShrink: 0 }}
                  >
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span style={{ lineHeight: 1.4 }}>{passenger.Address}</span>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(false);
                  setMenuOpen(false);
                }}
                style={{
                  flex: 1,
                  height: 26,
                  fontSize: 10,
                  fontWeight: 600,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.radiusSm,
                  background: "transparent",
                  color: T.muted,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  height: 26,
                  fontSize: 10,
                  fontWeight: 700,
                  border: "none",
                  borderRadius: T.radiusSm,
                  background: isDeleting ? "#fca5a5" : "#ef4444",
                  color: "#fff",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                }}
              >
                {isDeleting ? "Removing…" : "Confirm"}
              </button>
            </div>
          </div>
        )} */}

        {confirmNoShow && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 4px)",
              zIndex: 9999,
              background: "#fff",
              borderRadius: T.radiusSm,
              border: `1px solid #FDE68A`,
              minWidth: 190,
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              padding: "10px 12px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#D97706",
                marginBottom: 4,
              }}
            >
              Mark as No Show?
            </div>
            <div style={{ fontSize: 10, color: T.muted, marginBottom: 10 }}>
              <div
                style={{
                  fontWeight: 700,
                  color: T.text,
                  fontSize: 11,
                  marginBottom: 4,
                }}
              >
                {passenger.Firstname} will be marked absent for this trip.
              </div>
              {driverMobileNo && (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={groupColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                  <span style={{ fontSize: 9, color: T.muted }}>Driver: </span>
                  <span
                    style={{ color: groupColor, fontWeight: 600, fontSize: 9 }}
                  >
                    {driverMobileNo}
                  </span>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmNoShow(false);
                  setMenuOpen(false);
                }}
                style={{
                  flex: 1,
                  height: 26,
                  fontSize: 10,
                  fontWeight: 600,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.radiusSm,
                  background: "transparent",
                  color: T.muted,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkNoShow();
                }}
                disabled={isMarkingNoShow}
                style={{
                  flex: 1,
                  height: 26,
                  fontSize: 10,
                  fontWeight: 700,
                  border: "none",
                  borderRadius: T.radiusSm,
                  background: isMarkingNoShow ? "#FDE68A" : "#D97706",
                  color: "#fff",
                  cursor: isMarkingNoShow ? "not-allowed" : "pointer",
                }}
              >
                {isMarkingNoShow ? "Saving…" : "Confirm"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
