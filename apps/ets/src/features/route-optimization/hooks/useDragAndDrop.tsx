// ─── hooks/useDragAndDrop.ts ──────────────────────────────────────────────────
//
// Self-contained drag-and-drop hook.
// No UI or business logic — just state tracking + logging.
//
// Usage:
//   const dd = useDragAndDrop();
//   // draggable row:
//   <div draggable onDragStart={e => dd.onDragStart(e, payload)} onDragEnd={dd.onDragEnd} />
//   // drop zone:
//   <div onDragOver={e => dd.onDragOver(e, 'zone-101')}
//        onDragLeave={dd.onDragLeave}
//        onDrop={e => { const r = dd.onDrop(e, 101, 'CAB_GROUP'); if (r) applyMove(r); }} />

import { useState, useCallback, useRef } from "react";

// ─── Public types ─────────────────────────────────────────────────────────────

export type DropZoneType = "CAB_GROUP" | "ROUTE_CARD";

/** Payload serialised into the drag event and tracked in state */
export interface DragPassenger {
  passengerId: number;
  passengerName: string;
  employeeId: string;
  gender: "M" | "F";
  sourceVehicleId: number;
  sourceVehicleLabel: string;
  pickupSequence: number;
}

/** Returned from onDrop on success */
export interface DropResult {
  passenger: DragPassenger;
  targetVehicleId: number;
  targetType: DropZoneType;
}

export type DragAction = "START" | "DROP" | "CANCEL" | "SAME_VEHICLE";

/** One entry in the activity log */
export interface DragLogEntry {
  id: string;
  timestamp: string;
  action: DragAction;
  passengerName: string;
  employeeId: string;
  fromVehicle: number;
  toVehicle: number | null;
  toType: DropZoneType | null;
  success: boolean;
  note: string;
}

export interface UseDragAndDropReturn {
  isDragging: boolean;
  dragItem: DragPassenger | null;
  overZoneId: string | null;
  /** In-memory log of all events (newest first, capped at 100) */
  logs: DragLogEntry[];
  onDragStart: (e: React.DragEvent, passenger: DragPassenger) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent, zoneId: string) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (
    e: React.DragEvent,
    targetVehicleId: number,
    targetType: DropZoneType,
  ) => DropResult | null;
  clearLogs: () => void;
}

// ─── Private helpers ──────────────────────────────────────────────────────────

const TRANSFER_KEY = "application/x-route-maker-passenger";
let _seq = 0;

const nowHHMMSS = (): string =>
  new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

function buildLog(
  action: DragAction,
  passenger: DragPassenger,
  targetVehicleId: number | null,
  targetType: DropZoneType | null,
  success: boolean,
  note: string,
): DragLogEntry {
  return {
    id: `dd-${++_seq}-${Date.now()}`,
    timestamp: nowHHMMSS(),
    action,
    passengerName: passenger.passengerName,
    employeeId: passenger.employeeId,
    fromVehicle: passenger.sourceVehicleId,
    toVehicle: targetVehicleId,
    toType: targetType,
    success,
    note,
  };
}

const ACTION_EMOJI: Record<DragAction, string> = {
  START: "🟡",
  DROP: "✅",
  CANCEL: "🚫",
  SAME_VEHICLE: "↩️",
};

function emitConsole(log: DragLogEntry): void {
  console.group(
    `%c${ACTION_EMOJI[log.action]} [D&D] ${log.action} — ${log.passengerName}`,
    "color:#16A34A;font-weight:700;font-size:12px",
  );
  console.log(
    `⏰ ${log.timestamp}  |  👤 ${log.employeeId}  |  🚌 #${log.fromVehicle}`,
  );
  if (log.toVehicle !== null)
    console.log(`🎯 → Vehicle #${log.toVehicle} (${log.toType})`);
  console.log(`📝 ${log.note}`);
  console.groupEnd();
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDragAndDrop(): UseDragAndDropReturn {
  const [dragItem, setDragItem] = useState<DragPassenger | null>(null);
  const [overZoneId, setOverZoneId] = useState<string | null>(null);
  const [logs, setLogs] = useState<DragLogEntry[]>([]);
  // Track whether a successful drop fired so onDragEnd can detect CANCEL
  const droppedRef = useRef(false);

  const pushLog = useCallback((log: DragLogEntry) => {
    emitConsole(log);
    setLogs((prev) => [log, ...prev].slice(0, 100));
  }, []);

  // ── onDragStart ────────────────────────────────────────────────────────────
  const onDragStart = useCallback(
    (e: React.DragEvent, passenger: DragPassenger) => {
      droppedRef.current = false;
      setDragItem(passenger);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData(TRANSFER_KEY, JSON.stringify(passenger));
      pushLog(buildLog("START", passenger, null, null, true, "Drag initiated"));
    },
    [pushLog],
  );

  // ── onDragEnd ──────────────────────────────────────────────────────────────
  const onDragEnd = useCallback(
    (_e: React.DragEvent) => {
      if (!droppedRef.current && dragItem) {
        pushLog(
          buildLog(
            "CANCEL",
            dragItem,
            null,
            null,
            false,
            "Dropped outside a valid drop zone",
          ),
        );
      }
      setDragItem(null);
      setOverZoneId(null);
      droppedRef.current = false;
    },
    [dragItem, pushLog],
  );

  // ── onDragOver ─────────────────────────────────────────────────────────────
  const onDragOver = useCallback((e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverZoneId(zoneId);
  }, []);

  // ── onDragLeave ────────────────────────────────────────────────────────────
  // Only clears if the mouse actually left the element, not just entered a child.
  const onDragLeave = useCallback((e: React.DragEvent) => {
    const related = e.relatedTarget as Node | null;
    if (related && (e.currentTarget as HTMLElement).contains(related)) return;
    setOverZoneId(null);
  }, []);

  // ── onDrop ─────────────────────────────────────────────────────────────────
  const onDrop = useCallback(
    (
      e: React.DragEvent,
      targetVehicleId: number,
      targetType: DropZoneType,
    ): DropResult | null => {
      e.preventDefault();
      // setOverZoneId(null);

      const raw = e.dataTransfer.getData(TRANSFER_KEY);
      if (!raw) {
        console.warn("[D&D] onDrop: no transfer data found");
        return null;
      }

      let passenger: DragPassenger;
      try {
        passenger = JSON.parse(raw) as DragPassenger;
      } catch {
        console.error("[D&D] onDrop: failed to parse transfer data");
        return null;
      }

      if (passenger.sourceVehicleId === targetVehicleId) {
        pushLog(
          buildLog(
            "SAME_VEHICLE",
            passenger,
            targetVehicleId,
            targetType,
            false,
            "Source and target vehicle are the same — no move performed",
          ),
        );
        setDragItem(null);
        droppedRef.current = true;
        return null;
      }

      droppedRef.current = true;
      pushLog(
        buildLog(
          "DROP",
          passenger,
          targetVehicleId,
          targetType,
          true,
          `Passenger moved from Vehicle #${passenger.sourceVehicleId} → #${targetVehicleId} via ${targetType}`,
        ),
      );

      setOverZoneId(null);
      setDragItem(null);
      return { passenger, targetVehicleId, targetType };
    },
    [pushLog],
  );

  const clearLogs = useCallback(() => setLogs([]), []);

  return {
    isDragging: dragItem !== null,
    dragItem,
    overZoneId,
    logs,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop,
    clearLogs,
  };
}
