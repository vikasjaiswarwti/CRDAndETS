import { createApi } from "@reduxjs/toolkit/query/react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import {
  type FetchReportRequest, type ReportCategory, type ReportRow,
  type ShiftOption,
  type UserOption,
  type CreateApiPayload
} from "../types/reports.types"

export const reportApi = createApi({
  reducerPath: "reportApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["MyReport"],
  endpoints: (builder) => ({

    // ── My-reports registry ─────────────────────────────────────────────────
    getMyReports: builder.query<ReportCategory[], void>({
      query: () => ({
        url: "/api/v1/ReportConfigs/my-reports",
        method: "GET",
      }),

      transformResponse: (response: ReportCategory[]) => {
        return response;
      },

      providesTags: (result) =>
        result
          ? [
            ...result.map(({ category }) => ({
              type: "MyReport" as const,
              category,
            })),
            { type: "MyReport", id: "LIST" },
          ]
          : [{ type: "MyReport", id: "LIST" }],
    }),
    getMyOfficeShift: builder.query<ShiftOption[], { locCode: number | null, tripType: number | null, tripdate: string }>({
      query: ({ locCode, tripType, tripdate }) => ({
        url: "/api/v1/MstShiftControl/GetShiftFilterWise",
        params: { locCode, tripType, tripdate },
      }),
      transformResponse: (response: any) => {
        console.log("API RESPONSE", response);
        const jsonShift = response.result?.[0]?.jsonShift;
        if (!jsonShift) return [];
        return JSON.parse(jsonShift) as ShiftOption[];
      },
    }),

    getUserListDDL: builder.query<UserOption[], { locCode: number; name: string }>({
      query: ({ locCode, name }) => ({
        url: "/api/v1/Report/getUserListDDL",
        params: { locCode, Name: name },
      }),
      transformResponse: (response: any): UserOption[] => {
        let list = response;
        if (typeof list === "string") {
          try {
            list = JSON.parse(list);
          } catch {
            list = [];
          }
        }
        if (!Array.isArray(list)) {
          list = list?.data ?? list?.result ?? list?.items ?? [];
        }
        return (list as any[]).map((u) => ({
          value: u.EmpId ?? u.empId ?? u.userId ?? u.id,
          label:
            u.Name ??
            u.empName ??
            u.name ??
            u.fullName ??
            u.employeeName ??
            String(u.EmpId ?? u.empId ?? u.id ?? ""),
        }));
      },
    }),

    fetchReport: builder.mutation<ReportRow[], FetchReportRequest>({
      queryFn: async (
        { endpoint, method, body, queryParams },
        _queryApi,
        _extraOptions,
        baseQuery,
      ) => {
        const result = await baseQuery({
          url: endpoint,
          method,
          // GET requests can't carry a body, but query params are valid on
          // any method — forward them regardless so a POST report can still
          // send select fields via the query string (see ReportExtraFilters).
          body: method === "POST" ? body : undefined,
          params: queryParams,
        });

        if (result.error) {
          return { error: result.error as FetchBaseQueryError };
        }

        const raw = result.data;

        if (Array.isArray(raw)) {
          return { data: raw as ReportRow[] };
        }

        if (raw && typeof raw === "object") {
          const obj = raw as Record<string, unknown>;

          // Explicit "data" wrapper
          if (Array.isArray(obj["data"])) {
            return { data: obj["data"] as ReportRow[] };
          }

          // Find first array-valued key (some APIs wrap under a custom key)
          const firstArrayKey = Object.keys(obj).find((k) =>
            Array.isArray(obj[k]),
          );
          if (firstArrayKey) {
            return { data: obj[firstArrayKey] as ReportRow[] };
          }
        }

        return { data: [] };
      },
    }),
  createReportConfig: builder.mutation<void, CreateApiPayload>({
  query: (body) => ({
    url: "/api/v1/ReportConfigs",
    method: "POST",
    body,
  }),
  invalidatesTags: [{ type: "MyReport", id: "LIST" }], // refresh the registry
}),
  }),
});

export const {
  useGetMyReportsQuery,
  useGetMyOfficeShiftQuery,
  useGetUserListDDLQuery,
  useFetchReportMutation,
  useCreateReportConfigMutation,
} = reportApi;
