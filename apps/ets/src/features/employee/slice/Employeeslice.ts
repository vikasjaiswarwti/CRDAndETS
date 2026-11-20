import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type ActiveTab = "pending" | "approved" | "deactivated" | "manager";

interface EmployeeUiState {
  activeTab: ActiveTab;
  isFilterPanelOpen: boolean;
  pendingApproveId: string | null;
  pendingRejectId: string | null;
}

const initialState: EmployeeUiState = {
  activeTab: "pending",
  isFilterPanelOpen: false,
  pendingApproveId: null,
  pendingRejectId: null,
};

export const employeeSlice = createSlice({
  name: "employeeUi",
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<ActiveTab>) {
      state.activeTab = action.payload;
    },
    toggleFilterPanel(state) {
      state.isFilterPanelOpen = !state.isFilterPanelOpen;
    },
    setPendingApprove(state, action: PayloadAction<string | null>) {
      state.pendingApproveId = action.payload;
    },
    setPendingReject(state, action: PayloadAction<string | null>) {
      state.pendingRejectId = action.payload;
    },
    resetEmployeeUi() {
      return initialState;
    },
  },
});

export const {
  setActiveTab,
  toggleFilterPanel,
  setPendingApprove,
  setPendingReject,
  resetEmployeeUi,
} = employeeSlice.actions;

export default employeeSlice.reducer;
