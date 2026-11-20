// features/shift-validation/hooks/useShiftValidationState.ts

import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/store/index";
import {
  setMode,
  setLocCode,
  setWiseId,
  setShiftDate,
  loadShifts,
  togglePickupShift,
  toggleDropShift,
  selectAllPickup,
  selectAllDrop,
  resetToOriginal,
  openConfirmModal,
  closeConfirmModal,
  clearShifts,
} from "../slice/shiftValidationSlice";
import {
  useGetShiftManagementMutation,
  useGetShiftValidationMutation,
} from "../services/shiftValidationApi";
import type { ShiftItem, ValidateType } from "../types/shiftValidation.types";
import type { ShiftSlot } from "../types/shiftValidation.types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function toShiftSlot(item: ShiftItem): ShiftSlot {
  return {
    controlId: item.ControlId,
    shiftId: item.shiftid,
    shiftTime: item.shifttime,
    active: item.Active,
  };
}

function safeStr(v: unknown): string {
  if (v == null) return "";
  return String(v);
}

/**
 * Resolve the wiseID to send for each mode.
 *
 * Mode 2 (User Wise)  — no user picker, always send "0"
 * Mode 3 (Dept)       — from state.wiseId (dept dropdown)
 * Mode 4 (LOB)        — from state.wiseId (lob dropdown)
 * Mode 5 (Process)    — from state.wiseId (process dropdown)
 */
function resolveWiseId(mode: ValidateType, stateWiseId: string): string {
  if (mode === 1 || mode === 2) return "0"; // User Wise — hardcoded per backend spec
  return safeStr(stateWiseId).trim();
}

/**
 * Whether a fetch can proceed for a given mode + wiseId combo.
 * Mode 2 always can (wiseId is hardcoded "0").
 * Modes 3–5 require the user to have selected an entity.
 */
function canFetch(mode: ValidateType, stateWiseId: string): boolean {
  if (mode === 1) return true; // already there ✓
  if (mode === 2) return true; // already there ✓
  return safeStr(stateWiseId).trim().length > 0;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useShiftValidationState = (
  tab: "create" | "mapping" = "create",
) => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.shiftValidationUi);

  const [fetchNormal, { isLoading: isLoadingNormal }] =
    useGetShiftManagementMutation();
  const [fetchValidation, { isLoading: isLoadingValidation }] =
    useGetShiftValidationMutation();

  const isLoading = isLoadingNormal || isLoadingValidation;

  // In useShiftValidationState:
  const handleClearShifts = useCallback(
    () => dispatch(clearShifts()),
    [dispatch],
  );
  // Return it

  // ── Mode 1 fetch (single call, returns pick+drop together) ───────────────
  const doFetchMode1 = useCallback(
    async (locCode: number, shiftDate: string) => {
      if (!locCode) return;
      try {
        const result = await fetchNormal({
          locCode,
          shiftDate: shiftDate || new Date().toISOString().slice(0, 10),
        }).unwrap();

        dispatch(
          loadShifts({
            pickup: (result.pickupShifts ?? []).map(toShiftSlot),
            drop: (result.dropShifts ?? []).map(toShiftSlot),
          }),
        );
      } catch (err) {
        console.error("[ShiftValidation] mode 1 fetch failed:", err);
      }
    },
    [dispatch, fetchNormal],
  );

  // ── Modes 2–5 fetch (TWO calls: tripType 1 = pickup, tripType 2 = drop) ──
  //
  // The backend returns a single `jsonShifts` array per call.
  // We fire both in parallel with Promise.all for performance.
  const doFetchValidation = useCallback(
    async (mode: ValidateType, locCode: number, stateWiseId: string) => {
      if (!locCode) return;
      if (!canFetch(mode, stateWiseId)) return;

      const wiseID = resolveWiseId(mode, stateWiseId);

      try {
        const [pickupItems, dropItems] = await Promise.all([
          fetchValidation({
            locCode,
            tripType: 1, // pickup
            wiseID,
            validateType: mode,
          }).unwrap(),

          fetchValidation({
            locCode,
            tripType: 2, // drop
            wiseID,
            validateType: mode,
          }).unwrap(),
        ]);

        dispatch(
          loadShifts({
            pickup: (pickupItems ?? []).map(toShiftSlot),
            drop: (dropItems ?? []).map(toShiftSlot),
          }),
        );
      } catch (err) {
        console.error("[ShiftValidation] validation fetch failed:", err);
      }
    },
    [dispatch, fetchValidation],
  );

  // ── Auto-fetch: mode 1 ────────────────────────────────────────────────────
  useEffect(() => {
    if (tab !== "create") return; // ← mapping tab never uses this
    if (state.currentMode === 1 && state.locCode) {
      doFetchMode1(state.locCode, state.shiftDate);
    }
  }, [state.locCode, state.currentMode, state.shiftDate, tab]);

  // ── Auto-fetch: modes 2–5 ─────────────────────────────────────────────────

  // WITH this (tab-aware):
  useEffect(() => {
    if (tab === "create" && state.currentMode === 1) return; // mode 1 handled by effect above
    if (!state.locCode) return;
    if (!canFetch(state.currentMode, state.wiseId)) return;
    doFetchValidation(state.currentMode, state.locCode, state.wiseId);
  }, [state.currentMode, state.locCode, state.wiseId, tab]); // ← add tab

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSetMode = useCallback(
    (mode: ValidateType) => dispatch(setMode(mode)),
    [dispatch],
  );

  const handleSetLocCode = useCallback(
    (code: number | string | null | undefined) =>
      dispatch(setLocCode(Number(code) || 0)),
    [dispatch],
  );

  const handleSetWiseId = useCallback(
    (id: string | number | null | undefined) =>
      dispatch(setWiseId(id != null ? String(id) : "")),
    [dispatch],
  );

  const handleSetDate = useCallback(
    (date: string) => dispatch(setShiftDate(date)),
    [dispatch],
  );

  const handleRefetch = useCallback(() => {
    if (!state.locCode) return;
    if (tab === "create" && state.currentMode === 1) {
      doFetchMode1(state.locCode, state.shiftDate);
      return;
    }
    if (canFetch(state.currentMode, state.wiseId)) {
      doFetchValidation(state.currentMode, state.locCode, state.wiseId);
    }
  }, [
    tab,
    state.currentMode,
    state.locCode,
    state.shiftDate,
    state.wiseId,
    doFetchMode1,
    doFetchValidation,
  ]);

  const handleTogglePickup = useCallback(
    (id: number) => dispatch(togglePickupShift(id)),
    [dispatch],
  );
  const handleToggleDrop = useCallback(
    (id: number) => dispatch(toggleDropShift(id)),
    [dispatch],
  );
  const handleSelectAllPickup = useCallback(
    (v: boolean) => dispatch(selectAllPickup(v)),
    [dispatch],
  );
  const handleSelectAllDrop = useCallback(
    (v: boolean) => dispatch(selectAllDrop(v)),
    [dispatch],
  );
  const handleReset = useCallback(
    () => dispatch(resetToOriginal()),
    [dispatch],
  );
  const handleOpenConfirm = useCallback(
    () => dispatch(openConfirmModal()),
    [dispatch],
  );
  const handleCloseConfirm = useCallback(
    () => dispatch(closeConfirmModal()),
    [dispatch],
  );

  return {
    state,
    isLoading,
    handleSetMode,
    handleSetLocCode,
    handleSetWiseId,
    handleSetDate,
    handleTogglePickup,
    handleToggleDrop,
    handleSelectAllPickup,
    handleSelectAllDrop,
    handleReset,
    handleOpenConfirm,
    handleCloseConfirm,
    handleRefetch,

    handleClearShifts,
  };
};
