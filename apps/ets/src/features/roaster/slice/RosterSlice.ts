// src/features/roster/slice/RosterSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  WeekDayCode,
  CancelShiftType,
  RosterUiState,
  ShiftTripType,
  SelectedScheduleRow,
} from "../types/Roster.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const todayStr = () => new Date().toISOString().slice(0, 10);
const weekLaterStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
};

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: RosterUiState = {
  selectedLocCode: null,
  selectedMemberEmpIds: [],
  selectedWeeklyOffDays: [],
  selectedPickupShiftId: "",
  selectedDropShiftId: "",
  fromDate: todayStr(),
  toDate: todayStr(),

  scheduleEmpId: 0,
  scheduleFromDate: todayStr(),
  scheduleToDate: weekLaterStr(),
  scheduleHasQueried: false,

  selectedScheduleRows: [],

  isCancelModalOpen: false,
  cancelShiftType: "BOTH",

  pageStatus: "idle",
  pageStatusMessage: "",

  tripType: "BOTH" as ShiftTripType,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

export const rosterSlice = createSlice({
  name: "rosterUi",
  initialState,
  reducers: {
    // ── Create Roster form ────────────────────────────────────────────────

    setLocCode(state, action: PayloadAction<number>) {
      state.selectedLocCode = action.payload;
      state.selectedMemberEmpIds = []; // reset members when office changes
      state.selectedPickupShiftId = "";
      state.selectedDropShiftId = "";
    },

    setFromDate(state, { payload }: PayloadAction<string>) {
      state.fromDate = payload;
    },
    setToDate(state, { payload }: PayloadAction<string>) {
      state.toDate = payload;
    },

    setPickupShift(state, { payload }: PayloadAction<string>) {
      state.selectedPickupShiftId = payload;
    },
    setDropShift(state, { payload }: PayloadAction<string>) {
      state.selectedDropShiftId = payload;
    },

    toggleWeeklyOffDay(state, { payload }: PayloadAction<WeekDayCode>) {
      const idx = state.selectedWeeklyOffDays.indexOf(payload);
      if (idx === -1) state.selectedWeeklyOffDays.push(payload);
      else state.selectedWeeklyOffDays.splice(idx, 1);
    },

    toggleMember(state, { payload }: PayloadAction<number>) {
      const idx = state.selectedMemberEmpIds.indexOf(payload);
      if (idx === -1) state.selectedMemberEmpIds.push(payload);
      else state.selectedMemberEmpIds.splice(idx, 1);
    },

    setAllMembers(state, { payload }: PayloadAction<number[]>) {
      state.selectedMemberEmpIds = payload;
    },
    clearAllMembers(state) {
      state.selectedMemberEmpIds = [];
    },

    // ── Employee Schedule filters ─────────────────────────────────────────

    setScheduleEmpId(state, { payload }: PayloadAction<number | string>) {
      state.scheduleEmpId = payload;
    },
    setScheduleFromDate(state, { payload }: PayloadAction<string>) {
      state.scheduleFromDate = payload;
    },
    setScheduleToDate(state, { payload }: PayloadAction<string>) {
      state.scheduleToDate = payload;
    },
    setScheduleHasQueried(state, { payload }: PayloadAction<boolean>) {
      state.scheduleHasQueried = payload;
    },

    // ── Cancel selection ──────────────────────────────────────────────────

    // toggleScheduleRow(
    //   state,
    //   {
    //     payload,
    //   }: PayloadAction<
    //     Pick<
    //       ScheduleEntry,
    //       "empCode" | "empid" | "locCode" | "scheduleDate" | "tripType"
    //     >
    //   >,
    // ) {
    //   const key = `${payload.empCode}-${payload.scheduleDate}`;
    //   const idx = state.selectedScheduleRows.findIndex(
    //     (r) => `${r.empCode}-${r.scheduleDate}` === key,
    //   );
    //   if (idx === -1) state.selectedScheduleRows.push(payload);
    //   else state.selectedScheduleRows.splice(idx, 1);
    // },

    toggleScheduleRow: (state, action) => {
      const { empCode, empid, locCode, scheduleDate, tripType } =
        action.payload;
      const idx = state.selectedScheduleRows.findIndex(
        (r) => r.empCode === empCode && r.scheduleDate === scheduleDate,
      );
      if (idx >= 0) {
        state.selectedScheduleRows.splice(idx, 1);
      } else {
        state.selectedScheduleRows.push({
          empCode,
          empid,
          locCode,
          scheduleDate,
          tripType,
        });
      }
    },

    clearScheduleSelection(state) {
      state.selectedScheduleRows = [];
    },

    // ── Cancel modal ──────────────────────────────────────────────────────

    openCancelModal(state) {
      state.isCancelModalOpen = true;
      state.cancelShiftType = "BOTH";
    },
    closeCancelModal(state) {
      state.isCancelModalOpen = false;
    },

    setCancelShiftType(state, { payload }: PayloadAction<CancelShiftType>) {
      state.cancelShiftType = payload;
    },

    // ── Page feedback ─────────────────────────────────────────────────────

    setPageSuccess(state, { payload }: PayloadAction<string>) {
      state.pageStatus = "success";
      state.pageStatusMessage = payload;
    },
    setPageError(state, { payload }: PayloadAction<string>) {
      state.pageStatus = "error";
      state.pageStatusMessage = payload;
    },
    clearPageStatus(state) {
      state.pageStatus = "idle";
      state.pageStatusMessage = "";
    },

    setTripType(state, { payload }: PayloadAction<ShiftTripType>) {
      state.tripType = payload;
      state.selectedPickupShiftId = "";
      state.selectedDropShiftId = "";
    },

    setAllScheduleRows: (
      state,
      action: PayloadAction<SelectedScheduleRow[]>,
    ) => {
      state.selectedScheduleRows = action.payload;
    },

    // ── Reset ─────────────────────────────────────────────────────────────

    resetCreateForm(state) {
      state.selectedLocCode = null;
      state.selectedMemberEmpIds = [];
      state.selectedWeeklyOffDays = [];
      state.selectedPickupShiftId = "";
      state.selectedDropShiftId = "";
      state.fromDate = todayStr();
      state.toDate = todayStr();
      state.pageStatus = "idle";
      state.pageStatusMessage = "";
      state.tripType = "BOTH";
    },

    resetRosterUi: () => initialState,
  },
});

export const {
  setLocCode,
  setFromDate,
  setToDate,
  setPickupShift,
  setDropShift,
  toggleWeeklyOffDay,
  toggleMember,
  setAllMembers,
  clearAllMembers,
  setScheduleEmpId,
  setScheduleFromDate,
  setScheduleToDate,
  setScheduleHasQueried,
  toggleScheduleRow,
  clearScheduleSelection,
  openCancelModal,
  closeCancelModal,
  setCancelShiftType,
  setPageSuccess,
  setPageError,
  clearPageStatus,
  resetCreateForm,
  resetRosterUi,
  setTripType,
  setAllScheduleRows,
} = rosterSlice.actions;

export default rosterSlice.reducer;
