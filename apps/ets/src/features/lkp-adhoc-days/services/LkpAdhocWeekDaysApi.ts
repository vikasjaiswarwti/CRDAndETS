import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  LkpAdhocWeekDay,
  CreateLkpAdhocWeekDayDto,
  UpdateLkpAdhocWeekDayDto,
  LkpAdhocWeekDayListParams,
  PaginatedResponse,
} from "../types/Lkpadhocweekdays.types";

export const lkpAdhocWeekDaysApi = createApi({
  reducerPath: "lkpAdhocWeekDaysApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["LkpAdhocWeekDay"],
  endpoints: (builder) => ({
    getAllLkpAdhocWeekDays: builder.query<
      PaginatedResponse<LkpAdhocWeekDay>,
      LkpAdhocWeekDayListParams
    >({
      query: ({
        searchTerm = "",
        sortColumn = "",
        sortOrder = "",
        page,
        pageSize,
      }) => ({
        url: "/api/v1/LkpAdhocWeekDays",
        params: { searchTerm, sortColumn, sortOrder, page, pageSize },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: "LkpAdhocWeekDay" as const,
                id,
              })),
              { type: "LkpAdhocWeekDay", id: "LIST" },
            ]
          : [{ type: "LkpAdhocWeekDay", id: "LIST" }],
    }),

    getLkpAdhocWeekDayById: builder.query<LkpAdhocWeekDay, string>({
      query: (id) => `/api/v1/LkpAdhocWeekDays/${id}`,
      providesTags: (_result, _err, id) => [{ type: "LkpAdhocWeekDay", id }],
    }),

    createLkpAdhocWeekDay: builder.mutation<
      LkpAdhocWeekDay,
      CreateLkpAdhocWeekDayDto
    >({
      query: (body) => ({
        url: "/api/v1/LkpAdhocWeekDays",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "LkpAdhocWeekDay", id: "LIST" }],
    }),

    updateLkpAdhocWeekDay: builder.mutation<
      LkpAdhocWeekDay,
      UpdateLkpAdhocWeekDayDto
    >({
      query: ({ id, ...body }) => ({
        url: `/api/v1/LkpAdhocWeekDays/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: "LkpAdhocWeekDay", id },
        { type: "LkpAdhocWeekDay", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllLkpAdhocWeekDaysQuery,
  useGetLkpAdhocWeekDayByIdQuery,
  useCreateLkpAdhocWeekDayMutation,
  useUpdateLkpAdhocWeekDayMutation,
} = lkpAdhocWeekDaysApi;
