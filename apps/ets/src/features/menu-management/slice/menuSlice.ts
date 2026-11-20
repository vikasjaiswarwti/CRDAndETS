import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface MenuUiState {
  isFilterPanelOpen: boolean;
  activeParentFilter: string | null;
  pendingStatusToggleId: string | null;
}

const initialState: MenuUiState = {
  isFilterPanelOpen: false,
  activeParentFilter: null,
  pendingStatusToggleId: null,
};

export const menuSlice = createSlice({
  name: "menuUi",
  initialState,
  reducers: {
    toggleFilterPanel(state) {
      state.isFilterPanelOpen = !state.isFilterPanelOpen;
    },
    setActiveParentFilter(state, action: PayloadAction<string | null>) {
      state.activeParentFilter = action.payload;
    },
    setPendingStatusToggle(state, action: PayloadAction<string | null>) {
      state.pendingStatusToggleId = action.payload;
    },
    resetMenuUi() {
      return initialState;
    },
  },
});

export const {
  toggleFilterPanel,
  setActiveParentFilter,
  setPendingStatusToggle,
  resetMenuUi,
} = menuSlice.actions;

export default menuSlice.reducer;
