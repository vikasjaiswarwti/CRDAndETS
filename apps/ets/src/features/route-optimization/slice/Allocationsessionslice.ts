import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

function generateSessionId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

type AllocationPhase =
  | "idle"
  | "vendor_grouping"
  | "vendor_assigning"
  | "vendor_complete"
  | "wizard"
  | "summary";

type TripVendorStatus = "pending" | "success" | "failed";
type TripAllocationStatus =
  | "pending"
  | "success"
  | "skipped"
  | "unavailable"
  | "conflict";

interface TripVendorAssignment {
  status: TripVendorStatus;
  vendorId: number | null;
  vendorName: string | null;
  error?: string;
  retryCount: number;
}

interface TripAllocation {
  vehicleId: number | null;
  driverId: number | null;
  vehicleStatus: TripAllocationStatus;
  driverStatus: TripAllocationStatus;
}

interface AllocationSessionState {
  sessionId: string | null;
  phase: AllocationPhase;
  selectedDsIds: number[];
  vendorGroups: Record<number, number[]>;
  vendorNames: Record<number, string>;
  unassignedDsIds: number[];
  vendorAssignmentStatus: Record<number, TripVendorAssignment>;
  allocationQueue: number[];
  currentTripIndex: number;
  allocationStatus: Record<number, TripAllocation>;
  skippedTrips: number[];
  failedTrips: number[];
  completedTrips: number[];
  isDirty: boolean;
}

const initialState: AllocationSessionState = {
  sessionId: null,
  phase: "idle",
  selectedDsIds: [],
  vendorGroups: {},
  vendorNames: {},
  unassignedDsIds: [],
  vendorAssignmentStatus: {},
  allocationQueue: [],
  currentTripIndex: 0,
  allocationStatus: {},
  skippedTrips: [],
  failedTrips: [],
  completedTrips: [],
  isDirty: false,
};

const allocationSessionSlice = createSlice({
  name: "allocationSession",
  initialState,
  reducers: {
    startSession(state, action: PayloadAction<number[]>) {
      state.sessionId = generateSessionId();
      state.phase = "vendor_grouping";
      state.selectedDsIds = action.payload;
      state.unassignedDsIds = [...action.payload];
      state.vendorGroups = {};
      state.vendorNames = {};
      state.vendorAssignmentStatus = {};
      state.allocationQueue = [];
      state.currentTripIndex = 0;
      state.allocationStatus = {};
      state.skippedTrips = [];
      state.failedTrips = [];
      state.completedTrips = [];
      state.isDirty = false;
    },

    assignTripToVendor(
      state,
      action: PayloadAction<{
        dsId: number;
        vendorId: number;
        vendorName: string;
      }>,
    ) {
      const { dsId, vendorId, vendorName } = action.payload;

      state.unassignedDsIds = state.unassignedDsIds.filter((id) => id !== dsId);

      for (const vid in state.vendorGroups) {
        const vIdNum = Number(vid);
        state.vendorGroups[vIdNum] = state.vendorGroups[vIdNum].filter(
          (id) => id !== dsId,
        );
        if (state.vendorGroups[vIdNum].length === 0) {
          delete state.vendorGroups[vIdNum];
        }
      }

      if (!state.vendorGroups[vendorId]) {
        state.vendorGroups[vendorId] = [];
      }
      state.vendorGroups[vendorId].push(dsId);
      state.vendorNames[vendorId] = vendorName;
      state.isDirty = true;
    },

    removeTripFromVendor(
      state,
      action: PayloadAction<{ dsId: number; vendorId: number }>,
    ) {
      const { dsId, vendorId } = action.payload;

      if (state.vendorGroups[vendorId]) {
        state.vendorGroups[vendorId] = state.vendorGroups[vendorId].filter(
          (id) => id !== dsId,
        );
        if (state.vendorGroups[vendorId].length === 0) {
          delete state.vendorGroups[vendorId];
        }
      }

      if (!state.unassignedDsIds.includes(dsId)) {
        state.unassignedDsIds.push(dsId);
      }

      state.isDirty = true;
    },

    setVendorAssignmentStatus(
      state,
      action: PayloadAction<{
        dsId: number;
        status: TripVendorStatus;
        vendorId?: number;
        vendorName?: string;
        error?: string;
      }>,
    ) {
      const { dsId, status, vendorId, vendorName, error } = action.payload;
      const existing = state.vendorAssignmentStatus[dsId];
      state.vendorAssignmentStatus[dsId] = {
        status,
        vendorId: vendorId ?? existing?.vendorId ?? null,
        vendorName: vendorName ?? existing?.vendorName ?? null,
        error,
        retryCount: existing
          ? existing.retryCount + (status === "failed" ? 1 : 0)
          : 0,
      };
    },

    setPhase(state, action: PayloadAction<AllocationPhase>) {
      state.phase = action.payload;
    },

    buildAllocationQueue(state) {
      const successfulDsIds: number[] = [];

      for (const dsId of state.selectedDsIds) {
        const assignment = state.vendorAssignmentStatus[dsId];
        if (assignment && assignment.status === "success") {
          successfulDsIds.push(dsId);
        }
      }

      state.allocationQueue = successfulDsIds;
      state.currentTripIndex = 0;
      state.phase = "wizard";

      for (const dsId of successfulDsIds) {
        if (!state.allocationStatus[dsId]) {
          state.allocationStatus[dsId] = {
            vehicleId: null,
            driverId: null,
            vehicleStatus: "pending",
            driverStatus: "pending",
          };
        }
      }
    },

    setVehicleAllocation(
      state,
      action: PayloadAction<{ dsId: number; vehicleId: number }>,
    ) {
      const { dsId, vehicleId } = action.payload;
      if (!state.allocationStatus[dsId]) {
        state.allocationStatus[dsId] = {
          vehicleId: null,
          driverId: null,
          vehicleStatus: "pending",
          driverStatus: "pending",
        };
      }
      state.allocationStatus[dsId].vehicleId = vehicleId;
    },

    setDriverAllocation(
      state,
      action: PayloadAction<{ dsId: number; driverId: number }>,
    ) {
      const { dsId, driverId } = action.payload;
      if (!state.allocationStatus[dsId]) {
        state.allocationStatus[dsId] = {
          vehicleId: null,
          driverId: null,
          vehicleStatus: "pending",
          driverStatus: "pending",
        };
      }
      state.allocationStatus[dsId].driverId = driverId;
    },

    setTripAllocationStatus(
      state,
      action: PayloadAction<{
        dsId: number;
        vehicleStatus?: TripAllocationStatus;
        driverStatus?: TripAllocationStatus;
      }>,
    ) {
      const { dsId, vehicleStatus, driverStatus } = action.payload;
      if (!state.allocationStatus[dsId]) {
        state.allocationStatus[dsId] = {
          vehicleId: null,
          driverId: null,
          vehicleStatus: "pending",
          driverStatus: "pending",
        };
      }
      if (vehicleStatus !== undefined) {
        state.allocationStatus[dsId].vehicleStatus = vehicleStatus;
      }
      if (driverStatus !== undefined) {
        state.allocationStatus[dsId].driverStatus = driverStatus;
      }
    },

    completeCurrentTrip(state) {
      const currentDsId = state.allocationQueue[state.currentTripIndex];
      if (currentDsId !== undefined) {
        if (!state.completedTrips.includes(currentDsId)) {
          state.completedTrips.push(currentDsId);
        }
        state.currentTripIndex += 1;
      }

      if (state.currentTripIndex >= state.allocationQueue.length) {
        state.phase = "summary";
      }
    },

    skipCurrentTrip(state) {
      const currentDsId = state.allocationQueue[state.currentTripIndex];
      if (currentDsId !== undefined) {
        if (!state.skippedTrips.includes(currentDsId)) {
          state.skippedTrips.push(currentDsId);
        }
        state.currentTripIndex += 1;
      }

      if (state.currentTripIndex >= state.allocationQueue.length) {
        state.phase = "summary";
      }
    },

    markTripFailed(state, action: PayloadAction<number>) {
      const dsId = action.payload;
      if (!state.failedTrips.includes(dsId)) {
        state.failedTrips.push(dsId);
      }
      state.currentTripIndex += 1;

      if (state.currentTripIndex >= state.allocationQueue.length) {
        state.phase = "summary";
      }
    },

    goToPrevTrip(state) {
      state.currentTripIndex = Math.max(0, state.currentTripIndex - 1);
    },

    rebuildQueueFromFailed(state) {
      state.allocationQueue = [...state.failedTrips];
      state.currentTripIndex = 0;
      state.failedTrips = [];
      state.phase = "wizard";

      for (const dsId of state.allocationQueue) {
        state.allocationStatus[dsId] = {
          vehicleId: null,
          driverId: null,
          vehicleStatus: "pending",
          driverStatus: "pending",
        };
      }
    },

    endSession() {
      return { ...initialState };
    },

    setIsDirty(state, action: PayloadAction<boolean>) {
      state.isDirty = action.payload;
    },
  },
});

export const {
  startSession,
  assignTripToVendor,
  removeTripFromVendor,
  setVendorAssignmentStatus,
  setPhase,
  buildAllocationQueue,
  setVehicleAllocation,
  setDriverAllocation,
  setTripAllocationStatus,
  completeCurrentTrip,
  skipCurrentTrip,
  markTripFailed,
  goToPrevTrip,
  rebuildQueueFromFailed,
  endSession,
  setIsDirty,
} = allocationSessionSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectCurrentDsId = (state: {
  allocationSession: AllocationSessionState;
}): number | null => {
  const { allocationQueue, currentTripIndex } = state.allocationSession;
  return allocationQueue[currentTripIndex] ?? null;
};

export const selectCurrentVendorId = (state: {
  allocationSession: AllocationSessionState;
}): number | null => {
  const currentDsId = selectCurrentDsId(state);
  if (currentDsId === null) return null;

  const { vendorGroups } = state.allocationSession;
  for (const vendorId in vendorGroups) {
    if (vendorGroups[Number(vendorId)].includes(currentDsId)) {
      return Number(vendorId);
    }
  }
  return null;
};

export const selectSessionStats = (state: {
  allocationSession: AllocationSessionState;
}): { completed: number; skipped: number; failed: number; total: number } => {
  const { completedTrips, skippedTrips, failedTrips, allocationQueue } =
    state.allocationSession;
  return {
    completed: completedTrips.length,
    skipped: skippedTrips.length,
    failed: failedTrips.length,
    total: allocationQueue.length,
  };
};

export default allocationSessionSlice.reducer;
