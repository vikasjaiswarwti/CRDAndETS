import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import {  type ReportCategory, type UpdateReportRolesRequest } from "../types/reports.types"

export const reportPermissionApi = createApi({
  reducerPath: "reportPermissionApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["MyReportPermission"],
  endpoints: (builder) => ({

    // ── My-reports registry ─────────────────────────────────────────────────
    getMyReports: builder.query<ReportCategory[], void>({
      query: () => ({
        url: "/api/v1/ReportConfigs/my-reports",
        method: "GET",
      }),

      transformResponse: (response: ReportCategory[]) => {
        // console.log("API Response:", response);
        return response;
      },

      providesTags: (result) =>
        result
          ? [
            ...result.map(({ category }) => ({
              type: "MyReportPermission" as const,
              category,
            })),
            { type: "MyReportPermission", id: "LIST" },
          ]
          : [{ type: "MyReportPermission", id: "LIST" }],
    }),
    updateReportRoles: builder.mutation<void, UpdateReportRolesRequest>({
      query: (body) => ({
        url: "/api/v1/ReportConfigs/roles",
        method: "PUT",
        body,
      }),
      invalidatesTags: [{ type: "MyReportPermission", id: "LIST" }],
    }),
  }),
});

export const {
  useGetMyReportsQuery,
  useUpdateReportRolesMutation
} = reportPermissionApi;
