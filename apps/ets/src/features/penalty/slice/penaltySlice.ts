import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface PenaltyUiState {
  isFilterPanelOpen: boolean;
  pendingStatusToggleId: number | null;
}

const initialState: PenaltyUiState = {
  isFilterPanelOpen: false,
  pendingStatusToggleId: null,
};

export const penaltySlice = createSlice({
  name: 'penaltyUi',
  initialState,
  reducers: {
    toggleFilterPanel(state) {
      state.isFilterPanelOpen = !state.isFilterPanelOpen;
    },
    setPendingStatusToggle(state, action: PayloadAction<number | null>) {
      state.pendingStatusToggleId = action.payload;
    },
    resetPenaltyUi() {
      return initialState;
    },
  },
});

export const { toggleFilterPanel, setPendingStatusToggle, resetPenaltyUi } =
  penaltySlice.actions;

export default penaltySlice.reducer;
