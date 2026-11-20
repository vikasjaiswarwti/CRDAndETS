import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface SpecialCaseUiState {
    isFilterPanelOpen: boolean;
    activeFilterId: string | null;
    pendingStatusToggleId: string | null;
}

const initialState: SpecialCaseUiState = {
    isFilterPanelOpen: false,
    activeFilterId: null,
    pendingStatusToggleId: null,
};

export const userSuperVisorSlice = createSlice({
    name: 'specialCaseUi',
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
        resetSpecialCaseUi() {
            return initialState;
        },
    },
});

export const {
    toggleFilterPanel,
    setActiveFilter,
    setPendingStatusToggle,
    resetSpecialCaseUi,
} = userSuperVisorSlice.actions;

export default userSuperVisorSlice.reducer;