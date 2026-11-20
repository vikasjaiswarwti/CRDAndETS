import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface LkpAdhocWeekDaysUiState {
  isFilterPanelOpen: boolean;
  activeFilterId: string | null;
  pendingStatusToggleId: string | null;
}

const initialState: LkpAdhocWeekDaysUiState = {
  isFilterPanelOpen: false,
  activeFilterId: null,
  pendingStatusToggleId: null,
};

export const lkpAdhocWeekDaysSlice = createSlice({
  name: "lkpAdhocWeekDaysUi",
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
    resetLkpAdhocWeekDaysUi() {
      return initialState;
    },
  },
});

export const {
  toggleFilterPanel,
  setActiveFilter,
  setPendingStatusToggle,
  resetLkpAdhocWeekDaysUi,
} = lkpAdhocWeekDaysSlice.actions;

export default lkpAdhocWeekDaysSlice.reducer;
