import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface VehicleStatusUiState {
  isFilterPanelOpen: boolean;
  activeFilterId: string | null;
  pendingStatusToggleId: string | null;
}

const initialState: VehicleStatusUiState = {
  isFilterPanelOpen: false,
  activeFilterId: null,
  pendingStatusToggleId: null,
};

export const vehicleStatusSlice = createSlice({
  name: 'vehicleStatusUi',
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
    resetVehicleStatusUi() {
      return initialState;
    },
  },
});

export const {
  toggleFilterPanel,
  setActiveFilter,
  setPendingStatusToggle,
  resetVehicleStatusUi,
} = vehicleStatusSlice.actions;

export default vehicleStatusSlice.reducer;