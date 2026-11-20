import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface LkpFeedbackTypeUiState {
  isFilterPanelOpen: boolean;
  activeFilterId: string | null;
  pendingStatusToggleId: string | null;
}

const initialState: LkpFeedbackTypeUiState = {
  isFilterPanelOpen: false,
  activeFilterId: null,
  pendingStatusToggleId: null,
};

export const lkpFeedbackTypeSlice = createSlice({
  name: "lkpFeedbackTypeUi",
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
    resetLkpFeedbackTypeUi() {
      return initialState;
    },
  },
});

export const {
  toggleFilterPanel,
  setActiveFilter,
  setPendingStatusToggle,
  resetLkpFeedbackTypeUi,
} = lkpFeedbackTypeSlice.actions;

export default lkpFeedbackTypeSlice.reducer;
