// FILE 3 — slice/vehicleSlice.ts

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type ActiveTab = "pending" | "approved";
interface VehicleUiState {
  activeTab: ActiveTab;
  isFilterPanelOpen: boolean;
  activeFilterId: string | null;
  pendingStatusToggleId: string | null;
}

const initialState: VehicleUiState = {
  activeTab: "pending",
  isFilterPanelOpen: false,
  activeFilterId: null,
  pendingStatusToggleId: null,
};

export const vehicleSlice = createSlice({
  name: 'vehicleUi',
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
    resetVehicleUi() {
      return initialState;
    },
  },
});

export const {
    setActiveTab,
  toggleFilterPanel,
  setActiveFilter,
  setPendingStatusToggle,
  resetVehicleUi,
} = vehicleSlice.actions;

export default vehicleSlice.reducer;