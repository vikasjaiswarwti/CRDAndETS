// import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// interface ProgressTripsState {
//     selectedTripIds: number[];
// }

// const initialState: ProgressTripsState = {
//     selectedTripIds: [],
// };

// const progressTripsSlice = createSlice({
//     name: "progressTrips",
//     initialState,
//     reducers: {
//         setSelectedTripIds: (state, action: PayloadAction<number[]>) => {
//             state.selectedTripIds = action.payload;
//         },
//         clearSelectedTripIds: (state) => {
//             state.selectedTripIds = [];
//         },
//     },
// });

// export const { setSelectedTripIds, clearSelectedTripIds } = progressTripsSlice.actions;
// export default progressTripsSlice.reducer;
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const STORAGE_KEY = "progressTrips_selectedTripIds";

// ── Load persisted IDs from localStorage on app start ───────────────
const loadSelectedIds = (): number[] => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

// ── Save to localStorage on every change ────────────────────────────
const saveSelectedIds = (ids: number[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
        // localStorage full or unavailable — fail silently
    }
};

interface ProgressTripsState {
    selectedTripIds: number[];
}

const initialState: ProgressTripsState = {
    selectedTripIds: loadSelectedIds(), // ✅ rehydrate on load
};

const progressTripsSlice = createSlice({
    name: "progressTrips",
    initialState,
    reducers: {
        setSelectedTripIds: (state, action: PayloadAction<number[]>) => {
            state.selectedTripIds = action.payload;
            saveSelectedIds(action.payload); // ✅ persist on every set
        },
        clearSelectedTripIds: (state) => {
            state.selectedTripIds = [];
            saveSelectedIds([]);            // ✅ clear localStorage too
        },
    },
});

export const { setSelectedTripIds, clearSelectedTripIds } = progressTripsSlice.actions;
export default progressTripsSlice.reducer;