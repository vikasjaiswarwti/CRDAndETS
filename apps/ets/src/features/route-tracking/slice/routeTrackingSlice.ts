import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const ALL_EVENT_KEYS = [
  "actualSignIn",
  "actualSignOut",
  // "calls", 
  "noShow",
  "gpsLoss",
  "gpsLosss",
  "sos",
  "gpsLosss",
  "overspeed",
  "vehicleStop",
  "networkLoss",
];

interface RouteTrackingUiState {
  isReplayPlaying: boolean;
  selectedEmployee: number | null;
  tripClose: boolean;
  noShow: boolean;
  boardDeBoard: boolean;
  stopReach: boolean;
  selectedEvents: string[];
  actualSignIn: boolean;
  actualSignOut: boolean;
}

const initialState: RouteTrackingUiState = {
  isReplayPlaying: false,
  selectedEmployee: null,
  tripClose: false,
  boardDeBoard: false,
  stopReach: false,
  noShow: false,
  selectedEvents: [],
  actualSignIn: false,
  actualSignOut: false,
};

export const routeTrackingSlice = createSlice({
  name: "routeTrackingUi",
  initialState,
  reducers: {
    toggleReplay(state) { state.isReplayPlaying = !state.isReplayPlaying; },
    setReplay(state, action: PayloadAction<boolean>) { state.isReplayPlaying = action.payload; },

    // ── new ──────────────────────────────────────────────────────────
    toggleEvent(state, action: PayloadAction<string>) {
      const key = action.payload;
      const idx = state.selectedEvents.indexOf(key);
      if (idx === -1) state.selectedEvents.push(key);
      else state.selectedEvents.splice(idx, 1);
    },
    // setAllEvents(state, action: PayloadAction<boolean>) {
    //   state.selectedEvents = action.payload ? [...ALL_EVENT_KEYS] : [];
    // },
    setAllEvents(state, action: PayloadAction<boolean>) {
      state.selectedEvents = action.payload
        ? ALL_EVENT_KEYS.filter(key => key !== "gpsLoss")
        : [];
    },
    addEvent(state, action: PayloadAction<string>) {
      if (!state.selectedEvents.includes(action.payload)) {
        state.selectedEvents.push(action.payload);
      }
    },
    removeEvent(state, action: PayloadAction<string>) {
      state.selectedEvents = state.selectedEvents.filter(
        (key) => key !== action.payload
      );
    },
    setTripClose(state, action) { state.tripClose = action.payload; },
    setBoardDeboardClose(state, action) { state.boardDeBoard = action.payload; },
    setNoShow(state, action) { state.noShow = action.payload; },
    setStopReach(state, action) { state.stopReach = action.payload; },
    // ─────────────────────────────────────────────────────────────────
    // Set selected employee
    setSelectedEmployee(state, action: PayloadAction<number>) {
      state.selectedEmployee =
        state.selectedEmployee === action.payload ? null : action.payload;
    },

    // Optional: clear selected employee
    clearSelectedEmployee(state) {
      state.selectedEmployee = null;
    },
    setActualSignIn(state, action) { state.actualSignIn = action.payload; },
    setActualSignOut(state, action) { state.actualSignOut = action.payload; },

    resetRouteTrackingUi() { return initialState; },
  },
});

export const {
  toggleReplay,
  setReplay,
  toggleEvent,
  setAllEvents,
  resetRouteTrackingUi,
  addEvent,
  removeEvent,
  setTripClose,
  setNoShow,
  setBoardDeboardClose,
  setSelectedEmployee,
  clearSelectedEmployee,
  setActualSignIn,
  setActualSignOut,
  setStopReach
} =
  routeTrackingSlice.actions;
export default routeTrackingSlice.reducer;