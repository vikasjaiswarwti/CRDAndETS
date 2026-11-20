// src/features/route-maker/store/pinnedRoutesSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const MAX_SESSIONS = 5; // prune oldest beyond this
const EMPTY_PINNED_IDS: number[] = [];

interface PinnedRoutesState {
  // key = "locCode-shiftId-tripType-routeDate"
  bySession: Record<string, number[]>;
  sessionOrder: string[]; // LRU: newest last
}

const initialState: PinnedRoutesState = {
  bySession: {},
  sessionOrder: [],
};

function makeKey(p: {
  locCode: number;
  shiftId: number;
  tripType: number;
  routeDate: string;
}) {
  return `${p.locCode}-${p.shiftId}-${p.tripType}-${p.routeDate}`;
}

const pinnedRoutesSlice = createSlice({
  name: "pinnedRoutes",
  initialState,
  reducers: {
    togglePin(
      state,
      action: PayloadAction<{
        locCode: number;
        shiftId: number;
        tripType: number;
        routeDate: string;
        vehicleId: number;
      }>,
    ) {
      const { vehicleId, ...params } = action.payload;
      const key = makeKey(params);

      // ensure session exists
      if (!state.bySession[key]) {
        state.bySession[key] = [];
        state.sessionOrder.push(key);
        // prune oldest sessions beyond MAX_SESSIONS
        while (state.sessionOrder.length > MAX_SESSIONS) {
          const oldest = state.sessionOrder.shift()!;
          delete state.bySession[oldest];
        }
      } else {
        // bump to end (most recent)
        state.sessionOrder = [
          ...state.sessionOrder.filter((k) => k !== key),
          key,
        ];
      }

      const pinned = state.bySession[key];
      const idx = pinned.indexOf(vehicleId);
      if (idx === -1) {
        pinned.push(vehicleId);
      } else {
        pinned.splice(idx, 1);
      }
    },

    clearPinsForSession(
      state,
      action: PayloadAction<{
        locCode: number;
        shiftId: number;
        tripType: number;
        routeDate: string;
      }>,
    ) {
      const key = makeKey(action.payload);
      delete state.bySession[key];
      state.sessionOrder = state.sessionOrder.filter((k) => k !== key);
    },
  },
});

export const { togglePin, clearPinsForSession } = pinnedRoutesSlice.actions;
export default pinnedRoutesSlice.reducer;

// Selector
export function selectPinnedIds(
  state: { pinnedRoutes: PinnedRoutesState },
  params: {
    locCode: number;
    shiftId: number;
    tripType: number;
    routeDate: string;
  },
): number[] {
  return state.pinnedRoutes.bySession[makeKey(params)] ?? EMPTY_PINNED_IDS;
}
