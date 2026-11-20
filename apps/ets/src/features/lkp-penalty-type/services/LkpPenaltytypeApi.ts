import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  LkpPenaltyType,
  CreateLkpPenaltyTypeDto,
  UpdateLkpPenaltyTypeDto,
  LkpPenaltyTypeListParams,
  PaginatedResponse,
} from "../types/Lkppenaltytype.types";

export const lkpPenaltyTypeApi = createApi({
  reducerPath: "lkpPenaltyTypeApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["LkpPenaltyType"],
  endpoints: (builder) => ({
    getAllLkpPenaltyTypes: builder.query<
      PaginatedResponse<LkpPenaltyType>,
      LkpPenaltyTypeListParams
    >({
      query: ({
        searchTerm = "",
        sortColumn = "",
        sortOrder = "",
        page,
        pageSize,
      }) => ({
        url: "/api/v1/LkpPenaltyType",
        params: { searchTerm, sortColumn, sortOrder, page, pageSize },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ penaltyType_ID }) => ({
                type: "LkpPenaltyType" as const,
                id: penaltyType_ID,
              })),
              { type: "LkpPenaltyType", id: "LIST" },
            ]
          : [{ type: "LkpPenaltyType", id: "LIST" }],
    }),

    getLkpPenaltyTypeById: builder.query<LkpPenaltyType, string>({
      query: (id) => `/api/v1/LkpPenaltyType/${id}`,
      providesTags: (_result, _err, id) => [{ type: "LkpPenaltyType", id }],
    }),

    createLkpPenaltyType: builder.mutation<
      LkpPenaltyType,
      CreateLkpPenaltyTypeDto
    >({
      query: (body) => ({
        url: "/api/v1/LkpPenaltyType",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "LkpPenaltyType", id: "LIST" }],
    }),

    updateLkpPenaltyType: builder.mutation<
      LkpPenaltyType,
      UpdateLkpPenaltyTypeDto
    >({
      query: ({ id, ...body }) => ({
        url: `/api/v1/LkpPenaltyType/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: "LkpPenaltyType", id },
        { type: "LkpPenaltyType", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllLkpPenaltyTypesQuery,
  useGetLkpPenaltyTypeByIdQuery,
  useCreateLkpPenaltyTypeMutation,
  useUpdateLkpPenaltyTypeMutation,
} = lkpPenaltyTypeApi;
