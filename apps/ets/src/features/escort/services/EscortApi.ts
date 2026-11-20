import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  Escort,
  CreateEscortDto,
  UpdateEscortDto,
  EscortListParams,
  PaginatedResponse,
} from "../types/Escort.types";

export const escortApi = createApi({
  reducerPath: "escortApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Escort"],
  endpoints: (builder) => ({
    getAllEscorts: builder.query<PaginatedResponse<Escort>, EscortListParams>({
      query: (params) => {
        const {
          searchTerm = "",
          sortColumn = "",
          sortOrder = "",
          page,
          pageSize,
        } = params;

        return {
          url: "/api/v1/Escorts",
          params: { searchTerm, sortColumn, sortOrder, page, pageSize },
        };
      },
      transformResponse: (response: any): PaginatedResponse<Escort> => ({
        items: response.items ?? response.data ?? [],
        totalCount: response.totalCount ?? response.total ?? 0,
        page: response.page ?? 1,
        pageSize: response.pageSize ?? 10,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ mstEscort_Id }) => ({
                type: "Escort" as const,
                id: mstEscort_Id,
              })),
              { type: "Escort", id: "LIST" },
            ]
          : [{ type: "Escort", id: "LIST" }],
    }),

    createEscort: builder.mutation<Escort, CreateEscortDto>({
      query: (body) => ({
        url: "/api/v1/Escorts",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Escort", id: "LIST" }],
    }),

    updateEscort: builder.mutation<Escort, UpdateEscortDto>({
      query: ({ id, ...body }) => ({
        url: `/api/v1/Escorts/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Escort", id },
        { type: "Escort", id: "LIST" },
      ],
    }),

    bulkUploadEscorts: builder.mutation<void, CreateEscortDto[]>({
      query: (body) => ({
        url: "/api/v1/Escorts/bulk-upload",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Escort", id: "LIST" }],
    }),

    // Additional useful endpoint
    getEscortById: builder.query<Escort, string>({
      query: (id) => `/api/v1/Escorts/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Escort", id }],
    }),
  }),
});

export const {
  useGetAllEscortsQuery,
  useCreateEscortMutation,
  useUpdateEscortMutation,
  useBulkUploadEscortsMutation,
  useGetEscortByIdQuery,
} = escortApi;
