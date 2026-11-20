import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  LkpLocation,
  CreateLkpLocationDto,
  UpdateLkpLocationDto,
  LkpLocationListParams,
  PaginatedResponse,
} from "../types/lkpLocation.types";

export const lkpLocationApi = createApi({
  reducerPath: "lkpLocationApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["LkpLocation"],

  endpoints: (builder) => ({
    // ── GET list ──────────────────────────────────────────────────────────────
    getAllLkpLocations: builder.query<
      PaginatedResponse<LkpLocation>,
      LkpLocationListParams
    >({
      query: ({
        searchTerm = "",
        sortColumn = "",
        sortOrder = "",
        page = 1,
        pageSize = 10,
      }) => ({
        url: "/api/v1/LkpLocation",
        params: { searchTerm, sortColumn, sortOrder, page, pageSize },
      }),

      // Backend returns full PaginatedResponse, so we just pass it through
      // Added safety in case it ever returns a plain array
      transformResponse: (response: any): PaginatedResponse<LkpLocation> => {
        if (Array.isArray(response)) {

            console.log('response from lkplocation api', response);

          return {
            items: response,
            page: 1,
            pageSize: response.length,
            totalCount: response.length,
            hasNextPage: false,
            hasPrevPage: false,
          };
        }
        return response; // Already correct shape
      },

      providesTags: (result) =>
        result
          ? [
              ...(result.items || []).map(({ lkpLocation_Id }) => ({
                type: "LkpLocation" as const,
                id: lkpLocation_Id,
              })),
              { type: "LkpLocation", id: "LIST" },
            ]
          : [{ type: "LkpLocation", id: "LIST" }],
    }),

    // ── GET by ID ─────────────────────────────────────────────────────────────
    getLkpLocationById: builder.query<LkpLocation, string>({
      query: (id) => ({ url: `/api/v1/LkpLocation/${id}` }),
      providesTags: (_result, _err, id) => [{ type: "LkpLocation", id }],
    }),

    // ── POST create ───────────────────────────────────────────────────────────
    createLkpLocation: builder.mutation<LkpLocation, CreateLkpLocationDto>({
      query: (body) => ({
        url: "/api/v1/LkpLocation",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "LkpLocation", id: "LIST" }],
    }),

    // ── PUT update ────────────────────────────────────────────────────────────
    updateLkpLocation: builder.mutation<LkpLocation, UpdateLkpLocationDto>({
      query: ({ id, ...body }) => ({
        url: `/api/v1/LkpLocation/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: "LkpLocation", id },
        { type: "LkpLocation", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllLkpLocationsQuery,
  useGetLkpLocationByIdQuery,
  useCreateLkpLocationMutation,
  useUpdateLkpLocationMutation,
} = lkpLocationApi;
