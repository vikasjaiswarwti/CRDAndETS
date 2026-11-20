// ─── components/LeftSidebar.tsx ───────────────────────────────────────────────
// Multi-selection aware sidebar.
// Receives only selectedCabGroups (filtered by page) and wires drag-and-drop
// handlers down to each CabGroupPanel.
//
// FIXES vs previous version:
//   • DragHandlers.onDragStart uses DragPassenger object (not individual params)
//     — must match useDragAndDrop's dd.onDragStart signature
//   • Added onDragLeave to DragHandlers
//   • Added overZoneId + dragItemId props so CabGroupPanel can highlight
//   • CabGroupPanel receives all required props: color, isActive, onSelect,
//     zoneId, dragItemId, overZoneId, pre-bound onDragOver/onDrop/onDragLeave

import React from "react";
import { T } from "../constants/designTokens";
import type { CabGroup } from "../types/Routemaker.types";
import type { DragPassenger } from "../hooks/useDragAndDrop";
import CabGroupPanel from "./CabGroupPanel";

import { useRef } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DragHandlers {
  /** Must match useDragAndDrop's onDragStart: (e, DragPassenger) => void */
  onDragStart: (e: React.DragEvent, passenger: DragPassenger) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent, zoneId: string) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, vehicleId: number) => void;
}

interface Props {
  cabGroups: CabGroup[];
  colorMap: Record<number, string>;
  activeVehicleId: number | null;
  onSelectVehicle: (id: number) => void;
  dragHandlers: DragHandlers;
  /** The globally hovered zone id from useDragAndDrop — drives drop zone highlight */
  overZoneId: string | null;
  /** passengerId currently being dragged — drives row opacity */
  dragItemId: number | null;
  onClearSelection?: () => void;
  selectionCount?: number;
  /** Called when user reorders passengers within a cab group via the checkbox toolbar */
  onReorder?: (vehicleId: number, orderedPassengerIds: number[]) => void;
  /** IDs of the two trips currently queued for merge */
  mergeSelectedIds?: number[];
  /** Toggle a trip's inclusion in the merge selection */
  onToggleMergeSelect?: (vehicleId: number) => void;
  /** Fire when exactly 2 trips are selected and user clicks Merge */
  onRequestMerge?: () => void;
  /** Open the RearrangeRouteDrawer for this group */
  onRearrange?: (group: CabGroup) => void;
  onSplit?: (vehicleId: number, empIds: number[]) => void;
  onRefetch?: () => void;
  tripType:number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LeftSidebar({
  cabGroups,
  colorMap,
  activeVehicleId,
  onSelectVehicle,
  dragHandlers,
  overZoneId,
  dragItemId,
  onClearSelection,
  selectionCount = 0,
  onReorder,
  mergeSelectedIds = [],
  onToggleMergeSelect,
  onRequestMerge,
  onRearrange,
  onSplit,
  onRefetch,
  tripType
}: Props) {
  // console.log("cabGroups from left sidebar", cabGroups);

  const scrollIdRef = useRef(
    `ls-scroll-${Math.random().toString(36).slice(2, 7)}`,
  );
  const scrollId = scrollIdRef.current;

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: T.panel,
        overflow: "hidden",
      }}
    >
      {/* Scoped scrollbar hide for webkit */}

      <style>{`
        #${scrollId}::-webkit-scrollbar { width: 3px; }
        #${scrollId}::-webkit-scrollbar-track { background: ${T.border}; border-radius: 99px; }
        #${scrollId}::-webkit-scrollbar-thumb { background: ${T.muted}; border-radius: 99px; min-height: 40px; }
        #${scrollId}::-webkit-scrollbar-thumb:hover { background: ${T.text}; }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: "12px 14px 10px",
          borderBottom: `1px solid ${T.border}`,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: T.fontSm, color: T.text }}>
            Trip Groups
          </span>
          {selectionCount > 0 && (
            <span
              style={{
                background: T.accentBg,
                color: T.accent,
                fontSize: T.fontXs,
                fontWeight: 700,
                borderRadius: T.radiusFull,
                padding: "2px 8px",
              }}
            >
              {selectionCount}
            </span>
          )}
        </div>

        {onClearSelection && selectionCount > 0 && (
          <button
            onClick={onClearSelection}
            title="Clear selection"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "none",
              border: `1px solid ${T.border}`,
              borderRadius: T.radiusSm,
              cursor: "pointer",
              padding: "3px 8px",
              color: T.muted,
              fontSize: T.fontXs,
              fontWeight: 500,
            }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Clear
          </button>
        )}
      </div>
      {/* ── Merge banner — shown when exactly 2 trips are checked ─────────── */}
      {mergeSelectedIds.length === 2 && onRequestMerge && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "7px 12px",
            background: T.accentBg,
            borderBottom: `1px solid ${T.accent}44`,
            flexShrink: 0,
            gap: 8,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color: T.accent }}>
            2 trips selected for merge
          </span>
          <button
            onClick={onRequestMerge}
            style={{
              height: 24,
              padding: "0 10px",
              borderRadius: T.radiusSm,
              border: "none",
              background: T.accent,
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              whiteSpace: "nowrap",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path
                d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Merge Trips
          </button>
        </div>
      )}
      {/* ── Cab group list (scrollable, hidden scrollbar) ──────────────────── */}
      <div
        id={scrollId}
        style={
          {
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: "8px 0",
            scrollbarWidth: "thin", // Firefox
            scrollbarColor: `${T.muted} ${T.border}`,
            // msOverflowStyle: "none", // IE / old Edge
          } as React.CSSProperties
        }
      >
        {cabGroups.length === 0 && (
          <div
            style={{
              padding: 24,
              textAlign: "center",
              color: T.muted,
              fontSize: T.fontSm,
            }}
          >
            Select a route from the panel →
          </div>
        )}

        {cabGroups.map((group) => {
          const zoneId = `cab-${group.vehicleId}`;
          const color = colorMap[group.vehicleId] ?? T.accent;

          return (
            <div
              key={group.vehicleId}
              style={{
                marginInline: 6,
                borderRadius: T.radiusSm,
                // overflow: "hidden",
                boxShadow: `0 1px 3px rgba(0,0,0,0.06)`,
                flexShrink: 0,
              }}
            >
              <CabGroupPanel
                group={group}
                color={color}
                isActive={activeVehicleId === group.vehicleId}
                onSelect={() => onSelectVehicle(group.vehicleId)}
                zoneId={zoneId}
                overZoneId={overZoneId}
                dragItemId={dragItemId}
                onDragStart={dragHandlers.onDragStart}
                onDragEnd={dragHandlers.onDragEnd}
                onDragOver={(e) => dragHandlers.onDragOver(e, zoneId)}
                onDragLeave={dragHandlers.onDragLeave}
                onDrop={(e) => dragHandlers.onDrop(e, group.vehicleId)}
                onReorder={onReorder}
                isSelectedForMerge={mergeSelectedIds.includes(group.vehicleId)}
                onToggleMergeSelect={
                  onToggleMergeSelect
                    ? () => onToggleMergeSelect(group.vehicleId)
                    : undefined
                }
                onRearrange={onRearrange ? () => onRearrange(group) : undefined}
                onSplit={onSplit}
                onRefetch={onRefetch}
                tripType={tripType}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
