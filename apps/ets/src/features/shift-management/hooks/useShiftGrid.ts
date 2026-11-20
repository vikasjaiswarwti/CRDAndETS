

// hooks/useShiftGrid.ts
// Tracks which slots changed so bulk update only calls API for dirty rows

import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { setLocalSlots, patchSlot } from "../slice/shiftSlice";
import type {
  ShiftSlot,
  ShiftBoolKey,
  ShiftNumKey,
  ShiftStringKey,
} from "../types/shift.mangement.types";

export interface UseShiftGridReturn {
  localSlots: ShiftSlot[];
  dirtyIds: Set<string>; // IDs of rows changed since last server sync
  handleToggle: (i: number, key: ShiftBoolKey) => void;
  handleNumChange: (i: number, key: ShiftNumKey, v: number) => void;
  handleStrChange: (i: number, key: ShiftStringKey, v: string) => void;
  resetToServer: () => void;
  markClean: (ids: string[]) => void; // called by bulk update after success
}

export function useShiftGrid(serverSlots: ShiftSlot[]): UseShiftGridReturn {
  const dispatch = useDispatch();
  const localSlots = useSelector((s: RootState) => s.shiftUi.localSlots);

  // Track dirty slot IDs — persisted in a ref so it survives re-renders
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const serverRef = useRef<ShiftSlot[]>([]);

  // ✅ Compare by length + first/last ID — avoids firing on new [] references
  const prevLengthRef = useRef(0);
  const prevFirstIdRef = useRef("");

  // Sync server data → local whenever server data changes (e.g. after refetch)
  useEffect(() => {
    const length = serverSlots.length;
    const firstId = serverSlots[0]?.id ?? "";

    // Only sync if data actually changed — not just a new array reference
    if (
      length === prevLengthRef.current &&
      firstId === prevFirstIdRef.current
    ) {
      return;
    }

    prevLengthRef.current = length;
    prevFirstIdRef.current = firstId;
    serverRef.current = serverSlots;
    dispatch(setLocalSlots(serverSlots));
    setDirtyIds(new Set());
  }, [serverSlots, dispatch]);

  const markDirty = useCallback((id: string) => {
    setDirtyIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const handleToggle = useCallback(
    (i: number, key: ShiftBoolKey) => {
      const slot = localSlots[i];
      if (!slot) return;
      dispatch(patchSlot({ index: i, patch: { [key]: !slot[key] } }));
      markDirty(slot.id);
    },
    [dispatch, localSlots, markDirty],
  );

  const handleNumChange = useCallback(
    (i: number, key: ShiftNumKey, v: number) => {
      const slot = localSlots[i];
      if (!slot) return;
      dispatch(patchSlot({ index: i, patch: { [key]: v } }));
      markDirty(slot.id);
    },
    [dispatch, localSlots, markDirty],
  );

  const handleStrChange = useCallback(
    (i: number, key: ShiftStringKey, v: string) => {
      const slot = localSlots[i];
      if (!slot) return;
      dispatch(patchSlot({ index: i, patch: { [key]: v || null } }));
      markDirty(slot.id);
    },
    [dispatch, localSlots, markDirty],
  );

  const resetToServer = useCallback(() => {
    dispatch(setLocalSlots(serverRef.current));
    setDirtyIds(new Set());
  }, [dispatch]);

  const markClean = useCallback((ids: string[]) => {
    setDirtyIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  }, []);

  return {
    localSlots,
    dirtyIds,
    handleToggle,
    handleNumChange,
    handleStrChange,
    resetToServer,
    markClean,
  };
}
