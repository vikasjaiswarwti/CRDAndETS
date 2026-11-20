// features/shift-validation/slice/shiftValidationSlice.ts
// FIXES:
//  - wiseId is ALWAYS a string (coerced in setWiseId reducer)
//  - setMode resets wiseId to "" (string) not undefined
//  - All string fields have safe string defaults

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ShiftSlot, ValidateType } from "../types/shiftValidation.types";

interface ShiftValidationUiState {
  currentMode: ValidateType;
  locCode: number;
  wiseId: string; // ALWAYS a string — never null/undefined/number
  pickupShifts: ShiftSlot[];
  dropShifts: ShiftSlot[];
  originalPickup: ShiftSlot[];
  originalDrop: ShiftSlot[];
  isDataLoaded: boolean;
  isConfirmModalOpen: boolean;
  shiftDate: string;
}

const initialState: ShiftValidationUiState = {
  currentMode: 1,
  locCode: 0,
  wiseId: "", // safe string default
  pickupShifts: [],
  dropShifts: [],
  originalPickup: [],
  originalDrop: [],
  isDataLoaded: false,
  isConfirmModalOpen: false,
  shiftDate: new Date().toISOString().slice(0, 10),
};

export const shiftValidationSlice = createSlice({
  name: "shiftValidationUi",
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<ValidateType>) {
      state.currentMode = action.payload;
      state.isDataLoaded = false;
      state.pickupShifts = [];
      state.dropShifts = [];
      state.wiseId = ""; // reset to empty string (not undefined)
    },

    setLocCode(
      state,
      action: PayloadAction<number | string | null | undefined>,
    ) {
      // Coerce safely — Select may pass string or number
      state.locCode = Number(action.payload) || 0;
    },

    setWiseId(
      state,
      action: PayloadAction<string | number | null | undefined>,
    ) {
      // ALWAYS coerce to string — prevents .trim() TypeError
      state.wiseId = action.payload != null ? String(action.payload) : "";
    },

    loadShifts(
      state,
      action: PayloadAction<{ pickup: ShiftSlot[]; drop: ShiftSlot[] }>,
    ) {
      state.pickupShifts = action.payload.pickup;
      state.dropShifts = action.payload.drop;
      state.originalPickup = action.payload.pickup.map((s) => ({ ...s }));
      state.originalDrop = action.payload.drop.map((s) => ({ ...s }));
      state.isDataLoaded = true;
    },

    togglePickupShift(state, action: PayloadAction<number>) {
      const s = state.pickupShifts.find((x) => x.shiftId === action.payload);
      if (s) s.active = !s.active;
    },

    toggleDropShift(state, action: PayloadAction<number>) {
      const s = state.dropShifts.find((x) => x.shiftId === action.payload);
      if (s) s.active = !s.active;
    },

    selectAllPickup(state, action: PayloadAction<boolean>) {
      state.pickupShifts.forEach((s) => (s.active = action.payload));
    },

    selectAllDrop(state, action: PayloadAction<boolean>) {
      state.dropShifts.forEach((s) => (s.active = action.payload));
    },

    resetToOriginal(state) {
      state.pickupShifts = state.originalPickup.map((s) => ({ ...s }));
      state.dropShifts = state.originalDrop.map((s) => ({ ...s }));
    },

    openConfirmModal(state) {
      state.isConfirmModalOpen = true;
    },

    closeConfirmModal(state) {
      state.isConfirmModalOpen = false;
    },

    setShiftDate(state, action: PayloadAction<string>) {
      state.shiftDate = action.payload ?? initialState.shiftDate;
    },

    clearShifts(state) {
      state.pickupShifts = [];
      state.dropShifts = [];
      state.isDataLoaded = false;
    },

    resetShiftValidationUi() {
      return { ...initialState };
    },
  },
});

export const {
  setMode,
  setLocCode,
  setWiseId,
  loadShifts,
  togglePickupShift,
  toggleDropShift,
  selectAllPickup,
  selectAllDrop,
  resetToOriginal,
  openConfirmModal,
  closeConfirmModal,
  setShiftDate,
  clearShifts,
  resetShiftValidationUi,
} = shiftValidationSlice.actions;

export default shiftValidationSlice.reducer;
