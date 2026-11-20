import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  ShiftInterval,
  CreateShiftIntervalDto,
  UpdateShiftIntervalDto,
  ShiftIntervalListParams,
  PaginatedResponse,
} from "../types/shiftinterval.types";

export const shiftIntervalApi = createApi({
  reducerPath: "shiftIntervalApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ShiftInterval"],
  endpoints: (builder) => ({
    getShiftIntervals: builder.query<
      PaginatedResponse<ShiftInterval>,
      ShiftIntervalListParams
    >({
      query: ({
        searchTerm = "",
        sortColumn = "",
        sortOrder = "",
        page,
        pageSize,
      }) => ({
        url: "/api/v1/LkpShiftInterval",
        params: { searchTerm, sortColumn, sortOrder, page, pageSize },
      }),
      transformResponse: (raw: any): PaginatedResponse<ShiftInterval> => ({
        items: raw.items ?? raw.data ?? (Array.isArray(raw) ? raw : []),
        total:
          raw.total ?? raw.totalCount ?? (Array.isArray(raw) ? raw.length : 0),
        page: raw.page ?? 1,
        pageSize: raw.pageSize ?? 10,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: "ShiftInterval" as const,
                id,
              })),
              { type: "ShiftInterval", id: "LIST" },
            ]
          : [{ type: "ShiftInterval", id: "LIST" }],
    }),

    getShiftIntervalById: builder.query<ShiftInterval, string>({
      query: (id) => `/api/v1/LkpShiftInterval/${id}`,
      providesTags: (_, __, id) => [{ type: "ShiftInterval", id }],
    }),

    createShiftInterval: builder.mutation<
      ShiftInterval,
      CreateShiftIntervalDto
    >({
      query: (body) => ({
        url: "/api/v1/LkpShiftInterval",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ShiftInterval", id: "LIST" }],
    }),

    updateShiftInterval: builder.mutation<
      ShiftInterval,
      UpdateShiftIntervalDto
    >({
      query: ({ id, ...body }) => ({
        url: `/api/v1/LkpShiftInterval/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "ShiftInterval", id },
        { type: "ShiftInterval", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetShiftIntervalsQuery,
  useGetShiftIntervalByIdQuery,
  useCreateShiftIntervalMutation,
  useUpdateShiftIntervalMutation,
} = shiftIntervalApi;
