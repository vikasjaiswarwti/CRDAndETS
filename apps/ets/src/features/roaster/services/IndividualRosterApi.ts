// src/features/individualRoster/services/IndividualRosterApi.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  UserDetailsApiRow,
  UserDetailsResult,
  UserFilterDataResult,
  IndividualUpdateSchedulesDto,
  IndividualViewParams,
  IndividualScheduleEntry,
  UserFilterDataParams,
  UpdateScheduleResponse,
} from "../types/Individualroster.types";
// import type { CancelScheduleDto } from "../types/Roster.types";

function parseEnvelope<T>(rows: UserDetailsApiRow[]): T {
  const first = rows?.[0];
  if (!first) throw new Error("Empty API response");
  if (first.errorCode !== 0) throw new Error(first.dB_Response || "API error");
  try {
    return JSON.parse(first.result) as T;
  } catch {
    throw new Error("Failed to parse API result JSON");
  }
}

const TAG = {
  USER: "IndvUser",
  SHIFTS: "IndvShifts",
  SCHEDULE: "IndvSchedule",
  WEEKLY_OFF: "IndvWeeklyOff",
} as const;

// ─── Weekly off types ─────────────────────────────────────────────────────────

export interface WeeklyOffPayload {
  WeekOff: string;
}

export interface WeeklyOffResult {
  WeekOff: string;
}

// ─── AppControlSettings ───────────────────────────────────────────────────────

export interface AppControlSettings {
  adhocRequestEnabledForUser: boolean;
  boardDebaordEnabledForUser: boolean;
  hybridScheduleEnabled: boolean;
  isScheduleFillForLoginAndLogoutBoth: boolean;
  isBoardDeBoardOTPSameOrDifferent: boolean;
  isCancelTripByUserAfterTAT: boolean;
  isCancelScheduleByUserAfterTAT: boolean;
}

// ─── Schedule Homepage types ──────────────────────────────────────────────────

export interface ScheduleHomepageEntry {
  Empid: number;
  EmployeeID: string;
  UserName: string;
  LoginScheduleDate: string;
  LogoutScheduleDate: string;
  LoginShiftTime: string;
  LogoutShiftTime: string;
  TripStatusName: string;
  UserAddress: string;
  OfficeAddress: string;
  LocCode: number;
  LoginCancelled: string; // "Cancelled" | ""
  LogoutCancelled: string; // "Cancelled" | ""
  LoginNoshow: string; // "Noshow" | ""
  LogoutNoshow: string; // "Noshow" | ""
  ButtonUiConfig: {
    cancelSchedulePickupButtonShow: boolean;
    cancelScheduleDropButtonShow: boolean;
    cancelSchedulePickupNoShowButtonShow: boolean;
    cancelScheduleDropNoShowButtonShow: boolean;
    EditSchedulePickupButtonShow: boolean;
    EditScheduleDropButtonShow: boolean;
  };
  // synthetic key added by transformResponse
  id: string;
}

export interface TatPopupButton {
  id: string;
  text: string;
  action: string;
  order?: number;
}

export interface TatPopup {
  popupId: string;
  icon: string;
  title: string;
  message: string;
  buttons: TatPopupButton[];
}

// ─────────────────────────────────────────────────────────────────────────────

export const individualRosterApi = createApi({
  reducerPath: "individualRosterApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [TAG.USER, TAG.SHIFTS, TAG.SCHEDULE, TAG.WEEKLY_OFF],

  endpoints: (builder) => ({
    // ── GET /api/v1/TransRoster/UserDetailsForRoster ──────────────────────
    getUserDetailsForRoster: builder.query<UserDetailsResult, void>({
      query: () => ({ url: "/api/v1/TransRoster/UserDetailsForRoster" }),
      transformResponse: (res: UserDetailsApiRow[]) =>
        parseEnvelope<UserDetailsResult>(res),
      providesTags: [{ type: TAG.USER, id: "SELF" }],
    }),

    // ── GET /api/v1/TransRoster/GetUserFilterData ─────────────────────────
    getUserFilterData: builder.query<
      UserFilterDataResult,
      UserFilterDataParams
    >({
      query: ({ LocCode, EmpId }) => ({
        url: "/api/v1/TransRoster/GetUserFilterData",
        params: { LocCode, EmpId },
      }),
      transformResponse: (res: UserDetailsApiRow[]) =>
        parseEnvelope<UserFilterDataResult>(res),
      providesTags: [{ type: TAG.SHIFTS, id: "SELF" }],
    }),

    // ── POST /api/v1/MstWeeklyOff/APIMstWeeklyOff ────────────────────────
    getWeeklyOff: builder.query<WeeklyOffResult, void>({
      query: () => ({
        url: "/api/v1/MstWeeklyOff/APIMstWeeklyOff",
        method: "POST",
        body: { WeekOff: "" },
      }),
      transformResponse: (res: unknown): WeeklyOffResult => {
        const envelope = res as {
          result?: { weekOff?: string }[];
          isSuccess?: boolean;
        };
        if (envelope?.result && Array.isArray(envelope.result)) {
          return { WeekOff: envelope.result[0]?.weekOff ?? "" };
        }
        if (Array.isArray(res)) {
          return { WeekOff: (res as { weekOff?: string }[])[0]?.weekOff ?? "" };
        }
        return { WeekOff: "" };
      },
      providesTags: [{ type: TAG.WEEKLY_OFF, id: "SELF" }],
    }),

    updateWeeklyOff: builder.mutation<unknown, WeeklyOffPayload>({
      query: (body) => ({
        url: "/api/v1/MstWeeklyOff/APIMstWeeklyOff",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: TAG.WEEKLY_OFF, id: "SELF" }],
    }),

    // ── POST /api/v1/TransRoster/UpdateSchedules ──────────────────────────
    updateIndividualSchedule: builder.mutation<
      UpdateScheduleResponse,
      IndividualUpdateSchedulesDto
    >({
      query: (body) => ({
        url: "/api/v1/TransRoster/UpdateSchedules",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: TAG.SCHEDULE, id: "LIST" }],
    }),

    // ── GET /api/v1/TransRoster/ViewSchedules ─────────────────────────────
    viewIndividualSchedule: builder.query<
      IndividualScheduleEntry[],
      IndividualViewParams
    >({
      query: ({ empId, dateFrom, dateTo }) => ({
        url: "/api/v1/TransRoster/ViewSchedules",
        params: { empId, dateFrom, dateTo },
      }),
      transformResponse: (
        res: IndividualScheduleEntry[] | { data?: IndividualScheduleEntry[] },
      ) => {
        const raw = Array.isArray(res) ? res : (res.data ?? []);
        return raw.map((entry, idx) => ({
          ...entry,
          empCode: entry.empCode ?? String(entry.empid ?? idx),
          id: `indv-${entry.empid ?? idx}-${entry.scheduleDate}-${idx}`,
        }));
      },
      providesTags: [{ type: TAG.SCHEDULE, id: "LIST" }],
    }),

    // ── POST /api/v1/TransRoster/CancelSchedules ──────────────────────────
    cancelIndividualSchedule: builder.mutation<unknown, unknown>({
      query: (body) => ({
        url: "/api/v1/TransRoster/CancelSchedules",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: TAG.SCHEDULE, id: "LIST" }],
    }),

    // ── GET /api/v1/UserApp/GetScheduleHomePage ───────────────────────────
    // Returns the logged-in user's upcoming schedule with per-row UI config.
    // No params — the API returns a self-determined date range.
    getScheduleHomePage: builder.query<ScheduleHomepageEntry[], void>({
      query: () => ({ url: "/api/v1/UserApp/GetScheduleHomePage" }),
      transformResponse: (res: any) => {
        // Response: [{ errorCode, dB_Response, result: "<JSON string>" }]
        const first = Array.isArray(res) ? res[0] : res;
        if (!first || first.errorCode !== 0) return [];
        let raw: any[] = [];
        try {
          raw =
            typeof first.result === "string"
              ? JSON.parse(first.result)
              : (first.result ?? []);
        } catch {
          raw = [];
        }
        return raw.map((entry: any, idx: number) => ({
          ...entry,
          id: `hp-${entry.Empid}-${entry.LoginScheduleDate}-${idx}`,
        }));
      },
      providesTags: [{ type: TAG.SCHEDULE, id: "LIST" }],
    }),

    // ── GET /api/v1/AppControl/GetAppControlSettingsByLocCode/{locCode} ────
    // Returns app-level flags per location, including isCancelScheduleByUserAfterTAT.
    getAppControlSettingsByLocCode: builder.query<AppControlSettings, number>({
      query: (locCode) => ({
        url: `/api/v1/AppControl/GetAppControlSettingsByLocCode/${locCode}`,
      }),
      // Response is a flat object — no envelope
    }),

    // ── POST /api/v1/TransRoster/CancelScheduleConfirmation ───────────────
    // TAT check — always call before cancelling.
    // Returns dynamic popup if TAT applies, empty popups[] otherwise.
    cancelScheduleConfirmation: builder.mutation<
      { popups: TatPopup[] },
      { LocCode: number; Empid: string; ScheduleDate: string; TripType: string }
    >({
      query: (body) => ({
        url: "/api/v1/TransRoster/CancelScheduleConfirmation",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => {
        try {
          const raw = res?.result?.[0]?.result;
          const popups =
            typeof raw === "string" ? JSON.parse(raw) : (raw ?? []);
          return { popups };
        } catch {
          return { popups: [] };
        }
      },
    }),

    // ── POST /api/v1/TransRoster/CancelScheduleBulkConfirmation ────────────
    // TAT check for bulk cancellation over a date range.
    // Returns dynamic popup if TAT applies, empty popups[] otherwise.
    cancelScheduleBulkConfirmation: builder.mutation<
      { popups: TatPopup[] },
      { LocCode: number; EmpId: number; FromDate: string; ToDate: string; TripType: number }
    >({
      query: (body) => ({
        url: "/api/v1/TransRoster/CancelScheduleBulkConfirmation",
        method: "POST",
        body,
      }),
      // Response shape: [{ errorCode, dB_Response, result: "<JSON string — single popup object>" }]
      transformResponse: (res: any) => {
        try {
          const first = Array.isArray(res) ? res[0] : (res?.result?.[0] ?? res);
          if (!first || first.errorCode !== 0) return { popups: [] };
          const raw = first.result;
          const parsed = typeof raw === "string" ? JSON.parse(raw) : (raw ?? []);
          const popups = Array.isArray(parsed) ? parsed : [parsed];
          return { popups };
        } catch {
          return { popups: [] };
        }
      },
    }),

    // ── POST /api/v1/TransRoster/CancelScheduleBulk ────────────────────────
    cancelScheduleBulk: builder.mutation<
      { success: boolean; message: string },
      {
        LocCode: number;
        EmpId: number;
        FromDate: string;
        ToDate: string;
        TripType: number;
        ScheduleCancelVersion: string;
      }
    >({
      query: (body) => ({
        url: "/api/v1/TransRoster/CancelScheduleBulk",
        method: "POST",
        body,
      }),
      // Response shape: [{ errorCode, dB_Response }]
      transformResponse: (res: any) => {
        const first = Array.isArray(res) ? res[0] : res;
        return {
          success: first?.errorCode === 0,
          message: first?.dB_Response ?? "",
        };
      },
      invalidatesTags: [{ type: TAG.SCHEDULE, id: "LIST" }],
    }),
  }),
});

export const {
  useGetUserDetailsForRosterQuery,
  useGetUserFilterDataQuery,
  useGetWeeklyOffQuery,
  useUpdateWeeklyOffMutation,
  useUpdateIndividualScheduleMutation,
  useViewIndividualScheduleQuery,
  useCancelIndividualScheduleMutation,
  useGetScheduleHomePageQuery,
  useCancelScheduleConfirmationMutation,
  useGetAppControlSettingsByLocCodeQuery,
  useLazyGetAppControlSettingsByLocCodeQuery,
  useCancelScheduleBulkConfirmationMutation,
  useCancelScheduleBulkMutation,
} = individualRosterApi;
