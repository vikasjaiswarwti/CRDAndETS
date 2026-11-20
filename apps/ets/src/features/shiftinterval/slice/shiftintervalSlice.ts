import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ShiftIntervalUiState {
  isFilterPanelOpen: boolean;
  activeFilterId: string | null;
  pendingStatusToggleId: string | null;
}

const initialState: ShiftIntervalUiState = {
  isFilterPanelOpen: false,
  activeFilterId: null,
  pendingStatusToggleId: null,
};

export const shiftIntervalSlice = createSlice({
  name: "shiftIntervalUi",
  initialState,
  reducers: {
    toggleFilterPanel(state) {
      state.isFilterPanelOpen = !state.isFilterPanelOpen;
    },
    setActiveFilter(state, action: PayloadAction<string | null>) {
      state.activeFilterId = action.payload;
    },
    setPendingStatusToggle(state, action: PayloadAction<string | null>) {
      state.pendingStatusToggleId = action.payload;
    },
    resetShiftIntervalUi() {
      return initialState;
    },
  },
});

export const {
  toggleFilterPanel,
  setActiveFilter,
  setPendingStatusToggle,
  resetShiftIntervalUi,
} = shiftIntervalSlice.actions;

export default shiftIntervalSlice.reducer;
