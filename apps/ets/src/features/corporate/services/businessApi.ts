import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  Business,
  CreateBusinessDto,
  UpdateBusinessDto,
  BusinessListParams,
  PaginatedResponse,
} from "../types/Business.types";

export const businessApi = createApi({
  reducerPath: "businessApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Business"],
  endpoints: (builder) => ({
    getBusinesses: builder.query<
      PaginatedResponse<Business>,
      BusinessListParams
    >({
      query: ({
        searchTerm = "",
        sortColumn = "",
        sortOrder = "",
        page,
        pageSize,
      }) => ({
        url: "/api/v1/Business",
        params: { searchTerm, sortColumn, sortOrder, page, pageSize },
      }),
      transformResponse: (raw: any): PaginatedResponse<Business> => ({
        items: raw.items ?? raw.data ?? (Array.isArray(raw) ? raw : []),
        total:
          raw.total ?? raw.totalCount ?? (Array.isArray(raw) ? raw.length : 0),
        page: raw.page ?? 1,
        pageSize: raw.pageSize ?? 10,
      }),
      providesTags: (result) =>
        result
          ? [
            ...result.items.map(({ businessId }) => ({
              type: "Business" as const,
              businessId,
            })),
            { type: "Business", id: "LIST" },
          ]
          : [{ type: "Business", id: "LIST" }],
    }),

    getBusinessById: builder.query<Business, string>({
      query: (id) => `/api/v1/Business/${id}`,
      providesTags: (_, __, id) => [{ type: "Business", id }],
    }),

    createBusiness: builder.mutation<Business, CreateBusinessDto>({
      query: (body) => ({
        url: "/api/v1/Business",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Business", id: "LIST" }],
    }),

    updateBusiness: builder.mutation<Business, UpdateBusinessDto>({
      query: ({ businessId, ...body }) => ({
        url: `/api/v1/Business/UpdateBusiness`,
        method: "POST",
        body: {
          ...body,
          BusinessId: businessId
        },
      }),
      invalidatesTags: (_, __, { businessId }) => [
        { type: "Business", businessId },
        { type: "Business", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetBusinessesQuery,
  useGetBusinessByIdQuery,
  useCreateBusinessMutation,
  useUpdateBusinessMutation,
} = businessApi;
