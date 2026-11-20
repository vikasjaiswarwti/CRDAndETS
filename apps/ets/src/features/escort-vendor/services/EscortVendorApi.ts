import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  EscortVendor,
  CreateEscortVendorDto,
  UpdateEscortVendorDto,
  EscortVendorListParams,
  PaginatedResponse,
} from "../types/Escortvendor.types";

export const escortVendorApi = createApi({
  reducerPath: "escortVendorApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["EscortVendor"],

  endpoints: (builder) => ({
    // ── GET All Escort Vendors ─────────────────────────────────────────────
    getAllEscortVendors: builder.query<
      PaginatedResponse<EscortVendor>, // ← Fixed: Generic with EscortVendor
      EscortVendorListParams
    >({
      query: ({
        searchTerm = "",
        sortColumn = "",
        sortOrder = "",
        page,
        pageSize,
      }) => ({
        url: "/api/v1/EscortVendors",
        params: { searchTerm, sortColumn, sortOrder, page, pageSize },
      }),

      // You can keep a simple transformResponse if needed, but it's usually not required
      transformResponse: (response: any): PaginatedResponse<EscortVendor> => ({
        items: response.items ?? [],
        totalCount: response.totalCount ?? 0,
        page: response.page ?? 1,
        pageSize: response.pageSize ?? 10,
      }),

      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ mstEscortVendor_Id }) => ({
                type: "EscortVendor" as const,
                id: mstEscortVendor_Id,
              })),
              { type: "EscortVendor", id: "LIST" },
            ]
          : [{ type: "EscortVendor", id: "LIST" }],
    }),

    // ── CREATE Escort Vendor ───────────────────────────────────────────────
    createEscortVendor: builder.mutation<EscortVendor, CreateEscortVendorDto>({
      query: (body) => ({
        url: "/api/v1/EscortVendors",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "EscortVendor", id: "LIST" }],
    }),

    // ── UPDATE Escort Vendor ───────────────────────────────────────────────
    updateEscortVendor: builder.mutation<EscortVendor, UpdateEscortVendorDto>({
      query: ({ id, ...body }) => ({
        url: `/api/v1/EscortVendors/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "EscortVendor", id },
        { type: "EscortVendor", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllEscortVendorsQuery,
  useCreateEscortVendorMutation,
  useUpdateEscortVendorMutation,
} = escortVendorApi;
