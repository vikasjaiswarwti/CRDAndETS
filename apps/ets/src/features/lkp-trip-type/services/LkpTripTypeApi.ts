import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  LkpTripType,
  CreateLkpTripTypeDto,
  UpdateLkpTripTypeDto,
  LkpTripTypeListParams,
  PaginatedResponse,
} from "../types/Lkptriptype";

export const lkpTripTypeApi = createApi({
  reducerPath: "lkpTripTypeApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["LkpTripType"],
  endpoints: (builder) => ({
    getAllLkpTripTypes: builder.query<
      PaginatedResponse<LkpTripType>,
      LkpTripTypeListParams
    >({
      query: ({
        searchTerm = "",
        sortColumn = "",
        sortOrder = "",
        page,
        pageSize,
      }) => ({
        url: "/api/v1/LkpTripType",
        params: { searchTerm, sortColumn, sortOrder, page, pageSize },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: "LkpTripType" as const,
                id,
              })),
              { type: "LkpTripType", id: "LIST" },
            ]
          : [{ type: "LkpTripType", id: "LIST" }],
    }),

    getLkpTripTypeById: builder.query<LkpTripType, string>({
      query: (id) => `/api/v1/LkpTripType/${id}`,
      providesTags: (_result, _err, id) => [{ type: "LkpTripType", id }],
    }),

    createLkpTripType: builder.mutation<LkpTripType, CreateLkpTripTypeDto>({
      query: (body) => ({
        url: "/api/v1/LkpTripType",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "LkpTripType", id: "LIST" }],
    }),

    updateLkpTripType: builder.mutation<LkpTripType, UpdateLkpTripTypeDto>({
      query: ({ id, ...body }) => ({
        url: `/api/v1/LkpTripType/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: "LkpTripType", id },
        { type: "LkpTripType", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllLkpTripTypesQuery,
  useGetLkpTripTypeByIdQuery,
  useCreateLkpTripTypeMutation,
  useUpdateLkpTripTypeMutation,
} = lkpTripTypeApi;
