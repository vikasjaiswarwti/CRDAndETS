// src/features/routeManagement/slice/Routemanagementslice.ts
//
// Owns UI-only state: filters.
// Server state (stats, rows) lives in RTK Query cache — NOT here.

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RouteManagementFilterState } from "../types/RouteTypes";
import dayjs from "dayjs";

interface RouteMakerParams {
  locCode: number;
  shiftId: number;
  tripType: number;
  routeDate: string;
  shiftTime?: string;
}

interface RouteManagementUiState {
  filters: RouteManagementFilterState;
  routeMakerParams: RouteMakerParams | null;
}

// ── sessionStorage helpers (keep outside the slice) ──────────────────────────
const ROUTE_MAKER_KEY = "__routeMakerParams";

function loadRouteMakerParams(): RouteMakerParams | null {
  try {
    const raw = sessionStorage.getItem(ROUTE_MAKER_KEY);
    return raw ? (JSON.parse(raw) as RouteMakerParams) : null;
  } catch {
    return null;
  }
}

function saveRouteMakerParams(params: RouteMakerParams | null): void {
  try {
    if (params) sessionStorage.setItem(ROUTE_MAKER_KEY, JSON.stringify(params));
    else sessionStorage.removeItem(ROUTE_MAKER_KEY);
  } catch {
    /* quota exceeded — silent fail */
  }
}

const initialState: RouteManagementUiState = {
  filters: {
    officeId: "", // "" = no office selected → skip=true
    date: dayjs().format("YYYY-MM-DD"), // today
    shiftType: 0, // 0 = All (both pickup + drop)
  },

  routeMakerParams: loadRouteMakerParams(), // ← survives refresh
};

export const routeManagementSlice = createSlice({
  name: "routeManagementUi",
  initialState,
  reducers: {
    setOffice(state, action: PayloadAction<string>) {
      state.filters.officeId = action.payload;
    },
    setDate(state, action: PayloadAction<string>) {
      state.filters.date = action.payload;
    },
    // shiftType is always a number: 0 | 1 | 2
    setShiftType(state, action: PayloadAction<number>) {
      state.filters.shiftType = action.payload;
    },
    resetFilters(state) {
      state.filters = initialState.filters;
    },

    // setRouteMakerParams: (
    //   state,
    //   action: PayloadAction<{
    //     locCode: number;
    //     shiftId: number;
    //     tripType: number;
    //     routeDate: string;
    //   }>,
    // ) => {
    //   state.routeMakerParams = action.payload;
    // },
    // clearRouteMakerParams: (state) => {
    //   state.routeMakerParams = null;
    // },
    setRouteMakerParams(state, action: PayloadAction<RouteMakerParams>) {
      state.routeMakerParams = action.payload;
      saveRouteMakerParams(action.payload); // ← keeps sessionStorage in sync
    },
    clearRouteMakerParams(state) {
      state.routeMakerParams = null;
      saveRouteMakerParams(null); // ← cleans up sessionStorage
    },
  },
});

export const {
  setOffice,
  setDate,
  setShiftType,
  resetFilters,
  setRouteMakerParams,
  clearRouteMakerParams,
} = routeManagementSlice.actions;

export default routeManagementSlice.reducer;
