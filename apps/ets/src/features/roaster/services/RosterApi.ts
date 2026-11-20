// src/features/roster/services/RosterApi.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  RosterSupervisor,
  UserShift,
  ScheduleEntry,
  UpdateSchedulesDto,
  CancelScheduleDto,
  ViewScheduleParams,
  BulkUploadResponse,
  BulkUploadParams,
  SchedulerTemplateRow,
  SchedulerTemplateParams,
  WiseIdOption,
} from "../types/Roster.types";

export interface AdhocRequestDto {
  locCode:string | number;
  tripDate: string;
  tripType: string | number;
  shiftId: number;
  reqBy: number;
  reqFor: string;
  remarks: string;
}

export interface AdhocApprovalItem {
  id: string | number;
  [key: string]: unknown;
}

export interface AdhocApprovalListResponse {
  items: AdhocApprovalItem[];
  totalCount: number;
}

const TAG = {
  SUPERVISOR: "RosterSupervisor",
  SHIFT: "RosterShift",
  SCHEDULE: "RosterSchedule",
} as const;

export const rosterApi = createApi({
  reducerPath: "rosterApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [TAG.SUPERVISOR, TAG.SHIFT, TAG.SCHEDULE],

  endpoints: (builder) => ({
    // ── GET /api/v1/TransRoster/GetRosterSuperVisorList ───────────────────
    // getRosterSupervisors: builder.query<RosterSupervisor[], void>({
    //   query: () => ({ url: "/api/v1/TransRoster/GetRosterSuperVisorList" }),
    //   transformResponse: (
    //     res: RosterSupervisor[] | { data?: RosterSupervisor[] },
    //   ) => (Array.isArray(res) ? res : (res.data ?? [])),
    //   providesTags: [{ type: TAG.SUPERVISOR, id: "LIST" }],
    // }),

    getPickupAgainstDropShift: builder.query<
      UserShift[],
      { locCode: number; pickShiftID: number }
    >({
      query: ({ locCode, pickShiftID }) => ({
        url: "/api/v1/MstShiftControl/GetPickupAgainsDropShift",
        params: { locCode, pickShiftID },
      }),
      keepUnusedDataFor: 0,
      transformResponse: (res: any) => {
        try {
          const raw = res?.result?.[0]?.jsonShiftsDrop;
          const arr = typeof raw === "string" ? JSON.parse(raw) : (raw ?? []);
          return (arr as any[])
            .filter((s) => s.ShiftId !== 0)
            .map((s) => ({
              shiftId: s.ShiftId,
              shiftCode: s.ShiftTime,
              shiftName: s.ShiftTime,
              shiftStart: s.ShiftTime,
              shiftEnd: s.ShiftTime,
            }));
        } catch {
          return [];
        }
      },
    }),

    // getRosterSupervisors: builder.query<RosterSupervisor[], number>({
    //   query: (locCode) => ({
    //     url: "/api/v1/TransRoster/GetRosterSuperVisorList",
    //     params: { LocCode: locCode },
    //   }),
    //   transformResponse: (
    //     res: RosterSupervisor[] | { data?: RosterSupervisor[] },
    //   ) => (Array.isArray(res) ? res : (res.data ?? [])),
    //   providesTags: [{ type: TAG.SUPERVISOR, id: "LIST" }],
    // }),

    getRosterSupervisors: builder.query<
      RosterSupervisor[],
      { locCode: number; pickShift?: number; dropShift?: number }
    >({
      query: ({ locCode, pickShift, dropShift }) => ({
        url: "/api/v1/TransRoster/GetRosterSuperVisorList",
        params: {
          LocCode: locCode,
          PickShift: pickShift,
          DropShift: dropShift,
        },
      }),
      transformResponse: (
        res: RosterSupervisor[] | { data?: RosterSupervisor[] },
      ) => (Array.isArray(res) ? res : (res.data ?? [])),
      providesTags: [{ type: TAG.SUPERVISOR, id: "LIST" }],
    }),

    // ── GET /api/v1/MstShiftControl/GetUserShiftWeb ───────────────────────
    // Returns pickShifts and dropShifts separately — DO NOT merge them.
    // keepUnusedDataFor: 0 ensures no stale cache when location changes.
    getUserShifts: builder.query<
      { pickShifts: UserShift[]; dropShifts: UserShift[] },
      number
    >({
      query: (locCode) => ({
        url: "/api/v1/MstShiftControl/GetUserShiftWeb",
        params: { locCode },
      }),
      keepUnusedDataFor: 0,
      transformResponse: (res: any) => {
        const parseShifts = (raw: any): UserShift[] => {
          try {
            const arr = typeof raw === "string" ? JSON.parse(raw) : (raw ?? []);
            return (arr as any[])
              .filter((s) => s.Shiftid !== 0)
              .map((s) => ({
                shiftId: s.Shiftid,
                shiftCode: s.ShiftTime,
                shiftName: s.ShiftTime,
                shiftStart: s.ShiftTime,
                shiftEnd: s.ShiftTime,
              }));
          } catch {
            return [];
          }
        };
        const result = res?.result?.[0];
        if (!result) return { pickShifts: [], dropShifts: [] };
        return {
          pickShifts: parseShifts(result.pickShifts),
          dropShifts: parseShifts(result.dropShifts),
        };
      },
      providesTags: (_res, _err, locCode) => [
        { type: TAG.SHIFT, id: String(locCode) },
      ],
    }),

    // ── GET /api/v1/TransRoster/scheduler-upload-template ─────────────────
    // Returns pre-filled employee rows as JSON; client converts to XLSX.
    // locCode is required. loginUser = current user's numeric ID from auth.
    getSchedulerTemplate: builder.query<
      SchedulerTemplateRow[],
      SchedulerTemplateParams
    >({
      query: ({ locCode, loginUser }) => ({
        url: "/api/v1/TransRoster/scheduler-upload-template",
        params: { locCode, loginUser },
      }),
      transformResponse: (res: any) => res?.templates ?? [],
    }),

    // ── POST /api/v1/TransRoster/UpdateSchedules ──────────────────────────
    updateSchedules: builder.mutation<void, UpdateSchedulesDto>({
      query: (body) => ({
        url: "/api/v1/TransRoster/UpdateSchedules",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: TAG.SCHEDULE, id: "LIST" }],
    }),

    // ── GET /api/v1/TransRoster/ViewSchedules ─────────────────────────────
    viewSchedule: builder.query<ScheduleEntry[], ViewScheduleParams>({
      query: ({ empId, dateFrom, dateTo }) => ({
        url: "/api/v1/TransRoster/ViewSchedules",
        params: { empId, dateFrom, dateTo },
      }),
      transformResponse: (
        res: ScheduleEntry[] | { data?: ScheduleEntry[] },
      ) => {
        const raw = Array.isArray(res) ? res : (res.data ?? []);
        return raw.map((entry, index) => ({
          ...entry,
          empCode: entry.empCode ?? String(entry.empid ?? index),
          id: `${entry.empid ?? index}-${entry.scheduleDate}-${entry.locCode}-${index}`,
        }));
      },
      providesTags: [{ type: TAG.SCHEDULE, id: "LIST" }],
    }),

    // ── POST /api/v1/TransRoster/CancelSchedules ──────────────────────────
    cancelSchedule: builder.mutation<void, CancelScheduleDto>({
      query: (body) => ({
        url: "/api/v1/TransRoster/CancelSchedules",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: TAG.SCHEDULE, id: "LIST" }],
    }),

    // ── POST /api/v1/UserApp/UserAdhocRequest ─────────────────────────────
    submitAdhocRequest: builder.mutation<void, AdhocRequestDto>({
      query: (body) => ({
        url: "/api/v1/UserApp/UserAdhocRequest",
        method: "POST",
        body,
      }),
    }),

    // ── GET /api/v1/UserApp/AdhocRequestApprovalList ──────────────────────
    getAdhocApprovalList: builder.query<
      AdhocApprovalListResponse,
      { globalUserId: string; recordNumber: number; pageSize: number }
    >({
      query: ({ globalUserId, recordNumber, pageSize }) => ({
        url: "/api/v1/UserApp/AdhocRequestApprovalList",
        params: {
          GlobalUserID: globalUserId,
          RecordNumber: recordNumber,
          PageSize: pageSize,
        },
      }),
      transformResponse: (response: unknown): AdhocApprovalListResponse => {
        const source = response as {
          items?: unknown[];
          data?: unknown[] | { items?: unknown[]; totalCount?: number };
          result?: unknown[] | { items?: unknown[]; totalCount?: number };
          totalCount?: number;
          total?: number;
        };
        const nested =
          (source.data && !Array.isArray(source.data) ? source.data : null) ??
          (source.result && !Array.isArray(source.result) ? source.result : null);
        const rawItems = Array.isArray(response)
          ? response
          : source.items ??
            (Array.isArray(source.data) ? source.data : nested?.items) ??
            (Array.isArray(source.result) ? source.result : []) ??
            [];
        const items = rawItems.filter(
          (item): item is Record<string, unknown> =>
            Boolean(item) && typeof item === "object",
        );
        return {
          items: items.map((item, index) => {
            const candidate =
              item.id ??
              item.requestId ??
              item.RequestId ??
              item.reqId ??
              item.ReqId;
            const id =
              typeof candidate === "string" || typeof candidate === "number"
                ? candidate
                : index;
            return { ...item, id };
          }),
          totalCount:
            source.totalCount ??
            source.total ??
            nested?.totalCount ??
            items.length,
        };
      },
      providesTags: [{ type: TAG.SCHEDULE, id: "ADHOC_APPROVAL" }],
    }),

    // ── POST /api/v1/UserApp/AdhocRequestApprove ──────────────────────────
    approveAdhocRequests: builder.mutation<void, string>({
      query: (requestId) => ({
        url: "/api/v1/UserApp/AdhocRequestApprove",
        method: "POST",
        body: { RequestId: requestId },
      }),
      invalidatesTags: [{ type: TAG.SCHEDULE, id: "ADHOC_APPROVAL" }],
    }),

    // ── POST /api/v1/TransRoster/RosterBulkUpload ─────────────────────────
    rosterBulkUpload: builder.mutation<BulkUploadResponse, BulkUploadParams>({
      query: ({ locCode, file }) => {
        const formData = new FormData();
        formData.append("LocCode", String(locCode));
        formData.append("FileUpload", file);
        return {
          url: "/api/v1/TransRoster/RosterBulkUpload",
          method: "POST",
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: [{ type: TAG.SCHEDULE, id: "LIST" }],
    }),

    getShiftValidation: builder.query<number, number>({
      query: (locCode) => ({
        url: `/api/v1/AppControl/shift-validation/${locCode}`,
      }),
      keepUnusedDataFor: 0,
      transformResponse: (res: any): number => {
        if (typeof res === "number") return res;
        if (Array.isArray(res) && res.length > 0) {
          const f = res[0];
          return Number(f?.validationType ?? f?.ValidationType ?? f?.type ?? 1);
        }
        return Number(
          res?.validationType ?? res?.ValidationType ?? res?.type ?? 1,
        );
      },
    }),

    getLookupBasedonShiftValidation: builder.query<WiseIdOption[], number>({
      query: (locCode) => ({
        url: "/api/v1/TransRoster/LookupBasedonShiftValidation",
        params: { LocCode: locCode },
      }),
      keepUnusedDataFor: 0,
      transformResponse: (res: any): WiseIdOption[] => {
        try {
          // Response: [{ lookupWithShiftValidation: "<JSON string>" }]
          const raw = Array.isArray(res) ? res[0] : res;
          const jsonStr = raw?.lookupWithShiftValidation;
          return typeof jsonStr === "string" ? JSON.parse(jsonStr) : [];
        } catch {
          return [];
        }
      },
    }),

    getRosterSupervisorsByWiseId: builder.query<
      RosterSupervisor[],
      {
        locCode: number;
        wiseId: string;
        pickShift?: number;
        dropShift?: number;
      }
    >({
      query: ({ locCode, wiseId, pickShift = 0, dropShift = 0 }) => ({
        url: "/api/v1/TransRoster/GetRosterSuperVisorListByWiseID",
        params: {
          LocCode: locCode,
          PickShift: pickShift,
          DropShift: dropShift,
          WiseId: wiseId,
        },
      }),
      keepUnusedDataFor: 0,
      transformResponse: (res: any): RosterSupervisor[] => {
        const arr = Array.isArray(res) ? res : (res?.data ?? []);
        return arr.map((m: any) => ({
          ...m,
          empCode: m.empCode ?? String(m.empId ?? ""),
        }));
      },
    }),
  }),
});

export const {
  useGetRosterSupervisorsQuery,
  useGetPickupAgainstDropShiftQuery,
  useGetUserShiftsQuery,
  useLazyGetSchedulerTemplateQuery,
  useUpdateSchedulesMutation,
  useViewScheduleQuery,
  useCancelScheduleMutation,
  useSubmitAdhocRequestMutation,
  useGetAdhocApprovalListQuery,
  useApproveAdhocRequestsMutation,
  useRosterBulkUploadMutation,

  useLazyGetShiftValidationQuery,
  useGetLookupBasedonShiftValidationQuery,
  useGetRosterSupervisorsByWiseIdQuery,
} = rosterApi;
