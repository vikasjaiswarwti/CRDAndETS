import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type ActiveTab = "pending" | "approved";

interface DriverUiState {
  activeTab: ActiveTab;
  isFilterPanelOpen: boolean;
  activeFilterId: string | null;
  pendingStatusToggleId: string | null;
}

const initialState: DriverUiState = {
  activeTab: "pending",
  isFilterPanelOpen: false,
  activeFilterId: null,
  pendingStatusToggleId: null,
};

export const driverSlice = createSlice({
  name: 'driverUi',
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<ActiveTab>) {
      state.activeTab = action.payload;
    },
    toggleFilterPanel(state) {
      state.isFilterPanelOpen = !state.isFilterPanelOpen;
    },
    setActiveFilter(state, action: PayloadAction<string | null>) {
      state.activeFilterId = action.payload;
    },
    setPendingStatusToggle(state, action: PayloadAction<string | null>) {
      state.pendingStatusToggleId = action.payload;
    },
    resetDriverUi() {
      return initialState;
    },
  },
});

export const {
  setActiveTab,
  toggleFilterPanel,
  setActiveFilter,
  setPendingStatusToggle,
  resetDriverUi,
} = driverSlice.actions;

export default driverSlice.reducer;