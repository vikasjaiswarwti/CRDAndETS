import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// ─── UI State ─────────────────────────────────────────────────────────────────
interface EhsChecksUiState {
  isFilterPanelOpen: boolean;
  activeFilterId: string | null;
  pendingStatusToggleId: string | null;
}

const initialState: EhsChecksUiState = {
  isFilterPanelOpen: false,
  activeFilterId: null,
  pendingStatusToggleId: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────
export const ehsChecksSlice = createSlice({
  name: 'ehsChecksUi',
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
    resetEhsChecksUi() {
      return initialState;
    },
  },
});

export const {
  toggleFilterPanel,
  setActiveFilter,
  setPendingStatusToggle,
  resetEhsChecksUi,
} = ehsChecksSlice.actions;

export default ehsChecksSlice.reducer;