// src/features/route-maker/Modals/RearrangeRouteDrawer.tsx
//
// Full-screen rearrange modal — matches the "Rearrange Route Stops" screenshot.
//
// Features:
//   • Drag-and-drop reordering (HTML5, no lib dependency)
//   • ↑ / ↓ buttons per row
//   • "Move to N" dropdown per row
//   • Undo stack (last 20 states)
//   • Reset to original order
//   • Route summary panel (right side)
//   • Save → calls onSave(vehicleId, orderedIds) → parent calls reorderTrip API
//   • isSaving prop — disables Save + shows spinner
//
// Props:
//   group      — CabGroup (vehicleId + passengers)
//   color      — route color from colorMap
//   route      — VehicleRoute for right-panel stats (optional)
//   isSaving   — true while reorderTrip API is in-flight
//   onClose    — cancel without saving
//   onSave     — called with (vehicleId, orderedIds[]) — parent does the API call

import React, { useState, useRef } from "react";
import { T } from "../constants/designTokens";
import type {
  CabGroup,
  Passenger,
  VehicleRoute,
} from "../types/Routemaker.types";
// import { fmtDist, fmtDuration, fmt12 } from "../utils/routeMakerHelpers";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Props {
  group: CabGroup;
  color: string;
  route?: VehicleRoute; // for right-panel stats
  isSaving?: boolean;
  onClose: () => void;
  onSave: (vehicleId: number, orderedIds: number[]) => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function resequence(passengers: Passenger[]): Passenger[] {
  return passengers.map((p, i) => ({ ...p, PickupSequence: i + 1 }));
}

const MAX_UNDO = 20;

// ── Component ──────────────────────────────────────────────────────────────────

export default function RearrangeRouteDrawer({
  group,
  color,
  //   route,
  isSaving = false,
  onClose,
  onSave,
}: Props) {
  const originalRef = useRef<Passenger[]>(group.passengers);

  const [order, setOrder] = useState<Passenger[]>(() =>
    resequence([...group.passengers]),
  );
  const [undoStack, setUndoStack] = useState<Passenger[][]>([]);
  const [isCloseHovered, setIsCloseHovered] = useState(false);

  // ── Drag state ─────────────────────────────────────────────────────────────
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // ── Open move-to dropdown ──────────────────────────────────────────────────
  const [openMoveToIdx, setOpenMoveToIdx] = useState<number | null>(null);

  // ── Dirty check ────────────────────────────────────────────────────────────
  const isDirty = order.some((p, i) => p.Id !== originalRef.current[i]?.Id);

  // ── Mutate helpers ─────────────────────────────────────────────────────────

  function pushUndo(prev: Passenger[]) {
    setUndoStack((s) => [...s.slice(-MAX_UNDO + 1), prev]);
  }

  function applyOrder(next: Passenger[]) {
    pushUndo(order);
    setOrder(resequence(next));
    setOpenMoveToIdx(null);
  }

  function undo() {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    setOrder(resequence(prev));
  }

  function reset() {
    pushUndo(order);
    setOrder(resequence([...originalRef.current]));
    setOpenMoveToIdx(null);
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    const next = [...order];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    applyOrder(next);
  }

  function moveDown(idx: number) {
    if (idx === order.length - 1) return;
    const next = [...order];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    applyOrder(next);
  }

  function moveTo(fromIdx: number, toPosition: number) {
    // toPosition is 1-based
    const toIdx = Math.max(0, Math.min(order.length - 1, toPosition - 1));
    if (toIdx === fromIdx) {
      setOpenMoveToIdx(null);
      return;
    }
    const next = [...order];
    const [item] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, item);
    applyOrder(next);
  }

  // ── HTML5 DnD ──────────────────────────────────────────────────────────────

  function handleDragStart(idx: number) {
    setDraggingIdx(idx);
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    setDragOverIdx(idx);
  }

  function handleDrop(toIdx: number) {
    if (draggingIdx === null || draggingIdx === toIdx) {
      setDraggingIdx(null);
      setDragOverIdx(null);
      return;
    }
    const next = [...order];
    const [item] = next.splice(draggingIdx, 1);
    next.splice(toIdx, 0, item);
    applyOrder(next);
    setDraggingIdx(null);
    setDragOverIdx(null);
  }

  function handleDragEnd() {
    setDraggingIdx(null);
    setDragOverIdx(null);
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  function handleSave() {
    onSave(
      group.vehicleId,
      order.map((p) => p.Id),
    );
  }

  // ── Right panel stats ──────────────────────────────────────────────────────

  //   const dist = route ? fmtDist(route.RouteDistanceKm) : "—";
  //   const duration = route ? fmtDuration(route.RouteDurationMinutes) : "—";
  //   const eta = route ? fmt12(route.EstimatedOfficeArrival) : "—";
  //   const stopCount = order.length;

  // ── Render ─────────────────────────────────────────────────────────────────

  console.log("order from rearrange", order);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3000,
      }}
    >
      <div
        style={{
          background: T.card,
          borderRadius: 16,
          boxShadow: "0 24px 80px -16px rgba(0,0,0,0.35)",
          width: "min(960px, 96vw)",
          height: "min(760px, 92vh)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: `1px solid ${T.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: "16px 20px 14px",
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            background: T.panel,
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>
              Rearrange Route Stops
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
              Drag to reorder or use controls to change stop sequence
            </div>
          </div>

          {/* Right: vehicle badge + reset + close */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Vehicle badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: `${color}12`,
                border: `1px solid ${color}44`,
                borderRadius: 8,
                padding: "5px 10px",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>
                Trip no.: {group.vehicleId}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: color,
                  background: `${color}20`,
                  border: `1px solid ${color}44`,
                  borderRadius: 10,
                  padding: "1px 7px",
                }}
              >
                {order.length} pax
              </span>
            </div>

            {/* Reset */}
            <button
              onClick={reset}
              disabled={!isDirty}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                height: 32,
                padding: "0 12px",
                borderRadius: 8,
                border: `1px solid ${T.border}`,
                background: T.card,
                color: isDirty ? T.text : T.textSub,
                fontSize: 12,
                fontWeight: 600,
                cursor: isDirty ? "pointer" : "not-allowed",
                opacity: isDirty ? 1 : 0.5,
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
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Reset Order
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              onMouseEnter={() => setIsCloseHovered(true)}
              onMouseLeave={() => setIsCloseHovered(false)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: `1px solid ${isCloseHovered ? "#EF4444" : T.border}`,
                background: isCloseHovered ? "#EF4444" : T.card,
                color: isCloseHovered ? "#FFFFFF" : T.muted,
                fontSize: 18,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Body: LEFT list + RIGHT preview ── */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "grid",
            gridTemplateColumns: "1fr", //"1fr 340px",
          }}
        >
          {/* ── LEFT: sortable list ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              borderRight: `1px solid ${T.border}`,
              overflow: "hidden",
            }}
          >
            {/* Column labels */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "32px 44px 1fr 60px 60px 100px",
                padding: "8px 16px",
                background: T.bg,
                borderBottom: `1px solid ${T.border}`,
                flexShrink: 0,
              }}
            >
              {["", "STOP", "EMPLOYEE / LOCATION", "", "", "ACTIONS"].map(
                (h, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: T.muted,
                      letterSpacing: "0.06em",
                      textAlign: i >= 3 && i <= 4 ? "center" : "left",
                    }}
                  >
                    {h}
                  </div>
                ),
              )}
            </div>

            {/* Rows */}
            <div
              style={
                {
                  flex: 1,
                  overflowY: "auto",
                  scrollbarWidth: "none" as any,
                } as React.CSSProperties
              }
            >
              {order.map((p, idx) => {
                const isDragging = draggingIdx === idx;
                const isOver = dragOverIdx === idx && draggingIdx !== idx;
                // const isLate = p.IsLate;
                const isMoveToOpen = openMoveToIdx === idx;

                return (
                  <div
                    key={p.Id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={() => handleDrop(idx)}
                    onDragEnd={handleDragEnd}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "32px 44px 1fr 60px 60px 100px",
                      alignItems: "center",
                      padding: "10px 16px",
                      background: isOver
                        ? `${color}10`
                        : isDragging
                          ? T.bg
                          : "transparent",
                      borderBottom: `1px solid ${T.border}`,
                      borderTop: isOver
                        ? `2px solid ${color}`
                        : "2px solid transparent",
                      opacity: isDragging ? 0.4 : 1,
                      transition: "background 0.1s, opacity 0.1s",
                      cursor: "grab",
                      position: "relative",
                    }}
                  >
                    {/* Drag handle */}
                    <div
                      style={{
                        color: T.textSub,
                        fontSize: 14,
                        lineHeight: 1,
                        cursor: "grab",
                        userSelect: "none",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      ⠿
                    </div>

                    {/* Stop number */}
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: color,
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: `0 0 0 3px ${color}33`,
                      }}
                    >
                      {idx + 1}
                    </div>

                    {/* Employee info */}
                    <div style={{ minWidth: 0, paddingRight: 8 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 2,
                        }}
                      >
                        {/* Gender dot */}
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            background:
                              p.Gender === "F" ? "#FDF2F8" : "#EFF6FF",
                            border: `1.5px solid ${p.Gender === "F" ? "#F9A8D4" : "#BFDBFE"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 9,
                            color: p.Gender === "F" ? "#EC4899" : "#3B82F6",
                            flexShrink: 0,
                          }}
                        >
                          {p.Gender === "F" ? "♀" : "♂"}
                        </div>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: T.text,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {p.Firstname} - {p.EmployeeID}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: T.muted,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.Address ?? "—"}
                      </div>
                      {/* {isLate && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#EF4444",
                            letterSpacing: "0.04em",
                          }}
                        >
                          LATE
                        </span>
                      )} */}
                    </div>

                    {/* ↑ Up */}
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <button
                        onClick={() => moveUp(idx)}
                        disabled={idx === 0}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          border: `1px solid ${T.border}`,
                          background: idx === 0 ? T.bg : T.card,
                          color: idx === 0 ? T.textSub : T.text,
                          cursor: idx === 0 ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: idx === 0 ? 0.4 : 1,
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
                          <line x1="12" y1="19" x2="12" y2="5" />
                          <polyline points="5 12 12 5 19 12" />
                        </svg>
                      </button>
                    </div>

                    {/* ↓ Down */}
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <button
                        onClick={() => moveDown(idx)}
                        disabled={idx === order.length - 1}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          border: `1px solid ${T.border}`,
                          background: idx === order.length - 1 ? T.bg : T.card,
                          color: idx === order.length - 1 ? T.textSub : T.text,
                          cursor:
                            idx === order.length - 1
                              ? "not-allowed"
                              : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: idx === order.length - 1 ? 0.4 : 1,
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
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <polyline points="19 12 12 19 5 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Move to N dropdown */}
                    <div style={{ position: "relative" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMoveToIdx(isMoveToOpen ? null : idx);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          height: 28,
                          padding: "0 8px",
                          borderRadius: 6,
                          border: `1px solid ${T.border}`,
                          background: isMoveToOpen ? T.accentBg : T.card,
                          color: isMoveToOpen ? T.accent : T.text,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Move to {idx + 1}
                        <svg
                          width="9"
                          height="9"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>

                      {isMoveToOpen && (
                        <div
                          style={
                            {
                              position: "absolute",
                              right: 0,
                              top: "calc(100% + 4px)",
                              background: T.card,
                              border: `1px solid ${T.border}`,
                              borderRadius: 8,
                              boxShadow: T.shadowLg,
                              zIndex: 100,
                              minWidth: 80,
                              maxHeight: 200,
                              overflowY: "auto",
                              scrollbarWidth: "none" as any,
                            } as React.CSSProperties
                          }
                          onClick={(e) => e.stopPropagation()}
                        >
                          {order.map((_, pos) => (
                            <button
                              key={pos}
                              onClick={() => moveTo(idx, pos + 1)}
                              style={{
                                display: "block",
                                width: "100%",
                                padding: "7px 14px",
                                textAlign: "left",
                                background:
                                  pos === idx ? T.accentBg : "transparent",
                                border: "none",
                                fontSize: 12,
                                fontWeight: pos === idx ? 700 : 400,
                                color: pos === idx ? T.accent : T.text,
                                cursor: pos === idx ? "default" : "pointer",
                                borderBottom:
                                  pos < order.length - 1
                                    ? `1px solid ${T.border}`
                                    : "none",
                              }}
                            >
                              Position {pos + 1}
                              {pos === idx && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    color: T.muted,
                                    marginLeft: 4,
                                  }}
                                >
                                  (current)
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT: Live Route Preview ── */}
          {/* <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: T.bg,
              overflow: "hidden",
            }}
          >
           
            <div
              style={{
                padding: "14px 16px 10px",
                borderBottom: `1px solid ${T.border}`,
                flexShrink: 0,
                background: T.panel,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 3,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
                  Live Route Preview
                </span>
              </div>
              <div style={{ fontSize: 11, color: T.muted }}>
                Order changes update the route instantly
              </div>
            </div>

       
            <div
              style={{
                flex: 1,
                minHeight: 0,
                background: "#E8F0E9",
                position: "relative",
                overflow: "hidden",
              }}
            >
             
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 300 220"
                preserveAspectRatio="xMidYMid meet"
                style={{ position: "absolute", inset: 0 }}
              >
                
                <path
                  d="M30 180 Q80 140 120 100 Q160 60 220 80 Q260 90 270 50"
                  fill="none"
                  stroke={color}
                  strokeWidth="3"
                  strokeDasharray="8 4"
                  opacity="0.7"
                />
              
                {order.slice(0, 8).map((_, i) => {
                  const positions = [
                    [30, 180],
                    [80, 145],
                    [120, 105],
                    [160, 75],
                    [200, 70],
                    [235, 75],
                    [260, 65],
                    [270, 50],
                  ];
                  const [x, y] = positions[i] ?? [150, 110];
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="11" fill={color} opacity="0.9" />
                      <text
                        x={x}
                        y={y + 4}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="700"
                        fill="#fff"
                      >
                        {i + 1}
                      </text>
                    </g>
                  );
                })}
              
                <rect
                  x="120"
                  y="160"
                  width="28"
                  height="18"
                  rx="4"
                  fill="#1E40AF"
                  opacity="0.8"
                />
                <text
                  x="134"
                  y="172"
                  textAnchor="middle"
                  fontSize="8"
                  fill="#fff"
                  fontWeight="700"
                >
                  BUS
                </text>
              </svg>
            </div>

           
            <div
              style={{
                padding: "14px 16px",
                borderTop: `1px solid ${T.border}`,
                flexShrink: 0,
                background: T.panel,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>
                  Route Summary
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#16A34A",
                    background: "#F0FDF4",
                    border: "1px solid #BBF7D0",
                    borderRadius: 10,
                    padding: "2px 8px",
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
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {stopCount} / {stopCount} Stops
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                {[
                  { icon: "📍", label: "Total Distance", value: dist },
                  { icon: "⏱", label: "Est. Duration", value: duration },
                  { icon: "📅", label: "First Stop ETA", value: eta },
                  { icon: "🛑", label: "Stops", value: String(stopCount) },
                ].map((s) => (
                  <div key={s.label}>
                    <div
                      style={{
                        fontSize: 10,
                        color: T.muted,
                        marginBottom: 2,
                      }}
                    >
                      {s.icon} {s.label}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: T.text,
                      }}
                    >
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

         
            <div
              style={{
                margin: "0 16px 14px",
                padding: "10px 12px",
                background: "#FFFBEB",
                border: "1px solid #FDE68A",
                borderRadius: 8,
                display: "flex",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
              <div>
                <div
                  style={{ fontSize: 11, fontWeight: 700, color: "#92400E" }}
                >
                  Tip
                </div>
                <div style={{ fontSize: 10, color: "#B45309", marginTop: 2 }}>
                  Use Auto Optimize to get the best route based on distance &
                  traffic.
                </div>
              </div>
            </div>
          </div> */}
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
            background: T.panel,
          }}
        >
          {/* Auto Optimize */}
          {/* <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 8,
              border: `1px solid ${T.border}`,
              background: T.card,
              cursor: "pointer",
              flex: 1,
              textAlign: "left" as const,
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>⚡</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>
                Auto Optimize Route
              </div>
              <div style={{ fontSize: 10, color: T.muted }}>
                Reorder based on shortest distance & ETA
              </div>
            </div>
          </button> */}

          {/* Undo */}
          <button
            onClick={undo}
            disabled={undoStack.length === 0}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 8,
              border: `1px solid ${T.border}`,
              background: T.card,
              cursor: undoStack.length === 0 ? "not-allowed" : "pointer",
              opacity: undoStack.length === 0 ? 0.5 : 1,
              flex: 1,
              textAlign: "left" as const,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={T.muted}
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M3 7v6h6" />
              <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
            </svg>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>
                Undo
              </div>
              <div style={{ fontSize: 10, color: T.muted }}>
                {undoStack.length > 0
                  ? `${undoStack.length} action${undoStack.length !== 1 ? "s" : ""} available`
                  : "Undo last change"}
              </div>
            </div>
          </button>

          <div
            style={{
              width: 1,
              height: 36,
              background: T.border,
              flexShrink: 0,
            }}
          />

          {/* Cancel */}
          <button
            onClick={onClose}
            disabled={isSaving}
            style={{
              height: 38,
              padding: "0 20px",
              borderRadius: 8,
              border: `1px solid ${T.border}`,
              background: T.card,
              color: T.muted,
              fontSize: 13,
              fontWeight: 600,
              cursor: isSaving ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>

          {/* Save New Order */}
          <button
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            style={{
              height: 38,
              padding: "0 20px",
              borderRadius: 8,
              border: "none",
              background: isSaving || !isDirty ? T.border : T.accent,
              color: isSaving || !isDirty ? T.muted : "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: isSaving || !isDirty ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 7,
              minWidth: 148,
              justifyContent: "center",
              transition: "background 0.15s",
            }}
          >
            {isSaving ? (
              <>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  style={{ animation: "rmSpin 0.7s linear infinite" }}
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                </svg>
                Saving…
              </>
            ) : (
              <>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Save New Order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
