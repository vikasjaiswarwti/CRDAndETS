import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  IndividualRosterUiState,
  RosterType,
  WeekDayAbbr,
  ManagedEmployee,
  UserRosterLocation,
  IndividualScheduleEntry,
} from "../types/Individualroster.types";
import type { CancelShiftType } from "../types/Roster.types";

const todayIso = (): string => new Date().toISOString().slice(0, 10);
const weekLaterIso = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
};

const initialState: IndividualRosterUiState = {
  userEmpId: null,
  userLocCode: null,
  managedEmployees: [],
  locations: [],

  rosterType: "LOGIN",
  fromDate: todayIso(),
  toDate: todayIso(),
  selectedLocCode: null,
  selectedShiftId: "",
  selectedWeeklyOffDays: [],
  targetEmpId: null,

  viewFromDate: todayIso(),
  viewToDate: weekLaterIso(),
  hasQueried: false,

  isCancelModalOpen: false,
  cancellingEntry: null,
  cancelShiftType: "BOTH",
};

export const individualRosterSlice = createSlice({
  name: "individualRosterUi",
  initialState,
  reducers: {
    hydrateFromApi(
      state,
      {
        payload,
      }: PayloadAction<{
        empId: number;
        locCode: number;
        employees: ManagedEmployee[];
        locations: UserRosterLocation[];
      }>,
    ) {
      state.userEmpId = payload.empId;
      state.userLocCode = payload.locCode;
      state.managedEmployees = payload.employees;
      state.locations = payload.locations;
      if (state.selectedLocCode === null)
        state.selectedLocCode = payload.locCode;
      if (state.targetEmpId === null) state.targetEmpId = payload.empId;
    },

    setRosterType(state, { payload }: PayloadAction<RosterType>) {
      state.rosterType = payload;
      state.selectedShiftId = "";
    },

    setFromDate(state, { payload }: PayloadAction<string>) {
      state.fromDate = payload;
      if (state.toDate < payload) state.toDate = payload;
    },

    setToDate(state, { payload }: PayloadAction<string>) {
      state.toDate = payload;
    },

    setSelectedLocCode(state, { payload }: PayloadAction<number | null>) {
      state.selectedLocCode = payload;
      state.selectedShiftId = "";
    },

    setSelectedShiftId(state, { payload }: PayloadAction<string>) {
      state.selectedShiftId = payload;
    },

    toggleWeeklyOffDay(state, { payload }: PayloadAction<WeekDayAbbr>) {
      const idx = state.selectedWeeklyOffDays.indexOf(payload);
      if (idx === -1) state.selectedWeeklyOffDays.push(payload);
      else state.selectedWeeklyOffDays.splice(idx, 1);
    },

    setTargetEmpId(state, { payload }: PayloadAction<number>) {
      state.targetEmpId = payload;
      state.selectedShiftId = "";
    },

    setViewFromDate(state, { payload }: PayloadAction<string>) {
      state.viewFromDate = payload;
    },

    setViewToDate(state, { payload }: PayloadAction<string>) {
      state.viewToDate = payload;
    },

    setHasQueried(state, { payload }: PayloadAction<boolean>) {
      state.hasQueried = payload;
    },

    openCancelModal(
      state,
      { payload }: PayloadAction<IndividualScheduleEntry>,
    ) {
      state.isCancelModalOpen = true;
      state.cancellingEntry = payload;
      state.cancelShiftType = "BOTH";
    },

    closeCancelModal(state) {
      state.isCancelModalOpen = false;
      state.cancellingEntry = null;
    },

    setCancelShiftType(state, { payload }: PayloadAction<CancelShiftType>) {
      state.cancelShiftType = payload;
    },

    resetForm(state) {
      state.rosterType = "LOGIN";
      state.fromDate = todayIso();
      state.toDate = todayIso();
      state.selectedShiftId = "";
      state.selectedWeeklyOffDays = [];
    },

    resetAll: () => initialState,
  },
});

export const {
  hydrateFromApi,
  setRosterType,
  setFromDate,
  setToDate,
  setSelectedLocCode,
  setSelectedShiftId,
  toggleWeeklyOffDay,
  setTargetEmpId,
  setViewFromDate,
  setViewToDate,
  setHasQueried,
  openCancelModal,
  closeCancelModal,
  setCancelShiftType,
  resetForm,
  resetAll,
} = individualRosterSlice.actions;

export default individualRosterSlice.reducer;
