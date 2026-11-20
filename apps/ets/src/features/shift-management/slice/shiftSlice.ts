
// slice/shiftSlice.ts
// Handles localSlots (grid state) and selected UI state.
// patchSlot accepts any partial ShiftSlot — bool, number, or string fields.

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ShiftSlot } from "../types/shift.mangement.types";

interface ShiftUiState {
  localSlots: ShiftSlot[];
  selectedLocCode: number | null;
  selectedInterval: number | null;
}

const initialState: ShiftUiState = {
  localSlots: [],
  selectedLocCode: null,
  selectedInterval: null,
};

const shiftSlice = createSlice({
  name: "shiftUi",
  initialState,
  reducers: {
    setLocalSlots(state, action: PayloadAction<ShiftSlot[]>) {
      state.localSlots = action.payload;
    },

    // Patch any subset of fields on a single slot by index.
    // Handles bool, number, string (including dropShift which is string | null).
    patchSlot(
      state,
      action: PayloadAction<{ index: number; patch: Partial<ShiftSlot> }>,
    ) {
      const { index, patch } = action.payload;
      if (state.localSlots[index]) {
        Object.assign(state.localSlots[index], patch);
      }
    },

    setSelectedLocCode(state, action: PayloadAction<number | null>) {
      state.selectedLocCode = action.payload;
    },

    setSelectedInterval(state, action: PayloadAction<number | null>) {
      state.selectedInterval = action.payload;
    },
  },
});

export const {
  setLocalSlots,
  patchSlot,
  setSelectedLocCode,
  setSelectedInterval,
} = shiftSlice.actions;

export default shiftSlice.reducer;
