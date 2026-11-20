import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface LkpPenaltyTypeUiState {
  isFilterPanelOpen: boolean;
  activeFilterId: string | null;
  pendingStatusToggleId: string | null;
}

const initialState: LkpPenaltyTypeUiState = {
  isFilterPanelOpen: false,
  activeFilterId: null,
  pendingStatusToggleId: null,
};

export const lkpPenaltyTypeSlice = createSlice({
  name: "lkpPenaltyTypeUi",
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
    resetLkpPenaltyTypeUi() {
      return initialState;
    },
  },
});

export const {
  toggleFilterPanel,
  setActiveFilter,
  setPendingStatusToggle,
  resetLkpPenaltyTypeUi,
} = lkpPenaltyTypeSlice.actions;

export default lkpPenaltyTypeSlice.reducer;
