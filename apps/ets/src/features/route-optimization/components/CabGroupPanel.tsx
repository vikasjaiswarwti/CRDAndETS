// ─── components/CabGroupPanel.tsx ─────────────────────────────────────────────
// One collapsible vehicle group in the left sidebar.
//
// NEW: Passenger checkbox + reorder toolbar
//   • Each PassengerRow has a checkbox
//   • When ≥ 1 passenger checked: reorder toolbar appears in the header
//   • Toolbar: ⬆ First | ↑ Up | ↓ Down | ✕ Clear selection
//   • Local passenger order state (synced from group.passengers via useEffect)
//   • onReorder(vehicleId, orderedIds) propagates new order to the parent

import { useState, useEffect } from "react";
import { T } from "../constants/designTokens";
import { IcChevron } from "../assets/icons/RouteMakerIcons";
import PassengerRow from "./PassengerRow";
import type { CabGroup, Passenger } from "../types/Routemaker.types";
import type { DragPassenger } from "../hooks/useDragAndDrop";
import Icon from "./Icon";
import GuardSvg from "../assets/icons/guard.svg";

import { CAB_TOOLTIPS } from "./CabGroupPanelTooltips";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";

import { useAllocateGuardOnTripMutation } from "../services/routeMakerApi";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  group: CabGroup;
  color: string;
  isActive: boolean;
  onSelect: () => void;
  zoneId: string;
  dragItemId: number | null;
  overZoneId: string | null;
  onDragStart: (e: React.DragEvent, passenger: DragPassenger) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  /** Called whenever passenger order changes. Parent should update cabGroups. */
  onReorder?: (vehicleId: number, orderedPassengerIds: number[]) => void;
  /** Whether this group is checked for merge */
  isSelectedForMerge?: boolean;
  /** Toggle merge checkbox for this group */
  onToggleMergeSelect?: () => void;
  /** Open full RearrangeRouteDrawer for this group */
  onRearrange?: () => void;
  onSplit?: (vehicleId: number, empIds: number[]) => void;
  onRefetch?: () => void;
  tripType: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resequence(passengers: Passenger[]): Passenger[] {
  return passengers.map((p, i) => ({ ...p, PickupSequence: i + 1 }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CabGroupPanel({
  group,
  color,
  // onSelect,
  zoneId,
  dragItemId,
  overZoneId,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onReorder,
  isSelectedForMerge = false,
  onToggleMergeSelect,
  onRearrange,
  onSplit,
  onRefetch,
  tripType,
}: Props) {
  const { Popover, message } = useUILibrary();

  const [collapsed, setCollapsed] = useState(false);
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  // Local passenger list — drives rendering + reorder
  const [localPassengers, setLocalPassengers] = useState<Passenger[]>(
    group.passengers,
  );
  // pendingAction — set when user clicks a reorder button; cleared on confirm/cancel
  const [pendingAction, setPendingAction] = useState<
    "top" | "up" | "down" | null
  >(null);

  const [allocateGuard] = useAllocateGuardOnTripMutation();

  const [showGuardConfirm, setShowGuardConfirm] = useState(false);
  const [isAllocatingGuard, setIsAllocatingGuard] = useState(false);
  const [guardPopoverOpen, setGuardPopoverOpen] = useState(false);

  // Sync local list when parent data refreshes (e.g. after confirm move)
  useEffect(() => {
    setLocalPassengers(group.passengers);
    setCheckedIds(new Set()); // clear selection on data refresh
  }, [group.passengers]);

  console.log("group.passengers97", group);

  const isCancelled = group.tripStatusCode === 9;
  const isHovered = overZoneId === zoneId;
  const effectiveCollapsed = isCancelled ? true : collapsed;
  const checkedList = localPassengers.filter((p) => checkedIds.has(p.Id));
  // const hasChecked = checkedList.length > 0;

  // ── Reorder helpers ───────────────────────────────────────────────────────

  function applyNewOrder(next: Passenger[]) {
    const reseq = resequence(next);
    setLocalPassengers(reseq);
    onReorder?.(
      group.vehicleId,
      reseq.map((p) => p.Id),
    );
  }

  function executeAction(action: "top" | "up" | "down") {
    if (action === "top") {
      const checked = localPassengers.filter((p) => checkedIds.has(p.Id));
      const rest = localPassengers.filter((p) => !checkedIds.has(p.Id));
      applyNewOrder([...checked, ...rest]);
    } else if (action === "up") {
      const next = [...localPassengers];
      for (let i = 1; i < next.length; i++) {
        if (checkedIds.has(next[i].Id) && !checkedIds.has(next[i - 1].Id)) {
          [next[i - 1], next[i]] = [next[i], next[i - 1]];
        }
      }
      applyNewOrder(next);
    } else if (action === "down") {
      const next = [...localPassengers];
      for (let i = next.length - 2; i >= 0; i--) {
        if (checkedIds.has(next[i].Id) && !checkedIds.has(next[i + 1].Id)) {
          [next[i], next[i + 1]] = [next[i + 1], next[i]];
        }
      }
      applyNewOrder(next);
    }
  }

  // function clearChecked() {
  //   setCheckedIds(new Set());
  //   setPendingAction(null);
  // }

  // function handleReorderBtnClick(action: "top" | "up" | "down") {
  //   setPendingAction(action);
  // }

  function confirmReorder() {
    if (pendingAction) {
      executeAction(pendingAction);
      setPendingAction(null);
    }
  }

  function cancelReorder() {
    setPendingAction(null);
  }

  function toggleCheck(id: number, checked: boolean) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function lightenColor(hex: string, percent = 88) {
    const num = parseInt(hex.replace("#", ""), 16);

    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;

    const nr = Math.round(r + (255 - r) * (percent / 100));
    const ng = Math.round(g + (255 - g) * (percent / 100));
    const nb = Math.round(b + (255 - b) * (percent / 100));

    return `rgb(${nr}, ${ng}, ${nb})`;
  }

  // // Can the checked passengers move up / down?
  // const firstCheckedIdx = localPassengers.findIndex((p) =>
  //   checkedIds.has(p.Id),
  // );
  // const lastCheckedIdx = localPassengers.reduce(
  //   (acc, p, i) => (checkedIds.has(p.Id) ? i : acc),
  //   -1,
  // );
  // const canMoveUp = hasChecked && firstCheckedIdx > 0;
  // const canMoveDown = hasChecked && lastCheckedIdx < localPassengers.length - 1;
  // const canMoveToTop = hasChecked && firstCheckedIdx > 0;

  // ── Styles ─────────────────────────────────────────────────────────────────

  console.log("color from cab group panel", color);

  async function handleAllocateGuard() {
    setIsAllocatingGuard(true);
    try {
      await allocateGuard({
        dsid: group.vehicleId,
        isGuard: !group.isGuardAllocated,
      }).unwrap();
      message.success(
        group.isGuardAllocated
          ? `Guard removed from Trip #${group.vehicleId}`
          : `Guard allocated to Trip #${group.vehicleId}`,
      );
      onRefetch?.();
    } catch (err) {
      message.error(
        group.isGuardAllocated
          ? `Failed to remove guard from Trip #${group.vehicleId}`
          : `Failed to allocate guard to Trip #${group.vehicleId}`,
      );
    } finally {
      setIsAllocatingGuard(false);
      setShowGuardConfirm(false);
    }
  }

  return (
    <div
      style={{
        background: isHovered ? `${color}08` : T.card,
        outline: isHovered ? `2px dashed ${color}` : "none",
        outlineOffset: -2,
        transition: "background 0.1s, outline 0.1s",
        borderBottom: `1px solid ${T.border}`,
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      data-zone={zoneId}
    >
      {/* ── Header ── */}
      <div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "20px 1fr auto",
            alignItems: "center",
            gap: 6,
            padding: "8px 10px",
            background: lightenColor(color, 77),
            borderBottom: effectiveCollapsed ? "none" : `1px solid ${T.border}`,
            cursor: isCancelled ? "not-allowed" : "pointer",
            userSelect: "none",
            transition: "background 0.15s",
          }}
          title={isCancelled ? "Trip is cancelled — can't be opened" : undefined}
          onClick={() => {
            if (isCancelled) return;
            setCollapsed((c) => !c);
          }}
          role="button"
          tabIndex={0}
          aria-disabled={isCancelled}
          aria-expanded={!effectiveCollapsed}
          onKeyDown={(e) => {
            if (isCancelled) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setCollapsed((c) => !c);
            }
          }}
        >
          {/* Col 1: Merge-select checkbox */}
          <Popover
            content={
              isCancelled
                ? "Trip is cancelled — can't be selected for merge."
                : CAB_TOOLTIPS.mergeCheckbox
            }
            title={null}
            trigger="hover"
            placement="right"
          >
            <div
              role="checkbox"
              aria-checked={isSelectedForMerge}
              aria-disabled={isCancelled}
              title={
                isCancelled
                  ? "Trip is cancelled"
                  : isSelectedForMerge
                    ? "Deselect for merge"
                    : "Select for merge"
              }
              onClick={(e) => {
                e.stopPropagation();
                if (isCancelled) return;
                onToggleMergeSelect?.();
              }}
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                border: `2px solid ${isCancelled ? T.border : "#10B981"}`,
                background: isCancelled
                  ? T.border
                  : isSelectedForMerge
                    ? T.accent
                    : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                cursor: isCancelled
                  ? "not-allowed"
                  : onToggleMergeSelect
                    ? "pointer"
                    : "default",
                opacity: isCancelled ? 0.6 : 1,
                transition: "background 0.12s, border-color 0.12s",
              }}
            >
              {isSelectedForMerge && (
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          </Popover>

          {/* Col 2: Label + reorder toolbar (when passengers checked) */}
          <div
            style={{
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {/* Col 2: Label + reorder toolbar (when passengers checked) */}
            <div
              style={{
                minWidth: 0,
                display: "flex",
                alignItems: "center", // Vertically centers the dot and text
                gap: 8, // Clean spacing between dot and text
              }}
            >
              {/* The Status Dot */}
              <div
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: color,
                  boxShadow: `0 0 0 2px ${color}33`,
                  flexShrink: 0,
                }}
              />

              {/* Vehicle ID Label */}
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: T.text,
                  whiteSpace: "nowrap",
                }}
              >
                Trip ID - {group.vehicleId}
              </span>
            </div>

            {/* Below the Trip ID label div, inside Col 2 */}
            {checkedIds.size > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 3,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <span style={{ fontSize: 10, color: T.muted }}>
                  {checkedIds.size} selected
                </span>
                <button
                  onClick={() => onSplit?.(group.vehicleId, [...checkedIds])}
                  style={{
                    height: 20,
                    padding: "0 8px",
                    fontSize: 10,
                    fontWeight: 700,
                    background: T.danger ?? "#ef4444",
                    border: "none",
                    borderRadius: T.radiusSm,
                    color: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <svg
                    width="9"
                    height="9"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2.5"
                  >
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3" />
                  </svg>
                  Split
                </button>
                <button
                  onClick={() => setCheckedIds(new Set())}
                  style={{
                    height: 20,
                    padding: "0 6px",
                    fontSize: 10,
                    fontWeight: 600,
                    background: "none",
                    border: `1px solid ${T.border}`,
                    borderRadius: T.radiusSm,
                    color: T.muted,
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Triple-dot menu — Guard allocation */}

          {/* Col 3: Badges + dot + vehicle# + chevron */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              flexShrink: 0,
            }}
          >
            {/* Triple-dot menu — Guard allocation */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ display: "flex" }}
            >
              {/* <Popover
              content={
                <div style={{ minWidth: 150 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowGuardConfirm(true);
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
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    <Icon src={GuardSvg} size={13} />
                    {group.isGuardAllocated ? "Remove Guard" : "Allocate Guard"}
                  </button>
                </div>
              }
              title={null}
              trigger="click"
              placement="bottomRight"
            >
              <button
                title="More actions"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 20,
                  height: 20,
                  borderRadius: T.radiusSm,
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  padding: 0,
                  flexShrink: 0,
                  color: T.muted,
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="none"
                >
                  <circle cx="12" cy="5" r="1.6" />
                  <circle cx="12" cy="12" r="1.6" />
                  <circle cx="12" cy="19" r="1.6" />
                </svg>
              </button>
            </Popover> */}

              <Popover
                content={
                  <div style={{ minWidth: 150 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setGuardPopoverOpen(false);
                        setShowGuardConfirm(true);
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
                        width: "100%",
                        textAlign: "left",
                      }}
                    >
                      <Icon src={GuardSvg} size={13} />
                      {group.isGuardAllocated
                        ? "Remove Guard"
                        : "Allocate Guard"}
                    </button>
                  </div>
                }
                title={null}
                trigger="click"
                placement="bottomRight"
                open={guardPopoverOpen}
                onOpenChange={(v) => setGuardPopoverOpen(v)}
              >
                {/* ← children required */}
                <button
                  title="More actions"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 20,
                    height: 20,
                    borderRadius: T.radiusSm,
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    padding: 0,
                    flexShrink: 0,
                    color: T.muted,
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="none"
                  >
                    <circle cx="12" cy="5" r="1.6" />
                    <circle cx="12" cy="12" r="1.6" />
                    <circle cx="12" cy="19" r="1.6" />
                  </svg>
                </button>
              </Popover>
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: T.accent,
                background: T.accentBg,
                border: `1px solid ${T.accent}44`,
                borderRadius: T.radiusSm,
                padding: "1px 5px",
              }}
            >
              {localPassengers.length} pax
            </span>

            {group.isGuardAllocated && (
              <Icon src={GuardSvg} size={14} title="Guard allocated" />
            )}

            {/* Rearrange button */}
            {onRearrange && (
              <Popover
                content={CAB_TOOLTIPS.rearrange}
                title={null}
                trigger="hover"
                placement="top"
              >
                <button
                  title="Rearrange stop order"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRearrange();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 20,
                    height: 20,
                    borderRadius: T.radiusSm,
                    border: `1px solid ${T.border}`,
                    background: T.card,
                    cursor: "pointer",
                    padding: 0,
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={T.muted}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <polyline points="3 6 4 7 6 5" />
                    <polyline points="3 12 4 13 6 11" />
                    <polyline points="3 18 4 19 6 17" />
                  </svg>
                </button>
              </Popover>
            )}

            <IcChevron dir={effectiveCollapsed ? "down" : "up"} />
          </div>
        </div>
        <div
          style={{
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 5,
            padding: "6px 10px",
            background: "#f5f5f5",
            color: "#475569",
            borderBottom: `1px dashed ${T.border}`,
          }}
        >
          {/* Vehicle */}
          {group.vehicleRegNo && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 9 }}>
                  Vehicle No.{" "}
                  <strong style={{ color: "#0F172A" }}>
                    {group.vehicleRegNo}
                  </strong>
                </span>
              </div>
              <div
                style={{
                  width: 1,
                  height: 14,
                  background: "#E2E8F0",
                }}
              />
            </>
          )}

          {/* Occupancy */}
          {group.occupancy !== undefined && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 9 }}>
                  Occupancy: <strong>{group.occupancy}</strong>
                </span>
              </div>
              <div
                style={{
                  width: 1,
                  height: 14,
                  background: "#E2E8F0",
                }}
              />
            </>
          )}

          {/* Capacity */}
          {group.capacity !== undefined && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 9 }}>
                  Capacity: <strong>{group.capacity}</strong>
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Guard allocation confirmation bar ── */}
      {showGuardConfirm && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            padding: "8px 12px",
            background: "#EFF6FF",
            borderBottom: "1px solid #BFDBFE",
            borderTop: "1px solid #BFDBFE",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <span
            style={{ fontSize: 11, fontWeight: 600, color: "#1E40AF", flex: 1 }}
          >
            {group.isGuardAllocated
              ? `Remove guard from Trip #${group.vehicleId}?`
              : `Allocate a guard to Trip #${group.vehicleId}?`}
          </span>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button
              onClick={() => setShowGuardConfirm(false)}
              disabled={isAllocatingGuard}
              style={{
                height: 22,
                padding: "0 8px",
                fontSize: 11,
                fontWeight: 600,
                background: T.card,
                border: `1px solid ${T.border}`,
                borderRadius: T.radiusSm,
                color: T.muted,
                cursor: isAllocatingGuard ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAllocateGuard}
              disabled={isAllocatingGuard}
              style={{
                height: 22,
                padding: "0 8px",
                fontSize: 11,
                fontWeight: 600,
                background: "#1E40AF",
                border: "none",
                borderRadius: T.radiusSm,
                color: "#fff",
                cursor: isAllocatingGuard ? "not-allowed" : "pointer",
                opacity: isAllocatingGuard ? 0.7 : 1,
              }}
            >
              {isAllocatingGuard ? "Saving…" : "Confirm"}
            </button>
          </div>
        </div>
      )}

      {/* ── Reorder confirmation bar ── */}
      {pendingAction && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            padding: "8px 12px",
            background: T.warnBg,
            borderBottom: `1px solid #FDE68A`,
            borderTop: `1px solid #FDE68A`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <span
            style={{ fontSize: 11, fontWeight: 600, color: "#92400E", flex: 1 }}
          >
            ⚠ Rearrange {checkedList.length} passenger
            {checkedList.length !== 1 ? "s" : ""}?
          </span>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button
              onClick={cancelReorder}
              style={{
                height: 22,
                padding: "0 8px",
                fontSize: 11,
                fontWeight: 600,
                background: T.card,
                border: `1px solid ${T.border}`,
                borderRadius: T.radiusSm,
                color: T.muted,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={confirmReorder}
              style={{
                height: 22,
                padding: "0 8px",
                fontSize: 11,
                fontWeight: 600,
                background: T.accent,
                border: "none",
                borderRadius: T.radiusSm,
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* ── Passenger list ── */}
      {!effectiveCollapsed && (
        <div role="list">
          {localPassengers.length === 0 ? (
            <div
              style={{
                padding: "16px 12px",
                textAlign: "center",
                fontSize: 11,
                color: isHovered ? color : T.textSub,
                border: `2px dashed ${isHovered ? color : T.border}`,
                margin: 8,
                borderRadius: T.radiusSm,
                background: isHovered ? `${color}08` : "transparent",
                transition: "all 0.15s",
              }}
            >
              {isHovered ? "Release to drop here" : "Drop passengers here"}
            </div>
          ) : (
            localPassengers.map((p) => (
              <PassengerRow
                key={p.Id}
                passenger={p}
                groupColor={color}
                isDragging={dragItemId === p.Id}
                vehicleId={group.vehicleId}
                vehicleLabel={group.label}
                isChecked={checkedIds.has(p.Id)}
                onCheckChange={(checked) => toggleCheck(p.Id, checked)}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onRefetch={onRefetch}
                isVehicleAssigned={!!group.vehicleRegNo} // truthy when vehicle is set
                tripType={tripType} // pass from CabGroupPanel's own prop
                driverMobileNo={group.driverMobileNo} // add to CabGroup type if not present
                onSplit={onSplit}
              />
            ))
          )}
        </div>
      )}

      {/* ── Drop hint ── */}
      {isHovered && localPassengers.length > 0 && (
        <div
          style={{
            padding: "5px 10px",
            fontSize: 10.5,
            fontWeight: 600,
            color,
            textAlign: "center",
            borderTop: `1px dashed ${color}`,
            background: `${color}08`,
          }}
        >
          ⟶ Drop to assign to Vehicle #{group.vehicleId}
        </div>
      )}
    </div>
  );
}
