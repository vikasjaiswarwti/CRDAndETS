import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  CreateScheduleFromMasterDto,
  CreateScheduleFromMasterResponse,
  MasterWeeklyScheduleItem,
  MasterWeeklyScheduleListParams,
  MasterWeeklyScheduleRawResponse,
  PaginatedResponse,
  UpdateMasterScheduleDto,
  UpdateMasterScheduleResponse,
} from "../types/masterWeeklySchedule.types";

export const masterWeeklyScheduleApi = createApi({
  reducerPath: "masterWeeklyScheduleApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["MasterWeeklySchedule"],
  endpoints: (builder) => ({
    getMasterWeeklySchedule: builder.query<
      PaginatedResponse<MasterWeeklyScheduleItem>,
      MasterWeeklyScheduleListParams
    >({
      query: (body) => ({
        url: "/api/v1/TransRoster/masterSchedule",
        method: "POST",
        body,
      }),
      transformResponse: (
        raw: MasterWeeklyScheduleRawResponse,
        _meta,
        arg,
      ) => {
        const items = raw?.result ?? [];
        return {
          items,
          totalCount: raw?.total ?? 0,
          page: arg.page,
          pageSize: arg.pageSize,
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ commutrId }) => ({
                type: "MasterWeeklySchedule" as const,
                id: commutrId,
              })),
              { type: "MasterWeeklySchedule", id: "LIST" },
            ]
          : [{ type: "MasterWeeklySchedule", id: "LIST" }],
    }),

    updateMasterSchedule: builder.mutation<
      UpdateMasterScheduleResponse,
      UpdateMasterScheduleDto
    >({
      query: (body) => ({
        url: "/api/v1/TransRoster/UpdateMasterSchedule",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { empID }) => [
        { type: "MasterWeeklySchedule", id: empID },
        { type: "MasterWeeklySchedule", id: "LIST" },
      ],
    }),

    createScheduleFromMaster: builder.mutation<
      CreateScheduleFromMasterResponse,
      CreateScheduleFromMasterDto
    >({
      query: (body) => ({
        url: "/api/v1/TransRoster/CreateScheduleFromMaster",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetMasterWeeklyScheduleQuery,
  useLazyGetMasterWeeklyScheduleQuery,
  useUpdateMasterScheduleMutation,
  useCreateScheduleFromMasterMutation,
} = masterWeeklyScheduleApi;
