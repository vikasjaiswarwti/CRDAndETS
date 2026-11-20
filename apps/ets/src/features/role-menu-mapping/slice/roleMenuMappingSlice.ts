// src/features/role-menu-mapping/slice/roleMenuMappingSlice.ts

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface RoleMenuMappingUiState {
    isFilterPanelOpen: boolean;
    activeFilterId: string | null;
    pendingStatusToggleId: string | null;
}

const initialState: RoleMenuMappingUiState = {
    isFilterPanelOpen: false,
    activeFilterId: null,
    pendingStatusToggleId: null,
};

export const roleMenuMappingSlice = createSlice({
    name: 'roleMenuMappingUi',
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
        resetRoleMenuMappingUi() {
            return initialState;
        },
    },
});

export const {
    toggleFilterPanel,
    setActiveFilter,
    setPendingStatusToggle,
    resetRoleMenuMappingUi,
} = roleMenuMappingSlice.actions;

export default roleMenuMappingSlice.reducer;